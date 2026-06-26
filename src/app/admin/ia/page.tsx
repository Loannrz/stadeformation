import { readIaConfig } from '@/lib/ia-flow';
import IaFlowEditor from './IaFlowEditor';

export const dynamic = 'force-dynamic';

export default async function AdminIaPage() {
  const config = await readIaConfig();
  return <IaFlowEditor initialConfig={config} />;
}
