import { NextResponse } from 'next/server'
import { getVehiclePosts } from '@/lib/vehicles'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '1000')

    const vehicles = await getVehiclePosts(limit)

    return NextResponse.json({
      success: true,
      data: vehicles,
    })
  } catch (error) {
    console.error('Error in /api/vehicles:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener vehículos'
      },
      { status: 500 }
    )
  }
}
