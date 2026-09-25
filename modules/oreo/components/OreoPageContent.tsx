"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
  Square,
} from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useAuthStore } from "@/store/slices/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { OREO_SUGGESTIONS, type OreoSuggestionMode } from "../config/suggestions";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { useAskOreo, useOreoUsage, OREO_QUERY_KEYS } from "../api/oreo.queries";
import { streamAsk, type OreoMode } from "../api/oreo.service";
import { OREO_ENDPOINTS } from "../config/endpoints";
import type { AskAnswer, AskHistoryTurn, AskTurn, AskUsageSummary } from "../types";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${performance.now()}`;

export function OreoPageContent() {
  const { mode } = useEffectiveMode();
  const userName = useAuthStore((s) => s.user?.firstName) || undefined;
  const [turns, setTurns] = useState<AskTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveUsage, setLiveUsage] = useState<AskUsageSummary | null>(null);

  const askOneShot = useAskOreo();
  const usageQuery = useOreoUsage();
  const usage = liveUsage ?? usageQuery.data ?? null;
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const suggestions =
    OREO_SUGGESTIONS[mode as OreoSuggestionMode] ?? OREO_SUGGESTIONS.student;

  // Abort any in-flight stream when the page unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setTurns((prev) =>
      prev.map((t) => (t.streaming ? { ...t, streaming: false, status: "" } : t)),
    );
  };

  const handleNewChat = () => {
    handleStop();
    setTurns([]);
  };

  const submit = async (text: string) => {
    const q = text.trim();
    if (!q || isStreaming) return;

    // Snapshot prior turns as history before adding the new turn
    const history: AskHistoryTurn[] = turns
      .filter((t) => !t.error && t.content)
      .map((t) => ({
        role: t.role,
        content: t.content,
      }));

    const userTurn: AskTurn = { id: newId(), role: "user", content: q };
    const assistantId = newId();
    const assistantTurn: AskTurn = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
      status: "",
    };

    setTurns((prev) => [...prev, userTurn, assistantTurn]);
    setQuestion("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const patchAssistant = (updater: (t: AskTurn) => AskTurn) => {
      setTurns((prev) =>
        prev.map((t) => (t.id === assistantId ? updater(t) : t)),
      );
    };

    let streamCompleted = false;

    try {
      await streamAsk(
        OREO_ENDPOINTS.STREAM,
        { question: q, history, mode: (mode as OreoMode) || "student", userName },
        {
          onStatus: (m) => patchAssistant((t) => ({ ...t, status: m })),
          onToken: (d) => patchAssistant((t) => ({ ...t, content: t.content + d })),
          onReset: () => patchAssistant((t) => ({ ...t, content: "" })),
          onDone: (answer) => {
            streamCompleted = true;
            if (answer.monthUsage) setLiveUsage(answer.monthUsage);
            patchAssistant((t) => ({
              ...t,
              answer,
              content: answer.answer,
              streaming: false,
              status: "",
            }));
            setIsStreaming(false);
            queryClient.invalidateQueries({ queryKey: OREO_QUERY_KEYS.usage });
          },
          onError: () => {
            // Signal error so fallback executes
            streamCompleted = false;
          },
        },
        controller.signal,
      );
    } catch {
      streamCompleted = false;
    }

    // If streaming was aborted by user, do not fallback
    if (controller.signal.aborted) {
      setIsStreaming(false);
      return;
    }

    // Fallback to one-shot call if streaming did not complete
    if (!streamCompleted) {
      try {
        patchAssistant((t) => ({ ...t, status: "Retrieving response...", content: "" }));
        const oneShotAnswer = await askOneShot.mutateAsync({
          question: q,
          history,
          mode: (mode as OreoMode) || "student",
        });
        if (oneShotAnswer.monthUsage) setLiveUsage(oneShotAnswer.monthUsage);
        patchAssistant((t) => ({
          ...t,
          answer: oneShotAnswer,
          content: oneShotAnswer.answer,
          streaming: false,
          status: "",
        }));
      } catch (fallbackError) {
        const errorMsg =
          fallbackError instanceof Error
            ? fallbackError.message
            : "Something went wrong. Please try again.";
        patchAssistant((t) => ({
          ...t,
          error: errorMsg,
          content: errorMsg,
          streaming: false,
          status: "",
        }));
      } finally {
        setIsStreaming(false);
      }
    }
  };

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col space-y-4">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · AI Knowledge Assistant`}
        title="Ask Oreo"
        description={
          usage ? (
            usage.unlimited ? (
              <>
                Your personal LMS guide.{" "}
                <strong className="text-foreground">Unlimited</strong> queries enabled.{" "}
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                  LMS Grounded
                </span>
              </>
            ) : (
              <>
                Your personal LMS guide.{" "}
                <strong className="text-foreground">
                  {usage.tokensLeft.toLocaleString()}
                </strong>{" "}
                tokens available this cycle.{" "}
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                  LMS Grounded
                </span>
              </>
            )
          ) : (
            "Your courses, fees, attendance, schedule, and internship — ask anything."
          )
        }
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewChat}
            disabled={turns.length === 0}
            className="rounded-xl"
          >
            <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
            New chat
          </Button>
        }
      />

      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="min-h-0 flex-1 rounded-2xl border border-border bg-card shadow-xs">
          <MessageScrollerViewport>
            <MessageScrollerContent className="p-4 sm:p-6">
              {turns.length === 0 && (
                <div className="space-y-6 pt-4">
                  <div className="mx-auto max-w-md text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                      <Bot className="h-7 w-7" />
                    </span>
                    <p className="mt-4 font-display text-xl sm:text-2xl font-semibold text-foreground">
                      What do you want to know?
                    </p>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                      Ask about your upcoming deadlines, grades, timetable, or pick a prompt below.
                    </p>
                  </div>

                  {/* Suggestions list */}
                  <div className="mx-auto max-w-xl border-t border-border">
                    {suggestions.map((s, i) => (
                      <button
                        key={s.prompt}
                        type="button"
                        onClick={() => void submit(s.prompt)}
                        disabled={isStreaming}
                        className="flex w-full items-center gap-3 border-b border-border py-3 text-left hover:bg-muted/30 transition-colors disabled:opacity-50"
                      >
                        <span className="font-mono text-xs tabular-nums text-muted-foreground w-6 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-sm font-medium text-foreground leading-snug">
                          {s.prompt}
                        </span>
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {turns.map((turn, i) => (
                <MessageScrollerItem
                  key={turn.id || i}
                  scrollAnchor={
                    turn.role === "user" && i === turns.length - 1
                  }
                >
                  {turn.role === "user" ? (
                    <UserBubble text={turn.content} />
                  ) : (
                    <AssistantBubble turn={turn} />
                  )}
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="end" />
        </MessageScroller>
      </MessageScrollerProvider>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(question);
        }}
      >
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={isStreaming ? "Oreo is replying..." : "Ask Oreo anything…"}
          disabled={isStreaming}
          className="flex-1 rounded-xl"
        />
        {isStreaming ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleStop}
            className="rounded-xl gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop
          </Button>
        ) : (
          <Button
            type="submit"
            className="rounded-xl"
            disabled={!question.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <Message align="end">
      <MessageContent>
        <Bubble align="end">
          <BubbleContent>{text}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

function AssistantBubble({ turn }: { turn: AskTurn }) {
  return (
    <Message align="start">
      <MessageAvatar className="size-8 bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </MessageAvatar>
      <MessageContent>
        <Bubble variant="outline">
          <BubbleContent>
            {turn.streaming ? (
              <div className="space-y-2">
                {turn.status && (
                  <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    {turn.status}
                  </p>
                )}
                {turn.content ? (
                  <AnswerMarkdown source={turn.content} />
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking…
                  </span>
                )}
              </div>
            ) : turn.answer ? (
              <AnswerMarkdown source={turn.answer.answer || turn.content} />
            ) : (
              <p className="text-sm text-destructive">
                {turn.error || turn.content || "Something went wrong."}
              </p>
            )}
          </BubbleContent>
        </Bubble>
        {turn.answer?.data && turn.answer.data.length > 0 && (
          <HowIGotThis steps={turn.answer.data} tools={turn.answer.toolsUsed} />
        )}
      </MessageContent>
    </Message>
  );
}

function HowIGotThis({
  steps,
  tools,
}: {
  steps: AskAnswer["data"];
  tools: string[];
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronDown className="h-3 w-3 transition-transform data-panel-open:rotate-180" />
        How I got this
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1.5 text-xs">
        <div className="border-t border-border">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-border py-2">
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground shrink-0 w-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] font-medium text-primary truncate">
                  {step.tool}
                  {step.args && (
                    <span className="text-muted-foreground ml-1">
                      {JSON.stringify(step.args)}
                    </span>
                  )}
                </p>
                {step.result && (
                  <p
                    className={
                      "text-[11px] truncate " +
                      (step.result.ok === false
                        ? "text-destructive"
                        : "text-muted-foreground")
                    }
                  >
                    {step.result.ok === false && step.result.error
                      ? step.result.error
                      : step.result.data
                        ? JSON.stringify(step.result.data)
                        : "ok"}
                  </p>
                )}
              </div>
            </div>
          ))}
          {tools.length > 0 && (
            <p className="pt-2 text-[11px] text-muted-foreground font-mono">
              Tools: {tools.join(", ")}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}