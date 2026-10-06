import { ModulePage } from '../components/common/ModulePage';
import { TyresPanel } from '../components/tyres/TyresPanel';

export function Tyres() {
  return <ModulePage title="Tyres" description="Tread, pressure and fitting">{(v) => <TyresPanel vehicle={v} />}</ModulePage>;
}