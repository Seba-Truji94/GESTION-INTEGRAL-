import { useState, useEffect } from 'react'
import api from './api'

const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=80`

const DEMO_MEDIA = {
  hero_imagen: { url: U('1414235077428-338989a2e8c0', 1920), tipo: 'imagen' },
  nosotros_banner: { url: U('1555244162-803834f70033', 1600), tipo: 'imagen' },
  nosotros_foto1:  { url: U('1556909114-f6e7ad7d3136', 900), tipo: 'imagen' },
  nosotros_foto2:  { url: U('1565299624946-b28f40a0ae38', 900), tipo: 'imagen' },
  galeria: [
    { id: 1, url: U('1467003909585-2f8a72700288'), tipo: 'imagen', label: 'Cena de gala' },
    { id: 2, url: U('1540189549336-e6e99c3679fe'), tipo: 'imagen', label: 'Ensalada de temporada' },
    { id: 3, url: U('1504674900247-0877df9cc836'), tipo: 'imagen', label: 'Mesa del chef' },
    { id: 4, url: U('1565958011703-44f9829ba187'), tipo: 'imagen', label: 'Repostería fina' },
    { id: 5, url: U('1555244162-803834f70033'), tipo: 'imagen', label: 'Banquete completo' },
    { id: 6, url: U('1527529482837-4698179dc6ce'), tipo: 'imagen', label: 'Coctelería' },
    { id: 7, url: U('1517457373958-b7bdd4587205'), tipo: 'imagen', label: 'Evento corporativo' },
    { id: 8, url: U('1551782450-a2132b4ba21d'), tipo: 'imagen', label: 'Plato estrella' },
    { id: 9, url: U('1414235077428-338989a2e8c0'), tipo: 'imagen', label: 'Fine dining' },
  ],
}

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
      .catch(() => setMedia(DEMO_MEDIA))
      .finally(() => setLoading(false))
  }, [])

  return { media, loading }
}
