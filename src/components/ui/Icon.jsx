// src/components/ui/Icon.jsx
// Central icon registry using Font Awesome 6

export const ICONS = {
  // Navigation
  home:        'fa-solid fa-house',
  search:      'fa-solid fa-magnifying-glass',
  friends:     'fa-solid fa-user-group',
  groups:      'fa-solid fa-comments',
  events:      'fa-solid fa-calendar-days',
  messages:    'fa-solid fa-envelope',
  marketplace: 'fa-solid fa-book-open',
  leaderboard: 'fa-solid fa-trophy',
  assignments: 'fa-solid fa-clipboard-list',
  gpa:         'fa-solid fa-chart-line',
  studyrooms:  'fa-solid fa-landmark',
  profile:     'fa-solid fa-circle-user',
  admin:       'fa-solid fa-gear',

  // Actions
  like:        'fa-solid fa-heart',
  likeOutline: 'fa-regular fa-heart',
  comment:     'fa-regular fa-comment',
  share:       'fa-solid fa-share-nodes',
  send:        'fa-solid fa-paper-plane',
  add:         'fa-solid fa-plus',
  edit:        'fa-solid fa-pen',
  delete:      'fa-solid fa-trash',
  upload:      'fa-solid fa-arrow-up-from-bracket',
  download:    'fa-solid fa-download',
  attach:      'fa-solid fa-paperclip',
  image:       'fa-solid fa-image',
  close:       'fa-solid fa-xmark',
  back:        'fa-solid fa-arrow-left',
  more:        'fa-solid fa-ellipsis',
  check:       'fa-solid fa-check',
  refresh:     'fa-solid fa-rotate-right',
  lock:        'fa-solid fa-lock',
  unlock:      'fa-solid fa-lock-open',

  // User & verification
  verified:    'fa-solid fa-circle-check',
  badge:       'fa-solid fa-shield-halved',
  star:        'fa-solid fa-star',
  crown:       'fa-solid fa-crown',
  medal:       'fa-solid fa-medal',
  fire:        'fa-solid fa-fire',
  bolt:        'fa-solid fa-bolt',
  seedling:    'fa-solid fa-seedling',

  // Academic
  book:        'fa-solid fa-book',
  graduation:  'fa-solid fa-graduation-cap',
  university:  'fa-solid fa-building-columns',
  calculator:  'fa-solid fa-calculator',
  flask:       'fa-solid fa-flask',
  microscope:  'fa-solid fa-microscope',
  pen:         'fa-solid fa-pen-nib',
  paper:       'fa-solid fa-file',
  pdf:         'fa-solid fa-file-pdf',

  // Social
  bell:        'fa-solid fa-bell',
  bellOff:     'fa-regular fa-bell-slash',
  user:        'fa-solid fa-user',
  users:       'fa-solid fa-users',
  globe:       'fa-solid fa-globe',
  link:        'fa-solid fa-link',
  location:    'fa-solid fa-location-dot',
  clock:       'fa-regular fa-clock',
  calendar:    'fa-regular fa-calendar',

  // Status
  online:      'fa-solid fa-circle',
  warning:     'fa-solid fa-triangle-exclamation',
  info:        'fa-solid fa-circle-info',
  error:       'fa-solid fa-circle-xmark',
  success:     'fa-solid fa-circle-check',

  // Misc
  google:      'fa-brands fa-google',
  github:      'fa-brands fa-github',
  phone:       'fa-solid fa-mobile-screen',
  email:       'fa-solid fa-at',
  key:         'fa-solid fa-key',
  settings:    'fa-solid fa-sliders',
  logout:      'fa-solid fa-right-from-bracket',
  chevronDown: 'fa-solid fa-chevron-down',
  chevronRight:'fa-solid fa-chevron-right',
  bars:        'fa-solid fa-bars',
  grid:        'fa-solid fa-grip',
  list:        'fa-solid fa-list',
  filter:      'fa-solid fa-filter',
  sort:        'fa-solid fa-sort',
  coins:       'fa-solid fa-coins',
  wallet:      'fa-solid fa-wallet',
  video:       'fa-solid fa-video',
  mic:         'fa-solid fa-microphone',
  poll:        'fa-solid fa-square-poll-horizontal',
  play:        'fa-solid fa-play',
  pause:       'fa-solid fa-pause',
  volume:      'fa-solid fa-volume-high',
  muted:       'fa-solid fa-volume-xmark',
  video:       'fa-solid fa-video',
  videoSlash:  'fa-solid fa-video-slash',
  announce:    'fa-solid fa-bullhorn',
  alumni:      'fa-solid fa-user-tie',
}

/**
 * <Icon name="home" size={16} color="#A855F7" style={{}} />
 */
export default function Icon({ name, size = 16, color, style = {}, className = '' }) {
  const cls = ICONS[name] || 'fa-solid fa-circle-question'
  return (
    <i
      className={`${cls} ${className}`}
      style={{ fontSize: size, color: color || 'inherit', lineHeight: 1, display: 'inline-block', width: size, textAlign: 'center', ...style }}
    />
  )
}
