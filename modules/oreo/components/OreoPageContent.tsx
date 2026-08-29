"use client";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  CircleHelp,
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { OREO_SUGGESTIONS, type OreoSuggestionMode } from "@/lib/api/mock/oreo-canned";
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
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, pending]);

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

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Ask Oreo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your courses, fees, attendance, schedule and internship — ask
            anything.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTurns([])}
          disabled={turns.length === 0}
        >
          <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
          New chat
        </Button>
      </header>

      <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        {usage.data ? (
          usage.data.unlimited
            ? "Unlimited usage this month"
            : `${usage.data.tokensUsed.toLocaleString()} used · ${usage.data.tokensLeft.toLocaleString()} left`
        ) : (
          "Usage meter…"
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1 rounded-xl border bg-card">
        <div className="p-4 space-y-4">
          {turns.length === 0 && !pending && (
            <div className="space-y-6 pt-2">
              <div className="mx-auto max-w-md text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </span>
                <p className="mt-3 font-semibold">What do you want to know?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try one of the prompts below to get a real answer.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    onClick={() => void submit(s)}
                    disabled={ask.isPending}
                  >
                    <CircleHelp className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {turns.map((turn, i) =>
            turn.role === "user" ? (
              <UserBubble key={i} text={turn.content} />
            ) : (
              <AssistantBubble key={i} turn={turn} />
            ),
          )}

          {pending && <AssistantBubble turn={pending} isPending />}

          <div ref={endRef} />
        </div>
      </ScrollArea>

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
          className="flex-1"
        />
        <Button type="submit" disabled={ask.isPending || !question.trim()}>
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
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
        {text}
      </div>
    </div>
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
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
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
        </div>
        {turn.answer?.data && turn.answer.data.length > 0 && (
          <HowIGotThis steps={turn.answer.data} tools={turn.answer.toolsUsed} />
        )}
      </div>
    </div>
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
        <UserRound className="h-3 w-3" />
        How I got this
        <ChevronDown className="h-3 w-3 transition-transform data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 text-xs">
        <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="space-y-0.5">
              <p className="font-mono text-[11px] font-medium">
                <span className="text-primary">{step.tool}</span>
                {step.args ? (
                  <span className="text-muted-foreground">
                    {" "}
                    {JSON.stringify(step.args)}
                  </span>
                ) : null}
              </p>
              {step.result && (
                <p
                  className={
                    "text-[11px] " +
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
          ))}
          {tools.length > 0 && (
            <p className="pt-1 text-[11px] text-muted-foreground">
              Tools used: {tools.join(", ")}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}