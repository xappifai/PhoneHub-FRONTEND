import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  // If sending FormData, let the browser set the correct multipart boundary
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete (config.headers as any)['Content-Type']
    }
  } else {
    config.headers = config.headers || {}
    ;(config.headers as any)['Content-Type'] = (config.headers as any)['Content-Type'] || 'application/json'
  }
  return config
})

export default api
