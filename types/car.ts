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

export interface Group {
  id?: number;
  name: string;
  codia?: string;
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
  groups: Group[];
  models: Model[];
  years: YearPrice[];
  versions: ModelFeature[];
  loadingBrands: boolean;
  loadingGroups: boolean;
  loadingModels: boolean;
  loadingYears: boolean;
  loadingVersions: boolean;
  getGroup: (brandId: string) => Promise<void>;
  getModelsByBrand: (brandId: string, groupId: string) => Promise<void>;
  getModel: (brandId: string, groupId: string) => Promise<void>;
  getPrice: (codia: string) => Promise<void>;
  getVersions: (codia: string) => Promise<void>;
}
