// src/lib/universities.js
// All major Ghanaian universities + departments

export const UNIVERSITIES = [
  { id: "knust",  name: "KNUST",  full: "Kwame Nkrumah University of Science & Technology", domain: "knust.edu.gh",  location: "Kumasi" },
  { id: "ug",     name: "UG",     full: "University of Ghana",                               domain: "ug.edu.gh",    location: "Accra" },
  { id: "ucc",    name: "UCC",    full: "University of Cape Coast",                          domain: "ucc.edu.gh",   location: "Cape Coast" },
  { id: "uds",    name: "UDS",    full: "University for Development Studies",                domain: "uds.edu.gh",   location: "Tamale" },
  { id: "uew",    name: "UEW",    full: "University of Education, Winneba",                  domain: "uew.edu.gh",   location: "Winneba" },
  { id: "umat",   name: "UMaT",   full: "University of Mines & Technology",                  domain: "umat.edu.gh",  location: "Tarkwa" },
  { id: "uhas",   name: "UHaS",   full: "University of Health & Allied Sciences",            domain: "uhas.edu.gh",  location: "Ho" },
  { id: "ashesi", name: "Ashesi", full: "Ashesi University",                                 domain: "ashesi.edu.gh",location: "Berekuso" },
  { id: "gimpa",  name: "GIMPA",  full: "Ghana Institute of Management & Public Administration", domain: "gimpa.edu.gh", location: "Accra" },
  { id: "aucc",   name: "AUCC",   full: "African University College of Communications",      domain: "aucc.edu.gh",  location: "Accra" },
  { id: "other",  name: "Other",  full: "Other University",                                  domain: "",             location: "Ghana" },
]

export const DEPARTMENTS = {
  knust: ["Computer Science","Electrical Engineering","Mechanical Engineering","Civil Engineering","Chemical Engineering","Agricultural Engineering","Biochemistry","Physics","Mathematics","Chemistry","Architecture","Planning","Publishing Studies","Economics","Sociology","Business Administration","Nursing","Medicine","Pharmacy","Optometry"],
  ug:    ["Computer Science","Mathematics","Physics","Chemistry","Biology","Economics","Political Science","Sociology","Psychology","Law","Medicine","Pharmacy","Engineering","Business Administration","Education","Social Work","Geography","Linguistics","History","Philosophy"],
  ucc:   ["Education","Economics","Business Studies","Development Studies","Computer Science","Mathematics","Science","Social Sciences","Arts","Law","Health Sciences","Agriculture","Tourism","Hospitality","Engineering"],
  uds:   ["Agriculture","Business","Education","Development Studies","Earth Sciences","Engineering","Health Sciences","Law","Medicine","Social Sciences"],
  default: ["Science","Arts","Business","Engineering","Health Sciences","Education","Social Sciences","Law","Technology","Agriculture"],
}

export const YEARS = ["Level 100","Level 200","Level 300","Level 400","Level 500","Level 600","Postgraduate (Masters)","Postgraduate (PhD)","Alumni"]

export function getUniversity(id) {
  return UNIVERSITIES.find(u => u.id === id) || UNIVERSITIES[UNIVERSITIES.length - 1]
}

export function getDepartments(uniId) {
  return DEPARTMENTS[uniId] || DEPARTMENTS.default
}

export function isEduEmail(email, uniId) {
  const uni = getUniversity(uniId)
  if (!uni?.domain) return false
  return email.toLowerCase().endsWith(`@${uni.domain}`) || email.toLowerCase().endsWith(`@st.${uni.domain}`)
}
