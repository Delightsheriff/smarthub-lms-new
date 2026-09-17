"use client";
import { useState } from "react";
import {
  Bot,
  ChevronDown,
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
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
import { OREO_SUGGESTIONS, type OreoSuggestionMode } from "../config/suggestions";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { useAskOreo, useOreoUsage } from "../api/oreo.queries";
import type { AskAnswer } from "../types";

interface TranscriptTurn {
  role: "user" | "assistant";
  content: string;
  answer?: AskAnswer;
}

/** Oreo — the AI assistant. Single conversation per visit; "New chat"
 *  clears it. Answers render the safe markdown subset; each assistant
 *  turn carries a collapsed "How I got this" developer view of the tool
 *  steps Oreo took to build it. */
export function OreoPageContent() {
  const { mode } = useEffectiveMode();
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState<TranscriptTurn | null>(null);
  const ask = useAskOreo();
  const usage = useOreoUsage();

  const suggestions =
    OREO_SUGGESTIONS[mode as OreoSuggestionMode] ?? OREO_SUGGESTIONS.student;

  const submit = async (text: string) => {
    const q = text.trim();
    if (!q || ask.isPending) return;
    setTurns((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setPending({ role: "assistant", content: "…" });
    try {
      const answer = await ask.mutateAsync(q);
      setPending(null);
      setTurns((prev) => [...prev, { role: "assistant", content: "", answer }]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setPending(null);
      setTurns((prev) => [
        ...prev,
        { role: "assistant", content: message, answer: undefined },
      ]);
    }
  };

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col space-y-4">
      {/* Single source of quota truth — in the masthead description.
          The separate muted strip that echoed this was removed (plan 011). */}
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · AI Knowledge Assistant`}
        title="Ask Oreo"
        description={
          usage.data ? (
            usage.data.unlimited ? (
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
                  {usage.data.tokensLeft.toLocaleString()}
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
            onClick={() => setTurns([])}
            disabled={turns.length === 0}
            className="rounded-xl"
          >
            <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
            New chat
          </Button>
        }
      />

      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="min-h-0 flex-1 rounded-2xl border border-border bg-card shadow-sm">
          <MessageScrollerViewport>
            <MessageScrollerContent className="p-4 sm:p-6">
              {turns.length === 0 && !pending && (
                <div className="space-y-6 pt-4">
                  <div className="mx-auto max-w-md text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                      <Bot className="h-7 w-7" />
                    </span>
                    <p className="mt-4 font-display text-xl sm:text-2xl font-semibold text-foreground">What do you want to know?</p>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                      Ask about your upcoming deadlines, grades, timetable, or pick a prompt below.
                    </p>
                  </div>

                  {/* Suggestions as a numbered, hairline-divided list */}
                  <div className="mx-auto max-w-xl border-t border-border">
                    {suggestions.map((s, i) => (
                      <button
                        key={s.prompt}
                        type="button"
                        onClick={() => void submit(s.prompt)}
                        disabled={ask.isPending}
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
                  key={i}
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

              {pending && (
                <MessageScrollerItem scrollAnchor={turns.length === 0}>
                  <AssistantBubble turn={pending} isPending />
                </MessageScrollerItem>
              )}
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
          placeholder="Ask Oreo anything…"
          className="flex-1 rounded-xl"
        />
        <Button type="submit" className="rounded-xl" disabled={ask.isPending || !question.trim()}>
          {ask.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
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

function AssistantBubble({
  turn,
  isPending = false,
}: {
  turn: TranscriptTurn;
  isPending?: boolean;
}) {
  return (
    <Message align="start">
      <MessageAvatar className="size-8 bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </MessageAvatar>
      <MessageContent>
        <Bubble variant="outline">
          <BubbleContent>
            {isPending ? (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Oreo is thinking…
              </span>
            ) : turn.answer ? (
              <AnswerMarkdown source={turn.answer.answer} />
            ) : (
              <p className="text-sm text-destructive">{turn.content}</p>
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

/** Hairline ledger-style tool-step rows — one row per step, mono labels. */
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