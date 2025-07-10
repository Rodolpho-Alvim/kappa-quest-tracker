export interface QuestItem {
  id: string;
  item: string;
  qtdE: string | number;
  qtdR: string | number;
  fir: "Yes" | "No" | "";
  isCustom?: boolean;
  isDeleted?: boolean;
}

export interface SampleItem {
  id: string;
  item: string;
  qtdE: string | number;
  qtdR: string | number;
  fir: "Yes" | "No" | "";
  isCustom?: boolean;
  isDeleted?: boolean;
}

export interface RecompensaItem {
  id: string;
  item: string;
  qtdE: string | number;
  qtdR: string | number;
  fir: "Yes" | "No" | "";
  isCustom?: boolean;
  isDeleted?: boolean;
}

export interface TrocaItem {
  id: string;
  item: string;
  qtdE: string | number;
  qtdR: string | number;
  isCustom?: boolean;
  isDeleted?: boolean;
}

export interface StreamerItem {
  id: string;
  item: string;
  qtdE: string | number;
  qtdR: string | number;
  fir: "Yes" | "No" | "";
  isCustom?: boolean;
  isDeleted?: boolean;
}

export interface CraftItem {
  id: string;
  item: string;
  qtdE: string | number;
  qtdR: string | number;
  isCustom?: boolean;
  isDeleted?: boolean;
}

export interface HideoutItem {
  id: string;
  item: string;
  qtdE: string | number;
  qtdR: string | number;
  isCustom?: boolean;
  isDeleted?: boolean;
  isReference?: boolean;
}

export interface UserProgress {
  [itemId: string]: {
    qtdE?: string | number;
    qtdR?: string | number;
    fir?: "Yes" | "No" | "";
    completed?: boolean;
    lastUpdated: number;
  };
}

export interface CustomItems {
  mainItems: QuestItem[];
  samples: SampleItem[];
  recompensasQuests: RecompensaItem[];
  trocaItens: TrocaItem[];
  streamerItems: StreamerItem[];
  craftsItems: CraftItem[];
  hideoutImportante: HideoutItem[];
  barterGunsmith: HideoutItem[];
  barterChaves: HideoutItem[];
  dorm206: HideoutItem[];
  portableBunkhouse: HideoutItem[];
  dorm303: HideoutItem[];
  chavesQuests: HideoutItem[];
}

export interface DeletedItems {
  [itemId: string]: boolean;
}
