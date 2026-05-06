// src/components/ui/Icon.jsx
// Professional Font Awesome 6 icon registry
// All icons use consistent FA6 solid/regular/brands classes

export const ICONS = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  home:         'fa-solid fa-house',
  search:       'fa-solid fa-magnifying-glass',
  friends:      'fa-solid fa-user-group',
  groups:       'fa-solid fa-comments',
  events:       'fa-solid fa-calendar-days',
  messages:     'fa-solid fa-envelope',
  marketplace:  'fa-solid fa-store',
  leaderboard:  'fa-solid fa-ranking-star',
  assignments:  'fa-solid fa-clipboard-list',
  gpa:          'fa-solid fa-chart-line',
  studyrooms:   'fa-solid fa-building-columns',
  profile:      'fa-solid fa-circle-user',
  explore:      'fa-solid fa-compass',
  trending:     'fa-solid fa-arrow-trend-up',
  notifications:'fa-solid fa-bell',
  settings:     'fa-solid fa-sliders',
  admin:        'fa-solid fa-shield-halved',
  logout:       'fa-solid fa-right-from-bracket',

  // ── Actions ─────────────────────────────────────────────────────────────────
  like:         'fa-solid fa-heart',
  likeOutline:  'fa-regular fa-heart',
  comment:      'fa-regular fa-comment-dots',
  share:        'fa-solid fa-share-nodes',
  send:         'fa-solid fa-paper-plane',
  add:          'fa-solid fa-user-plus',
  addGroup:     'fa-solid fa-plus',
  edit:         'fa-solid fa-pen-to-square',
  delete:       'fa-solid fa-trash-can',
  upload:       'fa-solid fa-cloud-arrow-up',
  download:     'fa-solid fa-cloud-arrow-down',
  attach:       'fa-solid fa-paperclip',
  image:        'fa-solid fa-image',
  video:        'fa-solid fa-video',
  videoSlash:   'fa-solid fa-video-slash',
  close:        'fa-solid fa-xmark',
  back:         'fa-solid fa-arrow-left',
  forward:      'fa-solid fa-arrow-right',
  more:         'fa-solid fa-ellipsis',
  moreV:        'fa-solid fa-ellipsis-vertical',
  check:        'fa-solid fa-check',
  refresh:      'fa-solid fa-rotate-right',
  copy:         'fa-regular fa-copy',
  bookmark:     'fa-regular fa-bookmark',
  bookmarkFill: 'fa-solid fa-bookmark',
  report:       'fa-solid fa-flag',
  filter:       'fa-solid fa-filter',
  sort:         'fa-solid fa-arrow-down-wide-short',
  grid:         'fa-solid fa-grip',
  list:         'fa-solid fa-list-ul',
  expand:       'fa-solid fa-up-right-and-down-left-from-center',
  collapse:     'fa-solid fa-down-left-and-up-right-to-center',
  externalLink: 'fa-solid fa-arrow-up-right-from-square',
  hashtag:      'fa-solid fa-hashtag',
  at:           'fa-solid fa-at',

  // ── Media controls ───────────────────────────────────────────────────────────
  play:         'fa-solid fa-play',
  pause:        'fa-solid fa-pause',
  stop:         'fa-solid fa-stop',
  volume:       'fa-solid fa-volume-high',
  volumeLow:    'fa-solid fa-volume-low',
  muted:        'fa-solid fa-volume-xmark',
  fullscreen:   'fa-solid fa-expand',

  // ── User & verification ─────────────────────────────────────────────────────
  user:         'fa-solid fa-user',
  users:        'fa-solid fa-users',
  userCheck:    'fa-solid fa-user-check',
  userPlus:     'fa-solid fa-user-plus',
  userMinus:    'fa-solid fa-user-minus',
  verified:     'fa-solid fa-circle-check',
  badge:        'fa-solid fa-id-badge',
  idCard:       'fa-solid fa-id-card',
  star:         'fa-solid fa-star',
  starOutline:  'fa-regular fa-star',
  crown:        'fa-solid fa-crown',
  medal:        'fa-solid fa-medal',
  trophy:       'fa-solid fa-trophy',
  fire:         'fa-solid fa-fire',
  bolt:         'fa-solid fa-bolt',
  seedling:     'fa-solid fa-seedling',
  shield:       'fa-solid fa-shield-halved',
  lock:         'fa-solid fa-lock',
  unlock:       'fa-solid fa-lock-open',
  key:          'fa-solid fa-key',
  eye:          'fa-solid fa-eye',
  eyeSlash:     'fa-solid fa-eye-slash',
  official:     'fa-solid fa-certificate',

  // ── Academic ────────────────────────────────────────────────────────────────
  book:         'fa-solid fa-book-open',
  books:        'fa-solid fa-books',
  graduation:   'fa-solid fa-graduation-cap',
  university:   'fa-solid fa-building-columns',
  calculator:   'fa-solid fa-calculator',
  flask:        'fa-solid fa-flask',
  microscope:   'fa-solid fa-microscope',
  pen:          'fa-solid fa-pen-nib',
  paper:        'fa-solid fa-file',
  pdf:          'fa-solid fa-file-pdf',
  notes:        'fa-solid fa-file-lines',
  grade:        'fa-solid fa-a',
  clock:        'fa-regular fa-clock',
  alarm:        'fa-solid fa-bell',
  calendar:     'fa-regular fa-calendar',
  calendarPlus: 'fa-solid fa-calendar-plus',
  task:         'fa-solid fa-square-check',
  taskOutline:  'fa-regular fa-square',

  // ── Social & feed ────────────────────────────────────────────────────────────
  post:         'fa-regular fa-newspaper',
  feed:         'fa-solid fa-rectangle-list',
  poll:         'fa-solid fa-square-poll-horizontal',
  announce:     'fa-solid fa-bullhorn',
  alumni:       'fa-solid fa-user-tie',
  mentor:       'fa-solid fa-chalkboard-user',
  mic:          'fa-solid fa-microphone',
  micOff:       'fa-solid fa-microphone-slash',
  cam:          'fa-solid fa-camera',
  emoji:        'fa-regular fa-face-smile',
  gif:          'fa-solid fa-film',

  // ── Status & feedback ────────────────────────────────────────────────────────
  online:       'fa-solid fa-circle',
  offline:      'fa-regular fa-circle',
  warning:      'fa-solid fa-triangle-exclamation',
  info:         'fa-solid fa-circle-info',
  error:        'fa-solid fa-circle-xmark',
  success:      'fa-solid fa-circle-check',
  pending:      'fa-regular fa-hourglass-half',
  loading:      'fa-solid fa-spinner',

  // ── Location & contact ───────────────────────────────────────────────────────
  location:     'fa-solid fa-location-dot',
  map:          'fa-solid fa-map',
  phone:        'fa-solid fa-mobile-screen-button',
  email:        'fa-solid fa-envelope-open-text',
  link:         'fa-solid fa-link',
  globe:        'fa-solid fa-earth-africa',

  // ── Finance ──────────────────────────────────────────────────────────────────
  coins:        'fa-solid fa-coins',
  wallet:       'fa-solid fa-wallet',
  tag:          'fa-solid fa-tag',
  receipt:      'fa-solid fa-receipt',
  momo:         'fa-solid fa-money-bill-wave',
  free:         'fa-solid fa-gift',

  // ── Navigation arrows ────────────────────────────────────────────────────────
  chevronDown:  'fa-solid fa-chevron-down',
  chevronUp:    'fa-solid fa-chevron-up',
  chevronLeft:  'fa-solid fa-chevron-left',
  chevronRight: 'fa-solid fa-chevron-right',
  caretDown:    'fa-solid fa-caret-down',
  bars:         'fa-solid fa-bars',
  xmark:        'fa-solid fa-xmark',

  // ── Brands ───────────────────────────────────────────────────────────────────
  google:       'fa-brands fa-google',
  github:       'fa-brands fa-github',
  twitter:      'fa-brands fa-x-twitter',
  instagram:    'fa-brands fa-instagram',
  whatsapp:     'fa-brands fa-whatsapp',
  facebook:     'fa-brands fa-facebook',
  linkedin:     'fa-brands fa-linkedin',
}

