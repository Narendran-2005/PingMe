export const COLORS = {
  iconRailBg: '#0D1117',
  sidebarBg: '#131920',
  mainBg: '#161B1F',
  surface: '#1C2730',
  border: '#1E2D35',
  primaryAccent: '#1FD89C',
  secondaryAccent: '#38BFA0',
  cyanHighlight: '#67C9E0',
  mutedText: '#4A7B6F',
  bodyText: '#A8C4BC',
  headingText: '#C8E6E0',
  onlineIndicator: '#23A55A',
  awayIndicator: '#F0B232',
  offlineIndicator: '#4A7B6F',
  error: '#E24B4A',
};

export const THEME = {
  background: {
    primary: COLORS.mainBg,
    secondary: COLORS.sidebarBg,
    surface: COLORS.surface,
    sidebar: COLORS.sidebarBg,
    rail: COLORS.iconRailBg,
  },
  text: {
    heading: COLORS.headingText,
    body: COLORS.bodyText,
    muted: COLORS.mutedText,
    accent: COLORS.primaryAccent,
  },
  accent: {
    primary: COLORS.primaryAccent,
    secondary: COLORS.secondaryAccent,
    cyan: COLORS.cyanHighlight,
  },
  border: {
    default: COLORS.border,
  },
  status: {
    online: COLORS.onlineIndicator,
    away: COLORS.awayIndicator,
    offline: COLORS.offlineIndicator,
  },
  error: COLORS.error,
};
