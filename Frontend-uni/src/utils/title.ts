import type { Title } from '@/services/api'

export interface TitleInfo {
  label: string
  color: string
  bg: string
  border: string
}

const TITLE_STYLE: Record<string, Omit<TitleInfo, 'label'>> = {
  '初问春色': { color: '#6e7268', bg: '#efece4', border: '#c8c3b8' },
  '一径花踪': { color: '#3a5a40', bg: '#d8ead0', border: '#7aaa6a' },
  '三两芳信': { color: '#1d5a50', bg: '#cce8e4', border: '#3a9a88' },
  '半园识翠': { color: '#2a3e8a', bg: '#dde4f5', border: '#6a82c0' },
  '满园春色': { color: '#7a4a0a', bg: '#f5e2b8', border: '#c4891e' },
}

const FALLBACK: TitleInfo = { label: '初问春色', ...TITLE_STYLE['初问春色'] }

const toInfo = (title: Title | undefined | null): TitleInfo => {
  if (!title) return FALLBACK
  return {
    label: title.name,
    ...(TITLE_STYLE[title.name] ?? TITLE_STYLE['初问春色']),
  }
}

/** 从 user 已拥有的 titles 数组中找 requirement 最高的那个，返回展示信息。 */
export const getCurrentTitle = (titles?: Title[] | null): TitleInfo => {
  if (!titles?.length) return FALLBACK
  const top = [...titles].sort((a, b) => b.requirement - a.requirement)[0]
  return toInfo(top)
}

/** 帖子作者的称号：后端在 user 序列化时附带 current_title。 */
export const getTitleByName = (title?: Title | null): TitleInfo => toInfo(title)
