import { useState, useEffect } from 'react'
import api from './api'

const DEFAULTS = {
  nombre_marca: 'RyF banqueteria',
  eslogan: 'Banquetería & Repostería',
  logo_url: null,
  hero_subtitulo: 'Arte en cada evento',
  footer_copyright: 'Banquetería & Repostería. Todos los derechos reservados.',
  email_contacto: 'contacto@ryfbanqueteria.cl',
  telefono: '+56 9 0000 0000',
  instagram_url: 'https://instagram.com/ryfbanqueteria',
  instagram_usuario: '@ryfbanqueteria',
  facebook_url: 'https://facebook.com/ryfbanqueteria',

  facebook_usuario: 'RyF banqueteria',
  whatsapp: '',
}

export function useSiteConfig() {
  const [config, setConfig] = useState(DEFAULTS)

  useEffect(() => {
    api.get('/public/config/')
      .then(r => setConfig({ ...DEFAULTS, ...r.data }))
      .catch(() => {})
  }, [])

  return config
}
