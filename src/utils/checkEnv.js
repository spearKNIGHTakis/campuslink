export function checkAppConfig() {
  const issues = []

  // Check environment variables
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    issues.push("❌ Missing VITE_CLOUDINARY_CLOUD_NAME in .env")
  } else {
    console.log("✅ Cloudinary cloud name loaded:", cloudName)
  }

  // Check if running in dev or prod
  console.log("Mode:", import.meta.env.MODE)

  // Basic React + Vite sanity checks
  if (!import.meta.env.BASE_URL) {
    issues.push("⚠️ BASE_URL not defined")
  }

  if (issues.length > 0) {
    console.warn("⚠️ App configuration issues found:")
    issues.forEach(i => console.warn(i))
  } else {
    console.log("🚀 App config looks good!")
  }

  return {
    ok: issues.length === 0,
    cloudName,
    issues
  }
}