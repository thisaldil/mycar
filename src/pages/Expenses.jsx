import { ModulePage } from '../components/common/ModulePage';
import { ExpensesPanel } from '../components/expenses/ExpensesPanel';

export function Expenses() {
  return <ModulePage title="Expenses" description="Everything your car costs">{(v) => <ExpensesPanel vehicle={v} />}</ModulePage>;
}