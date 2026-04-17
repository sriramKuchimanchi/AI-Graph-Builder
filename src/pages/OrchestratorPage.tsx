import { AppLayout } from "@/components/synapse/AppLayout";
import { Orchestrator } from "@/components/synapse/Orchestrator";

const OrchestratorPage = () => (
  <AppLayout
    eyebrow="Step 4"
    title="LLM Orchestrator"
    description="Send queries to multiple LLMs in parallel. The synthesizer reconciles their responses into one answer."
  >
    <Orchestrator />
  </AppLayout>
);

export default OrchestratorPage;
