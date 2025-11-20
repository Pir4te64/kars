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
