import { AppLayout } from "@/components/synapse/AppLayout";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Book, MessageCircle, Mail } from "lucide-react";

const faqs = [
  ["What file types can I upload?", "PDF, DOCX, TXT, and Markdown today. Audio, video, and web URLs are rolling out next."],
  ["How is my data used?", "Documents stay in your workspace. Extraction runs on isolated workers and is never used for training."],
  ["Which LLMs power the synthesizer?", "By default GPT-5, Claude Opus 4, and Gemini 2.5 Pro. You can toggle additional models in the Orchestrator."],
  ["Can I export the graph?", "Yes — JSON, GraphML, and CSV exports are available from the Graph and Extraction pages."],
];

const Help = () => (
  <AppLayout
    eyebrow="Support"
    title="Help center"
    description="Docs, FAQs, and ways to reach the team."
  >
    <div className="grid gap-6 lg:grid-cols-3">
      {[
        { icon: Book, title: "Documentation", desc: "Guides, API reference, and tutorials" },
        { icon: MessageCircle, title: "Community", desc: "Join Discord & swap workflows" },
        { icon: Mail, title: "Contact", desc: "Reach support@synapse.app" },
      ].map((c) => (
        <Card key={c.title} className="border-border/60 p-5 shadow-soft transition-shadow hover:shadow-elevated">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <c.icon className="h-5 w-5" />
          </div>
          <div className="font-display text-base font-semibold">{c.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
        </Card>
      ))}
    </div>

    <Card className="mt-6 border-border/60 p-5 shadow-soft">
      <h3 className="mb-3 font-display text-base font-semibold">Frequently asked</h3>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map(([q, a], i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-sm">{q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  </AppLayout>
);

export default Help;
