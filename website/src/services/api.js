import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

export const getCatalogo = (categoria) =>
  api.get('/public/catalogo/', { params: categoria ? { categoria } : {} })

export const getDatosTransferencia = () =>
  api.get('/datos-transferencia/')

export const crearSolicitud = (data) =>
  api.post('/public/pedidos/', data)

export default api
