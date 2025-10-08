import { NextResponse } from 'next/server'
import { getVehiclePostById } from '@/lib/vehicles'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await getVehiclePostById(params.id)

    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vehículo no encontrado'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    })
  } catch (error) {
    console.error('Error in /api/vehicles/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener vehículo'
      },
      { status: 500 }
    )
  }
}
