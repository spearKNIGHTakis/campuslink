// src/lib/theme.js
export const B = {
  deepPurple:    '#1A0533',
  richPurple:    '#3B0F6E',
  midPurple:     '#6B21A8',
  vibrantPurple: '#A855F7',
  softPurple:    '#E9D5FF',
  palePurple:    '#F5F0FF',
  coral:         '#FF6B6B',
  mint:          '#06D6A0',
  gold:          '#FBBF24',
  inkDark:       '#0D0118',
  inkMid:        '#1E0A35',
  inkLight:      '#2D1550',
  ghostPurple:   '#7C5B9E',
  snowWhite:     '#FEFCFF',
  fogGray:       '#F0EBF8',
  dustPurple:    '#C4B5D8',
  white:         '#FFFFFF',
}

export const DARK_THEME = {
  bg:      B.inkDark,
  surface: B.inkMid,
  card:    '#1A0A2E',
  border:  B.inkLight,
  text:    '#EDE8FF',
  muted:   B.ghostPurple,
  primary: B.vibrantPurple,
}

export const LIGHT_THEME = {
  bg:      B.fogGray,
  surface: B.snowWhite,
  card:    B.snowWhite,
  border:  B.softPurple,
  text:    B.richPurple,
  muted:   B.dustPurple,
  primary: B.midPurple,
}

export const font = "'Plus Jakarta Sans', sans-serif"
