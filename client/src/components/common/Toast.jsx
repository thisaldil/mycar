import { Toaster as SonnerToaster, toast } from 'sonner';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSettings } from '../../context/SettingsContext';

export { toast };

export function Toaster() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { resolvedTheme } = useSettings();
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position={isMobile ? 'top-center' : 'bottom-right'}
      richColors
      closeButton
      duration={3500}
      toastOptions={{ className: 'font-sans' }} />);


}