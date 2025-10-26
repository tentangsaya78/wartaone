export const useWpApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.wpUrl.replace(/\/$/, '')


  const request = async <T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      params?: Record<string, any>
      body?: any
      headers?: Record<string, string>
      key?: string
      lazy?: boolean
      server?: boolean
    } = {}
  ) => {
    const method = options.method || 'GET'
    const query = options.params ? `?${new URLSearchParams(options.params).toString()}` : ''
    const url = `${baseUrl}/${endpoint}${query}`

    // 🔒 Pastikan method non-GET tidak jalan di server
    const isClientOnly = method !== 'GET'

    // Check if body is FormData
    const isFormData = options.body instanceof FormData

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }), // Don't set Content-Type for FormData
      ...(options.headers || {}),
    }

    const body = isFormData 
      ? options.body 
      : (options.body && typeof options.body === 'object'
        ? JSON.stringify(options.body)
        : options.body)

    const { data, error, pending, refresh } = await useFetch<T>(url, {
      key: options.key || `api-${method}-${endpoint}`,
      method,
      body,
      headers,
      lazy: options.lazy ?? false,
      server: options.server ?? !isClientOnly,
    })

    if (error.value) throw error.value
    return { data, pending, refresh }
  }




  return { request }
}