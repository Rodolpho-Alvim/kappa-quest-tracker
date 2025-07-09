export interface QuestItem {
  id: string
  item: string
  qtdE: string
  qtdR: string
  fir: string
  streamerItems: string
  craftsProvaveis: string
  hideoutImportante: string
}

export interface UserProgress {
  [itemId: string]: {
    completed: boolean
    notes: string
    lastUpdated: number
  }
}
