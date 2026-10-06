// Mirrors the CSS variables in index.css so charts match the active theme.
export const CHART_THEMES = {
  light: {
    brand: '#1E40DC',
    brandSoft: '#E8EDFF',
    ink: '#0D1117',
    muted: '#646C7A',
    grid: '#E2E5EA',
    surface: '#FFFFFF',
    success: '#117A46',
    warning: '#A35600',
    danger: '#C4202A',
    groups: { fuel: '#1E40DC', maintenance: '#0E9F8E', repair: '#D97706', other: '#A3ACBA' },
    categorical: ['#1E40DC', '#0E9F8E', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#65A30D', '#A3ACBA', '#EA580C', '#475569', '#9333EA', '#15803D']
  },
  dark: {
    brand: '#7C98FF',
    brandSoft: '#1D264A',
    ink: '#EEF0F4',
    muted: '#8E96A3',
    grid: '#262B34',
    surface: '#13161C',
    success: '#58CE8C',
    warning: '#F0B248',
    danger: '#F87171',
    groups: { fuel: '#7C98FF', maintenance: '#2DD4BF', repair: '#F0B248', other: '#64748B' },
    categorical: ['#7C98FF', '#2DD4BF', '#F0B248', '#A78BFA', '#F472B6', '#22D3EE', '#A3E635', '#64748B', '#FB923C', '#94A3B8', '#C084FC', '#4ADE80']
  }
};