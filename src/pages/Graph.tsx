import { AppLayout } from "@/components/synapse/AppLayout";
import { GraphView } from "@/components/synapse/GraphView";

const Graph = () => (
  <AppLayout
    eyebrow="Step 3"
    title="Knowledge Graph"
    description="Interactive visualization of entities and the relationships between them."
  >
    <GraphView />
  </AppLayout>
);

export default Graph;
