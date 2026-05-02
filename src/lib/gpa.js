// src/lib/gpa.js — Ghana GPA scale (4.0)
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export const GRADE_SCALE = [
  { grade: 'A+', point: 4.0, min: 90 },
  { grade: 'A',  point: 4.0, min: 80 },
  { grade: 'B+', point: 3.5, min: 75 },
  { grade: 'B',  point: 3.0, min: 70 },
  { grade: 'C+', point: 2.5, min: 65 },
  { grade: 'C',  point: 2.0, min: 60 },
  { grade: 'D+', point: 1.5, min: 55 },
  { grade: 'D',  point: 1.0, min: 50 },
  { grade: 'F',  point: 0.0, min: 0  },
]

export function gradeToPoint(grade) {
  return GRADE_SCALE.find(g => g.grade === grade)?.point ?? 0
}

export function calcGPA(courses) {
  if (!courses?.length) return 0
  const totalPoints  = courses.reduce((s, c) => s + gradeToPoint(c.grade) * c.credits, 0)
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0)
  return totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0
}

export function calcCGPA(semesters) {
  const all = semesters.flatMap(s => s.courses || [])
  return calcGPA(all)
}

export async function saveGPAData(uid, data) {
  await setDoc(doc(db, 'gpaData', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getGPAData(uid) {
  const snap = await getDoc(doc(db, 'gpaData', uid))
  return snap.exists() ? snap.data() : { semesters: [] }
}
