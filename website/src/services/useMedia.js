import { useState, useEffect } from 'react'
import api from './api'

// Returns media keyed by seccion.
// Galería returns array, rest returns single object.
export function useMedia() {
  const [media, setMedia] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/media/')
      .then(r => {
        const map = {}
        r.data.forEach(item => {
          if (item.seccion === 'galeria') {
            if (!map.galeria) map.galeria = []
            map.galeria.push(item)
          } else {
            map[item.seccion] = item
          }
        })
        setMedia(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { media, loading }
}
