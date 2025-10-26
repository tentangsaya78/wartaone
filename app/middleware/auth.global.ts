// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip di server-side
  if (import.meta.server) return

  const { token, restore, user, isAuthChecked } = useAuth()

  // Halaman publik
  const publicPages = ['/', '/login', '/register', '/unauthorized']
  if (publicPages.includes(to.path)) return

  // Jika belum pernah cek auth, restore dulu
  if (!isAuthChecked.value) {
    await restore()
    isAuthChecked.value = true
  }

  // Kalau tidak ada token, redirect ke login
  if (!token.value || !user.value) {
    return navigateTo('/login')
  }
})