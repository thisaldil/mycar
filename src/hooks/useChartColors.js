import { useSettings } from '../context/SettingsContext';
import { CHART_THEMES } from '../utils/chartTheme';

export function useChartColors() {
  const { resolvedTheme } = useSettings();
  return CHART_THEMES[resolvedTheme] || CHART_THEMES.light;
}