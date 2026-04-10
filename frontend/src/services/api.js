import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const res = await axios.post('http://localhost:8000/api/auth/refresh/', { refresh })
          localStorage.setItem('access_token', res.data.access)
          if (res.data.refresh) localStorage.setItem('refresh_token', res.data.refresh)
          original.headers.Authorization = `Bearer ${res.data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const fmt = (n) => {
  if (n == null) return '$0'
  return '$' + Math.round(Number(n)).toLocaleString('es-CL')
}

export const fmtPct = (n) => {
  if (n == null) return '0.0%'
  return (Math.round(Number(n) * 10) / 10).toFixed(1) + '%'
}

export const fmtDate = (d) => {
  if (!d) return 'Sin fecha'
  const date = new Date(d + 'T12:00:00') // Add T12:00:00 to avoid timezone offset issues (off-by-one)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('es-CL')
}

export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    // Use the blob from response.data directly with the correct type
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const urlBlob = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = urlBlob
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(urlBlob)
  } catch (e) {
    console.error('Error descargando archivo:', e)
    alert('Error al generar el archivo Excel. Por favor intente nuevamente.')
  }
}