/**
 * Professional icon component
 * <Icon name="home" size={16} color="#A855F7" className="" style={{}} />
 */
export default function Icon({ name, size = 16, color, className = '', style = {}, onClick, title }) {
  const cls = ICONS[name]
  if (!cls) {
    // Fallback for unknown icons — shows a question circle
    return (
      <i
        className={`fa-solid fa-circle-question ${className}`}
        title={`Unknown icon: ${name}`}
        style={{ fontSize: size, color: color || 'inherit', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, ...style }}
        onClick={onClick}
      />
    )
  }
  return (
    <i
      className={`${cls} ${className}`}
      title={title}
      style={{
        fontSize: size,
        color: color || 'inherit',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        flexShrink: 0,
        transition: 'color 0.15s',
        ...style,
      }}
      onClick={onClick}
    />
  )
}

// Named exports for common icons used inline
export const CheckIcon     = (p) => <Icon name="check"     {...p} />
export const CloseIcon     = (p) => <Icon name="close"     {...p} />
export const SearchIcon    = (p) => <Icon name="search"    {...p} />
export const BellIcon      = (p) => <Icon name="notifications" {...p} />
export const HeartIcon     = (p) => <Icon name="like"      {...p} />
export const CommentIcon   = (p) => <Icon name="comment"   {...p} />
export const ShareIcon     = (p) => <Icon name="share"     {...p} />
export const VerifiedIcon  = (p) => <Icon name="verified"  {...p} />
export const TrendingIcon  = (p) => <Icon name="trending"  {...p} />
export const HashtagIcon   = (p) => <Icon name="hashtag"   {...p} />
