import { Header } from "@/components/synapse/Header";
import { Hero } from "@/components/synapse/Hero";
import { Stats } from "@/components/synapse/Stats";
import { UploadPanel } from "@/components/synapse/UploadPanel";
import { ExtractionPanel } from "@/components/synapse/ExtractionPanel";
import { GraphView } from "@/components/synapse/GraphView";
import { Orchestrator } from "@/components/synapse/Orchestrator";
import { SearchPanel } from "@/components/synapse/SearchPanel";
import { Footer } from "@/components/synapse/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main>
        <Hero />

        <section id="workspace" className="container py-14">
          <SectionHeading
            eyebrow="Workspace"
            title="Ingest, extract, observe"
            desc="Drop documents in. Watch entities and relationships materialize in real time."
          />

          <div className="mt-8 space-y-6">
            <Stats />
            <div className="grid gap-6 lg:grid-cols-2">
              <UploadPanel />
              <ExtractionPanel />
            </div>
          </div>
        </section>

        <section id="graph" className="border-t border-border/60 bg-muted/20 py-14">
          <div className="container">
            <SectionHeading
              eyebrow="Visualization"
              title="Explore the graph"
              desc="Pan, zoom, and trace how every entity in your corpus connects."
            />
            <div className="mt-8">
              <GraphView />
            </div>
          </div>
        </section>

        <section id="orchestrator" className="container py-14">
          <SectionHeading
            eyebrow="Multi-LLM"
            title="Orchestrate · Synthesize · Answer"
            desc="Fan a single query out to multiple models. Reconcile their answers into one trustworthy response."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Orchestrator />
            </div>
            <div id="search" className="lg:col-span-3">
              <SearchPanel />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const SectionHeading = ({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) => (
  <div className="max-w-2xl">
    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
      {eyebrow}
    </div>
    <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
    <p className="mt-3 text-base leading-relaxed text-muted-foreground">{desc}</p>
  </div>
);

export default Index;
