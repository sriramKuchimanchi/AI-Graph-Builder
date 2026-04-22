import { AppLayout } from "@/components/synapse/AppLayout";
import { SearchPanel } from "@/components/synapse/SearchPanel";

const SearchPage = () => (
  <AppLayout
    eyebrow="Step 5"
    title="Semantic Search"
    description="Ask questions in natural language. The system traverses the graph and synthesizes an answer from multiple LLMs."
  >
    <SearchPanel />
  </AppLayout>
);

export default SearchPage;
