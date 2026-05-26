export interface TitleInfo {
  label: string
  color: string
  bg: string
  border: string
}

const TITLE_TIERS: Array<{ min: number } & TitleInfo> = [
  { min: 10, label: '狮山花匠',   color: '#7a4a0a', bg: '#f5e2b8', border: '#c4891e' },
  { min: 6,  label: '本草别录人', color: '#2a3e8a', bg: '#dde4f5', border: '#6a82c0' },
  { min: 3,  label: '草木观察员', color: '#1d5a50', bg: '#cce8e4', border: '#3a9a88' },
  { min: 1,  label: '花径散步者', color: '#3a5a40', bg: '#d8ead0', border: '#7aaa6a' },
  { min: 0,  label: '初识草木',   color: '#6e7268', bg: '#efece4', border: '#c8c3b8' },
]

export const getTitleInfo = (checkins?: number): TitleInfo => {
  const n = checkins ?? 0
  return TITLE_TIERS.find(t => n >= t.min) ?? TITLE_TIERS[TITLE_TIERS.length - 1]
}
