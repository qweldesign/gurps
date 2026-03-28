// Spells.ts

import { type ParameterName } from '../domains/Parameters'

export const SPELL_ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const

export const SPELL_ELEMENT_LABELS: Record<string, ParameterName> = {
  wood: '木行術', fire: '火行術', earth: '土行術', metal: '金行術', water: '水行術'
} as const

const WOOD_SPELL: Spell[] = [
  { id: 0, label: 'ヘイスト', spellType: 'assist', spellCast: 1 },
  { id: 1, label: '茨の呪縛', spellType: 'shoot', spellCast: 1 },
  { id: 2, label: '風の刃', spellType: 'shoot', spellCast: 2 },
  { id: 3, label: 'サイレンス', spellType: 'resist', spellCast: 2 },
  { id: 4, label: 'リストレーション', spellType: 'range', spellCast: 3 },
  { id: 5, label: '召雷', spellType: 'shoot', spellCast: 3 }
] as const

const FIRE_SPELL: Spell[] = [
  { id: 0, label: 'ヒロイズム', spellType: 'assist', spellCast: 1 },
  { id: 1, label: '閃光', spellType: 'range', spellCast: 1 },
  { id: 2, label: '火球', spellType: 'shoot', spellCast: 2 },
  { id: 3, label: '炎の嵐', spellType: 'range', spellCast: 2 },
  { id: 4, label: '火の鳥', spellType: 'range', spellCast: 3 },
  { id: 5, label: '焼殺', spellType: 'shoot', spellCast: 3 }
] as const

const EARTH_SPELL: Spell[] = [
  { id: 0, label: 'ベルセルク', spellType: 'resist', spellCast: 1 },
  { id: 1, label: 'アースハンド', spellType: 'shoot', spellCast: 1 },
  { id: 2, label: '大地の癒し', spellType: 'recover', spellCast: 2 },
  { id: 3, label: '痛覚鈍麻', spellType: 'resist', spellCast: 2 },
  { id: 4, label: '傀儡', spellType: 'other', spellCast: 1 },
  { id: 5, label: '瓦礫の雨', spellType: 'range', spellCast: 3 }
] as const

const METAL_SPELL: Spell[] = [
  { id: 0, label: '金縛り', spellType: 'resist', spellCast: 1 },
  { id: 1, label: '杯', spellType: 'recover', spellCast: 1 },
  { id: 2, label: '金貨', spellType: 'resist', spellCast: 2 },
  { id: 3, label: '盾', spellType: 'defense', spellCast: 2 },
  { id: 4, label: 'サイレン', spellType: 'range', spellCast: 3 },
  { id: 5, label: '塔', spellType: 'shoot', spellCast: 3 }
] as const

const WATER_SPELL: Spell[] = [
  { id: 0, label: '生命の雫', spellType: 'recover', spellCast: 1 },
  { id: 1, label: 'ぼんやり', spellType: 'resist', spellCast: 1 },
  { id: 2, label: '水舞', spellType: 'assist', spellCast: 2 },
  { id: 3, label: '濃霧', spellType: 'other', spellCast: 2 },
  { id: 4, label: '時間遡行', spellType: 'defense', spellCast: 3 },
  { id: 5, label: '吹雪', spellType: 'range', spellCast: 3 }
] as const

export const SPELL_LIST: Record<SpellElement, Spell[]> = {
  wood: WOOD_SPELL,
  fire: FIRE_SPELL,
  earth: EARTH_SPELL,
  metal: METAL_SPELL,
  water: WATER_SPELL
}

// 五行
export type SpellElement = typeof SPELL_ELEMENTS[number]

// 技能群
export type Spells = Record<SpellElement, number>

// 型分類
type SpellType = 'assist' | 'resist' | 'shoot' | 'range' | 'recover' | 'defense' | 'other'

// 法術
type Spell = {
  id: number
  label: string
  spellType: SpellType
  spellCast: number
}
