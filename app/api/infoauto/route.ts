/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const INFOAUTO_BASE_URL = 'https://api.infoauto.com.ar/cars'
const INFOAUTO_USER = 'vicmor601@gmail.com'
const INFOAUTO_PASSWORD = 'XhqOsuVIK1MeXpAB'

// Cache para los tokens
let cachedAccessToken: string | null = null
let cachedRefreshToken: string | null = null
let tokenExpiry: number = 0

async function getAuthToken(): Promise<string> {
  // Si tenemos un token cacheado y no ha expirado, usarlo
  const now = Date.now()
  if (cachedAccessToken && tokenExpiry > now) {
    return cachedAccessToken
  }

  // Si tenemos refresh token, intentar renovar
  if (cachedRefreshToken && tokenExpiry > 0 && tokenExpiry <= now) {
    try {
      const refreshResponse = await fetch(`${INFOAUTO_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cachedRefreshToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        cachedAccessToken = refreshData.access
        tokenExpiry = now + (50 * 60 * 1000) // 50 minutos
        return cachedAccessToken!
      }
    } catch (err) {
      console.log('Failed to refresh token, will login again')
    }
  }

  // Obtener nuevos tokens con login
  const credentials = Buffer.from(`${INFOAUTO_USER}:${INFOAUTO_PASSWORD}`).toString('base64')

  const loginResponse = await fetch(`${INFOAUTO_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  })

  if (!loginResponse.ok) {
    const errorText = await loginResponse.text()
    console.error('Login failed:', errorText)
    throw new Error(`Failed to authenticate with InfoAuto API: ${loginResponse.status}`)
  }

  const authData = await loginResponse.json()
  cachedAccessToken = authData.access
  cachedRefreshToken = authData.refresh

  // Cachear por 50 minutos (asumiendo que el token dura 1 hora)
  tokenExpiry = now + (50 * 60 * 1000)

  return cachedAccessToken!
}

export async function GET(request: NextRequest) {
  try {
    // Get the path from query params
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    // Obtener token JWT
    const token = await getAuthToken()

    // Make request to InfoAuto API
    const url = `${INFOAUTO_BASE_URL}/pub${path}`
    console.log('Requesting:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`InfoAuto API error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)

      // Si el token expiró, limpiar cache e intentar de nuevo
      if (response.status === 401) {
        cachedAccessToken = null
        tokenExpiry = 0
      }

      return NextResponse.json(
        { error: 'Error fetching data from InfoAuto API', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in InfoAuto proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
