import { AppLayout } from "@/components/synapse/AppLayout";
import { UploadPanel } from "@/components/synapse/UploadPanel";

const Documents = () => (
  <AppLayout
    eyebrow="Step 1"
    title="Documents"
    description="Upload PDFs, DOCX, or TXT files. They'll be parsed, chunked, and prepared for entity extraction."
  >
    <UploadPanel />
  </AppLayout>
);

export default Documents;
