// middleware/role.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip di server-side
  if (import.meta.server) return

  const { user, isAuthChecked } = useAuth()

  // Tunggu auth selesai dicek
  if (!isAuthChecked.value) {
    let attempts = 0
    while (!isAuthChecked.value && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

  // Kalau user masih tidak ada, biarkan auth.global yang handle
  if (!user.value) return

  // Ambil semua roles user (WordPress bisa multiple roles)
  const userRoles = user.value?.roles || []
  
  if (userRoles.length === 0) {
    console.warn('[role] User tidak punya role:', user.value)
    return navigateTo('/unauthorized')
  }

  console.log('[role] User roles:', userRoles, 'accessing:', to.path)

  // Cek apakah user punya salah satu role yang dibutuhkan
  const hasRole = (allowedRoles: string[]) => {
    return userRoles.some((role: string) => allowedRoles.includes(role))
  }

  // Route access rules
  const routeRules = [
    {
      path: '/dashboard/admin',
      allowedRoles: ['administrator'],
      exact: false, // /dashboard/admin dan semua child routes
    },
    {
      path: '/dashboard/warga',
      allowedRoles: ['administrator', 'author'],
      exact: false, // /dashboard/warga dan semua child routes
    },
    {
      path: '/dashboard',
      allowedRoles: ['administrator', 'author'],
      exact: true, // Hanya /dashboard (index)
    },
  ]

  // Cek akses berdasarkan path
  for (const rule of routeRules) {
    const isMatch = rule.exact 
      ? to.path === rule.path 
      : to.path.startsWith(rule.path)

    if (isMatch) {
      if (!hasRole(rule.allowedRoles)) {
        console.warn('[role] Access denied:', {
          path: to.path,
          userRoles,
          requiredRoles: rule.allowedRoles
        })
        return navigateTo('/unauthorized')
      }
      
      // Akses diizinkan
      console.log('[role] Access granted:', to.path)
      return
    }
  }

  // Jika tidak ada rule yang match dan path dimulai dengan /dashboard
  // redirect ke unauthorized (default deny)
  if (to.path.startsWith('/dashboard')) {
    console.warn('[role] No rule matched for:', to.path)
    return navigateTo('/unauthorized')
  }
})
