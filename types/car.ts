export interface Brand {
  id: number;
  name: string;
  brand_id?: number;
  logo_url?: string | null;
}

export interface Model {
  id?: number;
  name?: string;
  description: string;
  codia: string;
  brand_id?: number;
  year_from?: number | null; // Año desde el cual el modelo está disponible
  year_to?: number | null; // Año hasta el cual el modelo está disponible
}

export interface Group {
  id?: number;
  name: string;
  codia?: string;
}

export interface YearPrice {
  year: number;
  price: string; // Precio formateado para mostrar
  priceValue?: number | null; // Precio numérico (USD) para cálculos, puede ser null
}

export interface ModelFeature {
  codia: number;
  version: string;
  year: number;
}

export interface UseCarInfoReturn {
  brands: Brand[];
  groups: Group[];
  models: Model[];
  years: YearPrice[];
  groupYears: number[];
  versions: ModelFeature[];
  loadingBrands: boolean;
  loadingGroups: boolean;
  loadingModels: boolean;
  loadingYears: boolean;
  loadingGroupYears: boolean;
  loadingVersions: boolean;
  getGroup: (brandId: string) => Promise<void>;
  getModelsByBrand: (brandId: string, groupId: string) => Promise<void>;
  getModel: (brandId: string, groupId: string) => Promise<void>;
  getPrice: (codia: string) => Promise<void>;
  getGroupYears: (brandId: string, groupId: string) => Promise<void>;
  getVersions: (codia: string) => Promise<void>;
}
