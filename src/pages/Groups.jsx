// src/pages/Groups.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { listenGroups, joinGroup, leaveGroup, createGroup, isGroupMember } from '@/lib/db'
import { Card, Btn, Modal, Input, Textarea, Empty, Skeleton } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

const GROUP_ICONS = ['💻','🚀','🎓','📚','🏥','⚖️','🎤','📸','🎨','⚽','🎵','🔬','🌍','💡']

function GroupCard({ group, uid, onJoin, onLeave }) {
  const [member, setMember]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    isGroupMember(group.id, uid).then(res => { setMember(res); setChecked(true) })
  }, [group.id, uid])

  async function handleJoin() {
    setLoading(true)
    try { await joinGroup(group.id, uid); setMember(true); onJoin?.(); toast.success(`Joined ${group.name}!`) }
    catch { toast.error('Could not join group') }
    finally { setLoading(false) }
  }

  async function handleLeave() {
    setLoading(true)
    try { await leaveGroup(group.id, uid); setMember(false); onLeave?.(); toast.success(`Left ${group.name}`) }
    catch { toast.error('Could not leave group') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--cl-border)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${B.richPurple}, ${B.midPurple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: `0 4px 12px ${B.midPurple}40` }}>
        {group.icon}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13 }}>{group.name}</div>
        <div style={{ color: 'var(--cl-muted)', fontSize: 11 }}>{group.memberCount || 0} members</div>
        {group.description && <div style={{ color: 'var(--cl-muted)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{group.description}</div>}
      </div>
      {checked && (
        member
          ? <Btn variant="danger" size="sm" onClick={handleLeave} disabled={loading}>Leave</Btn>
          : <Btn variant="primary" size="sm" onClick={handleJoin} disabled={loading}>{loading ? '…' : 'Join'}</Btn>
      )}
    </div>
  )
}

export default function Groups() {
  const { user, profile } = useAuth()
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', icon: '💬', isPrivate: false })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const unsub = listenGroups(g => { setGroups(g); setLoading(false) })
    return unsub
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }))

  async function handleCreate() {
    if (!form.name.trim()) return toast.error('Group name is required')
    setCreating(true)
    try {
      await createGroup(user.uid, form)
      setForm({ name: '', description: '', icon: '💬', isPrivate: false })
      setShowCreate(false)
      toast.success('Group created!')
    } catch { toast.error('Could not create group') }
    finally { setCreating(false) }
  }

  return (
    <div>
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--cl-text)' }}>Groups</div>
        <Btn size="sm" onClick={() => setShowCreate(true)}>+ Create</Btn>
      </div>

      <Card>
        {loading
          ? [1,2,3].map(i => <Skeleton key={i} height={56} style={{ marginBottom: 10 }} />)
          : groups.length === 0
            ? <Empty icon="💬" title="No groups yet" subtitle="Create the first group for your class!" />
            : groups.map(g => (
                <GroupCard key={g.id} group={g} uid={user.uid} />
              ))
        }
      </Card>

      {/* Create group modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create a Group">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Group Name" placeholder="e.g. CS Study Hub" value={form.name} onChange={set('name')} />
          <Textarea label="Description (optional)" placeholder="What is this group about?" value={form.description} onChange={set('description')} style={{ minHeight: 70 }} />

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', marginBottom: 8 }}>Pick an icon</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GROUP_ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.icon === icon ? B.vibrantPurple : 'var(--cl-border)'}`, background: form.icon === icon ? `${B.vibrantPurple}20` : 'transparent', fontSize: 20, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isPrivate} onChange={e => setForm(f => ({ ...f, isPrivate: e.target.checked }))} />
            <span style={{ fontSize: 13, color: 'var(--cl-text)' }}>Private group (invite only)</span>
          </label>

          <Btn onClick={handleCreate} disabled={creating} style={{ width: '100%', padding: 12 }}>
            {creating ? 'Creating…' : 'Create Group'}
          </Btn>
        </div>
      </Modal>
    </div>
  )
}
