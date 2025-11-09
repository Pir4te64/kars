'use client'

import { useState, useEffect, useRef } from 'react'

interface Localidad {
  id: string
  nombre: string
  provincia: {
    nombre: string
  }
}

interface LocalidadData {
  localidadId: string
  localidadNombre: string
  provinciaNombre: string
}

interface LocalidadAutocompleteProps {
  value?: string
  onSelect: (data: LocalidadData) => void
  placeholder?: string
  className?: string
  inputClassName?: string
}

export default function LocalidadAutocomplete({
  value = '',
  onSelect,
  placeholder = 'Escribí tu localidad...',
  className = '',
  inputClassName = '',
}: LocalidadAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [sugerencias, setSugerencias] = useState<Localidad[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.length < 3) {
      setSugerencias([])
      setShowSuggestions(false)
      return
    }

    const delay = setTimeout(() => {
      setLoading(true)
      setError('')

      fetch(
        `https://apis.datos.gob.ar/georef/api/localidades?nombre=${encodeURIComponent(query)}&max=10&campos=id,nombre,provincia`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.localidades && data.localidades.length > 0) {
            setSugerencias(data.localidades)
            setShowSuggestions(true)
            setError('')
          } else {
            setSugerencias([])
            setError('No se encontró la localidad')
            setShowSuggestions(true)
          }
        })
        .catch(() => {
          setError('Error al cargar localidades')
          setSugerencias([])
          setShowSuggestions(true)
        })
        .finally(() => setLoading(false))
    }, 400) // debounce de 400ms

    return () => clearTimeout(delay)
  }, [query])

  const handleSelect = (loc: Localidad) => {
    const displayText = `${loc.nombre}, ${loc.provincia.nombre}`
    setQuery(displayText)
    setSugerencias([])
    setShowSuggestions(false)
    onSelect({
      localidadId: loc.id,
      localidadNombre: loc.nombre,
      provinciaNombre: loc.provincia.nombre,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowSuggestions(true)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        className="relative"
        style={{
          width: "100%",
          height: "56px",
          paddingTop: "12px",
          paddingRight: "16px",
          paddingBottom: "12px",
          paddingLeft: "16px",
          borderRadius: "7px",
          border: "1px solid #0D0D0D",
          backgroundColor: "white",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (sugerencias.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className={`w-full h-full bg-transparent ${inputClassName}`}
          style={{
            border: 'none',
            outline: 'none',
            fontFamily: 'Poppins',
            fontSize: '14px',
          }}
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Dropdown icon */}
        {!loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (sugerencias.length > 0 || error) && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{
            borderRadius: "7px",
            border: "1px solid #0D0D0D",
          }}
        >
          {error && sugerencias.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              {error}
            </div>
          ) : (
            <ul className="py-1">
              {sugerencias.map((loc) => (
                <li
                  key={loc.id}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                  onClick={() => handleSelect(loc)}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span className="font-medium text-gray-900">{loc.nombre}</span>
                  <span className="text-gray-500 ml-1">({loc.provincia.nombre})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
