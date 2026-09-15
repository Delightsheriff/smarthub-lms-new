"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import type { CourseFaq } from "../types";

/** The course's published FAQs. Renders nothing when there are none. */
export function CourseFaqs({ faqs }: { faqs: CourseFaq[] }) {
  if (!faqs.length) return null;

  return (
    <Card className="p-0 overflow-hidden">
      <header className="px-4 py-3 border-b">
        <h2 className="font-semibold">Frequently asked questions</h2>
      </header>
      <Accordion className="divide-y">
        {faqs.map((f) => (
          <AccordionItem
            key={f.id}
            value={f.id}
            className="rounded-none border-0 bg-transparent"
          >
            <AccordionTrigger className="px-4 hover:bg-muted/50">
              {f.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-muted-foreground whitespace-pre-line">
              {f.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
