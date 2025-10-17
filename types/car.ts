export interface Brand {
  id: number;
  name: string;
  brand_id?: number;
}

export interface Model {
  id?: number;
  name?: string;
  description: string;
  codia: string;
  brand_id?: number;
}

export interface YearPrice {
  year: number;
  price: string;
}

export interface ModelFeature {
  codia: number;
  version: string;
  year: number;
}

export interface UseCarInfoReturn {
  brands: Brand[];
  models: Model[];
  years: YearPrice[];
  versions: ModelFeature[];
  loadingBrands: boolean;
  loadingModels: boolean;
  loadingYears: boolean;
  loadingVersions: boolean;
  getModelsByBrand: (brandId: string) => Promise<void>;
  getPrice: (codia: string) => Promise<void>;
  getVersions: (codia: string) => Promise<void>;
}
