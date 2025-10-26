// composables/useAuth.ts
export const useAuth = () => {
  const token = useState<string | null>('auth_token', () => null)
  const user = useState<any>('auth_user', () => null)
  const loading = useState('auth_loading', () => false)
  const error = useState<string | null>('auth_error', () => null)
  const isAuthChecked = useState('auth_checked', () => false)

  const { request } = useWpApi()

  const restore = async () => {
    // Hanya jalan di client
    if (!import.meta.client) return

    const savedToken = localStorage.getItem('wp_token')
    console.log('[restore] savedToken:', savedToken ? 'exists' : 'null')

    if (!savedToken) {
      token.value = null
      user.value = null
      return
    }

    token.value = savedToken

    try {
      const { data } = await request('wp/v2/users/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
      
      if (data.value) {
        user.value = data.value
        console.log('[restore] user restored:', {
          id: user.value.id,
          name: user.value.name,
          roles: user.value.roles
        })
      } else {
        throw new Error('User data kosong')
      }
    } catch (err) {
      console.error('[restore] gagal ambil user:', err)
      logout()
    }
  }

  const login = async (username: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      // 1. Dapatkan token
      const { data: tokenData } = await request<{ token: string }>('jwt-auth/v1/token', {
        method: 'POST',
        body: { username, password },
      })

      const receivedToken = tokenData.value?.token
      if (!receivedToken) {
        throw new Error('Token tidak diterima dari server')
      }

      token.value = receivedToken
      localStorage.setItem('wp_token', receivedToken)
      
      console.log('[login] Token saved')

      // 2. Dapatkan data user
      const { data: userData } = await request('api/v1/me', {
        headers: { Authorization: `Bearer ${receivedToken}` },
      })

      if (!userData.value) {
        throw new Error('User data tidak diterima')
      }

      user.value = userData.value
      isAuthChecked.value = true // Mark sebagai sudah dicek
      
      console.log('[login] User logged in:', {
        id: user.value.id,
        name: user.value.name,
        roles: user.value.roles
      })

      return true
    } catch (err: any) {
      console.error('[login] error:', err)
      error.value = err?.data?.message || err?.message || 'Login gagal'
      token.value = null
      user.value = null
      localStorage.removeItem('wp_token')
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    console.log('[logout] Logging out user')
    token.value = null
    user.value = null
    isAuthChecked.value = false
    localStorage.removeItem('wp_token')
    navigateTo('/login')
    // relaod page
    location.reload()
  }

  // Helper untuk cek role
  const hasRole = (role: string | string[]) => {
    if (!user.value?.roles) return false
    
    const roles = Array.isArray(role) ? role : [role]
    return user.value.roles.some((userRole: string) => roles.includes(userRole))
  }

  // Helper untuk redirect ke dashboard sesuai role
  const redirectToDashboard = () => {
    if (hasRole('administrator')) {
      return navigateTo('/dashboard/admin')
    } else if (hasRole('author')) {
      return navigateTo('/dashboard/warga')
    } else {
      return navigateTo('/dashboard')
    }
  }

  return { 
    token, 
    user, 
    loading, 
    error, 
    isAuthChecked, 
    login, 
    logout, 
    restore,
    hasRole,
    redirectToDashboard
  }
}