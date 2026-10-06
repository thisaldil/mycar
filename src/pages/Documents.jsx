import { ModulePage } from '../components/common/ModulePage';
import { DocumentsPanel } from '../components/documents/DocumentsPanel';

export function Documents() {
  return <ModulePage title="Documents" description="Papers, certificates and receipts">{(v) => <DocumentsPanel vehicle={v} />}</ModulePage>;
}