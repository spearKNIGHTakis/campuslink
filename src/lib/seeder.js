// src/lib/seeder.js — Official account seeder, run once from Admin dashboard
import { setDoc, addDoc, collection, doc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { recordHashtags } from './hashtags'

export const OFFICIAL_UIDS = {
  campuslink: 'campuslink-official',
  studytips:  'studytips-official',
  events:     'campusevents-official',
}

const OFFICIAL_ACCOUNTS = [
  {
    uid: 'campuslink-official',
    displayName: 'CampusLink GH', photoURL: '',
    university: 'All Universities', program: 'Official Account', year: '',
    bio: "Ghana's university social network. Connecting students across all campuses 🇬🇭🎓",
    status: 'approved', isVerified: true, isOfficial: true, reputationPoints: 9999,
    friendCount: 0, postCount: 0, groupCount: 0, interests: [],
  },
  {
    uid: 'studytips-official',
    displayName: 'Study Tips GH', photoURL: '',
    university: 'All Universities', program: 'Academic Support', year: '',
    bio: 'Daily study tips, exam strategies and resources for Ghanaian university students 📚',
    status: 'approved', isVerified: true, isOfficial: true, reputationPoints: 5000,
    friendCount: 0, postCount: 0, groupCount: 0, interests: [],
  },
  {
    uid: 'campusevents-official',
    displayName: 'Campus Events GH', photoURL: '',
    university: 'All Universities', program: 'Events & Activities', year: '',
    bio: 'Discover campus events, career fairs and workshops across Ghana 📅',
    status: 'approved', isVerified: true, isOfficial: true, reputationPoints: 4000,
    friendCount: 0, postCount: 0, groupCount: 0, interests: [],
  },
]

const SEEDED_POSTS = [
  {
    authorId: 'campuslink-official', authorName: 'CampusLink GH',
    authorProgram: 'Official Account', authorUniversity: 'All Universities',
    authorVerified: true, authorPoints: 9999, isOfficial: true,
    content: "🎉 Welcome to CampusLink — Ghana's first university-only social network!\n\nConnect with students across KNUST, UG, UCC, Ashesi and 6 more universities. Share notes, join study groups, and discover campus events.\n\nLet's build Ghana's most active student community together 🇬🇭 #CampusLink #GhanaStudents #University",
    hashtags: ['campuslink', 'ghanastudents', 'university'], likeCount: 47, commentCount: 12,
  },
  {
    authorId: 'campuslink-official', authorName: 'CampusLink GH',
    authorProgram: 'Official Account', authorUniversity: 'All Universities',
    authorVerified: true, authorPoints: 9999, isOfficial: true,
    content: "🏆 Students who complete their profile earn 20 reputation points and appear higher in friend suggestions.\n\nAdd your program, year, and interests to climb the leaderboard. Top contributors earn special badges every week! #Tips #CampusLink #Leaderboard",
    hashtags: ['tips', 'campuslink', 'leaderboard'], likeCount: 31, commentCount: 7,
  },
  {
    authorId: 'studytips-official', authorName: 'Study Tips GH',
    authorProgram: 'Academic Support', authorUniversity: 'All Universities',
    authorVerified: true, authorPoints: 5000, isOfficial: true,
    content: "📚 The Pomodoro Technique — proven to boost focus and retention:\n\n✅ Study for 25 minutes\n✅ 5-minute break\n✅ Repeat 4 times\n✅ 15-30 min long break\n\nYour brain consolidates memory during breaks — never skip them! Share with a coursemate 👇 #StudyTips #ExamPrep #GhanaStudents",
    hashtags: ['studytips', 'examprep', 'ghanastudents'], likeCount: 89, commentCount: 23,
  },
  {
    authorId: 'studytips-official', authorName: 'Study Tips GH',
    authorProgram: 'Academic Support', authorUniversity: 'All Universities',
    authorVerified: true, authorPoints: 5000, isOfficial: true,
    content: "💡 How to read a textbook effectively:\n\n1️⃣ Preview — skim headings and summaries first\n2️⃣ Question — turn headings into questions before reading\n3️⃣ Read actively — look for answers as you read\n4️⃣ Recall — close the book and write what you remember\n5️⃣ Review — check what you missed\n\nThis method increases retention by up to 50% compared to passive reading. #StudyTips #AcademicExcellence #KNUST #UG",
    hashtags: ['studytips', 'academicexcellence', 'knust', 'ug'], likeCount: 112, commentCount: 34,
  },
  {
    authorId: 'studytips-official', authorName: 'Study Tips GH',
    authorProgram: 'Academic Support', authorUniversity: 'All Universities',
    authorVerified: true, authorPoints: 5000, isOfficial: true,
    content: "📝 Finals are coming — here's your 2-week study plan:\n\nWeek 1: Review all lecture notes. Identify weak areas. Form study groups.\nWeek 2: Practice past questions. Time yourself. Sleep 7-8 hours.\n\nPast papers are available on the CampusLink Marketplace! 📚 #ExamSeason #Finals #StudyGroup #PastPapers",
    hashtags: ['examseason', 'finals', 'studygroup', 'pastpapers'], likeCount: 156, commentCount: 41,
  },
  {
    authorId: 'campusevents-official', authorName: 'Campus Events GH',
    authorProgram: 'Events & Activities', authorUniversity: 'All Universities',
    authorVerified: true, authorPoints: 4000, isOfficial: true,
    content: "📅 UPCOMING: National University Career Fair 2025\n\n🗓 Date: Last Friday of the month\n📍 Location: Various university campuses\n🏢 Companies: MTN, Vodafone, Ecobank, Deloitte, and 40+ more\n\nBring printed CVs. Smart casual dress code. Register your interest on the Events page! #CareerFair #Jobs #Ghana #Internships",
    hashtags: ['careerfair', 'jobs', 'ghana', 'internships'], likeCount: 203, commentCount: 58,
  },
  {
    authorId: 'campusevents-official', authorName: 'Campus Events GH',
    authorProgram: 'Events & Activities', authorUniversity: 'All Universities',
    authorVerified: true, authorPoints: 4000, isOfficial: true,
    content: "⚡ HACKATHON GHANA 2025 — Open to all university students!\n\n💻 48-hour coding challenge\n🏆 Prize pool: GH₵10,000\n👥 Teams of 2-4\n🎯 Theme: Solutions for Africa\n\nRegister through the Events page. All skill levels welcome — even if you're just starting out! #Hackathon #Tech #Ghana #Coding #Innovation",
    hashtags: ['hackathon', 'tech', 'ghana', 'coding', 'innovation'], likeCount: 178, commentCount: 67,
  },
  {
    authorId: 'campuslink-official', authorName: 'CampusLink GH',
    authorProgram: 'Official Account', authorUniversity: 'All Universities',
    authorVerified: true, authorPoints: 9999, isOfficial: true,
    content: "🔐 Your privacy on CampusLink:\n\n✅ Only verified students see your profile\n✅ Your GPA data is 100% private\n✅ We never sell your data\n✅ You control who can message you\n\nCampusLink is built for students, by students. Your trust is everything to us. #Privacy #CampusLink #Safe",
    hashtags: ['privacy', 'campuslink', 'safe'], likeCount: 64, commentCount: 9,
  },
]

export async function seedOfficialAccounts() {
  let created = 0
  for (const account of OFFICIAL_ACCOUNTS) {
    const { uid, ...data } = account
    await setDoc(doc(db, 'users', uid), {
      ...data, uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true })
    created++
  }
  return created
}

export async function seedPosts() {
  let created = 0
  for (const post of SEEDED_POSTS) {
    await addDoc(collection(db, 'posts'), {
      ...post,
      likes: [],
      mediaURL: '', mediaType: '',
      createdAt: serverTimestamp(),
    })
    if (post.hashtags?.length) await recordHashtags(post.hashtags)
    created++
  }
  return created
}

export async function runFullSeed() {
  const accounts = await seedOfficialAccounts()
  const posts    = await seedPosts()
  return { accounts, posts }
}
