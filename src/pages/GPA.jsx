// src/pages/GPA.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { calcGPA, calcCGPA, GRADE_SCALE, saveGPAData, getGPAData } from '@/lib/gpa'
import { Card, Btn, Modal, Input } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

function GPABar({ gpa, max = 4.0 }) {
  const pct  = (gpa / max) * 100
  const color = gpa >= 3.5 ? B.mint : gpa >= 2.5 ? B.gold : B.coral
  return (
    <div style={{ background: 'var(--cl-bg)', borderRadius: 12, height: 12, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 12, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: `0 0 10px ${color}60` }} />
    </div>
  )
}

function ClassifyGPA(gpa) {
  if (gpa >= 3.6) return { label: 'First Class', color: B.mint }
  if (gpa >= 3.0) return { label: 'Second Class Upper', color: B.vibrantPurple }
  if (gpa >= 2.5) return { label: 'Second Class Lower', color: B.gold }
  if (gpa >= 2.0) return { label: 'Third Class', color: B.coral }
  return { label: 'Below Average', color: B.coral }
}

function SemesterBlock({ sem, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(index === 0)
  const gpa   = calcGPA(sem.courses || [])
  const klass = ClassifyGPA(gpa)

  function addCourse() {
    onUpdate({ ...sem, courses: [...(sem.courses || []), { name: '', courseCode: '', credits: 3, grade: 'B' }] })
  }

  function updateCourse(i, field, val) {
    const courses = sem.courses.map((c, ci) => ci === i ? { ...c, [field]: field === 'credits' ? Number(val) : val } : c)
    onUpdate({ ...sem, courses })
  }

  function removeCourse(i) {
    onUpdate({ ...sem, courses: sem.courses.filter((_, ci) => ci !== i) })
  }

  return (
    <Card style={{ marginBottom: 12 }}>
      <div onClick={() => setExpanded(e => !e)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expanded ? 14 : 0 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--cl-text)' }}>{sem.name || `Semester ${index + 1}`}</div>
          <div style={{ fontSize: 12, color: 'var(--cl-muted)', marginTop: 2 }}>{sem.courses?.length || 0} courses · GPA: <span style={{ fontWeight: 700, color: klass.color }}>{gpa.toFixed(2)}</span> · {klass.label}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: klass.color }}>{gpa.toFixed(2)}</div>
          <span style={{ color: 'var(--cl-muted)', fontSize: 18 }}>{expanded ? '⌃' : '⌄'}</span>
        </div>
      </div>

      {expanded && (
        <div>
          <GPABar gpa={gpa} />
          <div style={{ marginTop: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Course Name', 'Code', 'Credits', 'Grade', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--cl-muted)', borderBottom: `1px solid var(--cl-border)` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(sem.courses || []).map((c, ci) => (
                  <tr key={ci}>
                    <td style={{ padding: '6px 8px' }}>
                      <input value={c.name} onChange={e => updateCourse(ci, 'name', e.target.value)} placeholder="e.g. Calculus I" style={{ background: 'transparent', border: 'none', color: 'var(--cl-text)', fontSize: 13, width: '100%', outline: 'none' }} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input value={c.courseCode} onChange={e => updateCourse(ci, 'courseCode', e.target.value)} placeholder="MATH 101" style={{ background: 'transparent', border: 'none', color: 'var(--cl-muted)', fontSize: 12, width: '80px', outline: 'none' }} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <select value={c.credits} onChange={e => updateCourse(ci, 'credits', e.target.value)} style={{ background: 'var(--cl-bg)', border: `1px solid var(--cl-border)`, borderRadius: 6, padding: '3px 6px', color: 'var(--cl-text)', fontSize: 12 }}>
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <select value={c.grade} onChange={e => updateCourse(ci, 'grade', e.target.value)} style={{ background: 'var(--cl-bg)', border: `1px solid var(--cl-border)`, borderRadius: 6, padding: '3px 6px', color: 'var(--cl-text)', fontSize: 12 }}>
                        {GRADE_SCALE.map(g => <option key={g.grade} value={g.grade}>{g.grade} ({g.point})</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <button onClick={() => removeCourse(ci)} style={{ background: 'none', border: 'none', color: B.coral, cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn variant="ghost" size="sm" onClick={addCourse}>+ Add Course</Btn>
            <Btn variant="danger" size="sm" onClick={onDelete}>Delete Semester</Btn>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function GPA() {
  const { user } = useAuth()
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    getGPAData(user.uid).then(data => {
      setSemesters(data.semesters || [])
      setLoading(false)
    })
  }, [user.uid])

  const cgpa  = calcCGPA(semesters)
  const klass = ClassifyGPA(cgpa)

  function addSemester() {
    const yr  = Math.ceil((semesters.length + 1) / 2)
    const sem = semesters.length % 2 === 0 ? 1 : 2
    setSemesters(s => [...s, { name: `Year ${yr} Semester ${sem}`, courses: [] }])
  }

  function updateSemester(i, updated) {
    setSemesters(s => s.map((sem, si) => si === i ? updated : sem))
  }

  function deleteSemester(i) {
    setSemesters(s => s.filter((_, si) => si !== i))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveGPAData(user.uid, { semesters })
      toast.success('GPA data saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="page-container" style={{ textAlign: 'center', paddingTop: 60, color: 'var(--cl-muted)' }}>Loading…</div>

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)' }}>📊 GPA Tracker</div>
          <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginTop: 2 }}>Private — only visible to you</div>
        </div>
        <Btn onClick={handleSave} disabled={saving} size="sm">{saving ? 'Saving…' : '💾 Save'}</Btn>
      </div>

      {/* CGPA summary card */}
      <div style={{ background: `linear-gradient(135deg, ${B.deepPurple}, ${B.richPurple} 60%, ${B.midPurple})`, borderRadius: 20, padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `${B.vibrantPurple}25`, filter: 'blur(25px)' }} />
        <div style={{ fontSize: 12, color: `${B.softPurple}90`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Cumulative GPA</div>
        <div style={{ fontSize: 56, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{cgpa.toFixed(2)}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: klass.color, marginBottom: 16 }}>{klass.label}</div>
        <GPABar gpa={cgpa} />
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          <div><div style={{ fontSize: 11, color: `${B.softPurple}80` }}>Semesters</div><div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{semesters.length}</div></div>
          <div><div style={{ fontSize: 11, color: `${B.softPurple}80` }}>Total Courses</div><div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{semesters.reduce((s, sem) => s + (sem.courses?.length || 0), 0)}</div></div>
          <div><div style={{ fontSize: 11, color: `${B.softPurple}80` }}>Scale</div><div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>4.0</div></div>
        </div>
      </div>

      {/* Semester-by-semester */}
      {semesters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--cl-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 16, marginBottom: 8 }}>No semesters yet</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Add your first semester to start tracking</div>
          <Btn onClick={addSemester}>+ Add Semester</Btn>
        </div>
      ) : (
        <>
          {semesters.map((sem, i) => (
            <SemesterBlock key={i} sem={sem} index={i}
              onUpdate={updated => updateSemester(i, updated)}
              onDelete={() => deleteSemester(i)} />
          ))}
          <Btn variant="ghost" onClick={addSemester} style={{ width: '100%', padding: 12, marginTop: 4 }}>+ Add Semester</Btn>
        </>
      )}
    </div>
  )
}
