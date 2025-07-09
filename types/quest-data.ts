export interface QuestItem {
  id: string
  item: string
  qtdE: string | number
  qtdR: string | number
  fir: "Yes" | "No" | ""
  isCustom?: boolean
  isDeleted?: boolean
}

export interface StreamerItem {
  id: string
  item: string
  qtdE: string | number
  qtdR: string | number
  fir: "Yes" | "No" | ""
  isCustom?: boolean
  isDeleted?: boolean
}

export interface CraftItem {
  id: string
  item: string
  qtdE: string | number
  qtdR: string | number
  isCustom?: boolean
  isDeleted?: boolean
}

export interface HideoutItem {
  id: string
  item: string
  e: string | number
  qtdR: string | number
  isCustom?: boolean
  isDeleted?: boolean
}

export interface UserProgress {
  [itemId: string]: {
    qtdE?: string | number
    qtdR?: string | number
    fir?: "Yes" | "No" | ""
    e?: string | number
    completed?: boolean
    lastUpdated: number
  }
}

export interface CustomItems {
  mainItems: QuestItem[]
  secondaryItems: QuestItem[]
  streamerItems: StreamerItem[]
  craftsItems: CraftItem[]
  hideoutItems: HideoutItem[]
}

export interface DeletedItems {
  [itemId: string]: boolean
}
