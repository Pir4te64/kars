'use client'

import { useEffect } from 'react'

export default function FacebookDomainVerification() {
  useEffect(() => {
    // Verificar si el meta tag ya existe
    const existingMeta = document.querySelector('meta[name="facebook-domain-verification"]')
    
    if (!existingMeta) {
      // Crear y agregar el meta tag si no existe
      const meta = document.createElement('meta')
      meta.setAttribute('name', 'facebook-domain-verification')
      meta.setAttribute('content', '2prisasaheadexeps5804x28with1')
      document.head.appendChild(meta)
    }
  }, [])

  return null
}

