import { AppLayout } from "@/components/synapse/AppLayout";
import { ExtractionPanel } from "@/components/synapse/ExtractionPanel";

const Extraction = () => (
  <AppLayout
    eyebrow="Step 2"
    title="Entity & Relationship Extraction"
    description="Entities and relationships extracted from your documents, with confidence scores."
  >
    <ExtractionPanel />
  </AppLayout>
);

export default Extraction;
