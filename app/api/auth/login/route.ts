import { NextResponse } from 'next/server'

const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:3001/api/cars/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Note: This should be replaced with actual auth implementation
    // For now, proxying to the backend
    const res = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in /api/auth/login:', error)
    return NextResponse.json(
      { error: 'Error en el login' },
      { status: 500 }
    )
  }
}
