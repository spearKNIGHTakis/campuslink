// src/components/feed/MobileTrending.jsx
// Horizontal trending strip shown at top of mobile feed
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTrendingHashtags } from '@/lib/hashtags'
import Icon from '@/components/ui/Icon'
import { B } from '@/lib/theme'

export default function MobileTrending() {
  const navigate = useNavigate()
  const [tags, setTags] = useState([])

  useEffect(() => {
    getTrendingHashtags(8).then(setTags)
  }, [])

  if (!tags.length) return null

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <Icon name="trending" size={13} color={B.vibrantPurple} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cl-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trending</span>
        <button onClick={() => navigate('/explore')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: B.vibrantPurple, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>
          Explore <Icon name="chevronRight" size={9} color={B.vibrantPurple} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {tags.map(t => (
          <button key={t.tag} onClick={() => navigate('/explore')} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 20,
            background: `${B.vibrantPurple}12`, border: `1px solid ${B.vibrantPurple}30`,
            color: B.vibrantPurple, fontWeight: 700, fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
            whiteSpace: 'nowrap',
          }}>
            <Icon name="hashtag" size={10} color={B.vibrantPurple} />
            {t.tag}
            {t.score >= 5 && <Icon name="fire" size={9} color={B.coral} />}
          </button>
        ))}
      </div>
    </div>
  )
}
