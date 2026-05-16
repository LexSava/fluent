export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export const SUPPORTED_LANGUAGES: Record<string, string> = {
  de: 'Немецкий',
  fr: 'Французский',
  es: 'Испанский',
  it: 'Итальянский',
  en: 'Английский',
  pt: 'Португальский',
  ja: 'Японский',
  zh: 'Китайский',
}

export type User = {
  id: string
  email: string
  name: string | null
  image: string | null
  targetLang: string | null
  cefrLevel: CefrLevel | null
  interests: string[]
  isOnboarded: boolean
  createdAt: Date
  updatedAt: Date
}

export type UserProfile = {
  id: string
  email: string
  name: string | null
  image: string | null
  targetLang: string | null
  cefrLevel: CefrLevel | null
  interests: string[]
  isOnboarded: boolean
}

export type OnboardingData = {
  targetLang: string
  cefrLevel: CefrLevel
  interests: string[]
}
