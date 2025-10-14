// Types for InfoAuto API

export interface Brand {
  brand_id: number
  name: string
}

export interface Model {
  codia: number
  name: string
  brand_id: number
}

export interface UsedPrice {
  year: number
  price: number
}

export interface ListPrice {
  price: number
}

export interface ModelFeature {
  codia: number
  version: string
  year: number
}

export interface QuoteFormData {
  brandId: number | null
  brandName: string
  codia: number | null
  modelName: string
  year: number | null
  version: string
  kilometraje: string
}

export const KILOMETRAJE_RANGES = [
  { value: '0', label: '0 km (nuevo)' },
  { value: '0-20000', label: '0 - 20,000 km' },
  { value: '20000-50000', label: '20,000 - 50,000 km' },
  { value: '50000-100000', label: '50,000 - 100,000 km' },
  { value: '100000-150000', label: '100,000 - 150,000 km' },
  { value: '150000+', label: 'Más de 150,000 km' },
]
