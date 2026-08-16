// Combat/Action/types.ts

import { type Position } from '../Unit'

export const ACTION_KEYS = ['move', 'wait'] as const

export const ACTION_LABELS: Record<ActionKey, string> = {
  move: '移動',
  wait: '待機'
} as const

export const POSITION_LABELS: Record<Position, string> = {
  back: '後方',
  left: '左翼',
  center: '中央',
  right: '右翼'
} as const

// 行動キー
export type ActionKey = typeof ACTION_KEYS[number]

// 行動オプション
export type ActionOptions = {
  position?: Position
}

// 行動キーとオプションの組み合わせ
export type ActionRequest =
  | { key: 'move', options: { position: Position } }
  | { key: 'wait', options: {} }
