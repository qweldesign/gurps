// ActionStore.ts

import { CombatState as State } from './State'
import { POSITION_VALUES, type Position } from './FormationStore'
import { CombatUnit as Unit } from './Unit'

// コマンド名の定義
export const ACTIONS = ['attack', 'move', 'wait'] as const

export type ActionType = typeof ACTIONS[number]

export const ACTION_LABELS: Record<ActionType, string> = {
  attack: '攻撃',
  move: '移動',
  wait: '待機'
} as const

// コマンドオプションの定義
export type ActionOptions = {
  aim?: Aim
  fullPower?: FullPower
  position?: Position
}

// 攻撃オプションの定義
export const FULL_POWER_KEYS = ['none', 'dmg', 'level', 'feint', 'double'] as const

export type FullPower = typeof FULL_POWER_KEYS[number]

export const FULL_POWER_OPTIONS: Record<FullPower, { label: string }> = {
  none: { label: '通常攻撃' },
  dmg: { label: 'ダメージ安定' },
  level: { label: '技能値+4' },
  feint: { label: 'フェイント即攻撃' },
  double: { label: '2回攻撃' }
} as const

// 「部位狙い」オプションの定義
export const AIM_KEYS = ['head', 'ear', 'eye', 'body', 'neck', 'stomach', 'arm', 'hand', 'leg', 'foot'] as const

export type Aim = typeof AIM_KEYS[number]

export const AIM_OPTIONS: Record<Aim, { label: string, mod: number }> = {
  head: { label: '頭', mod: -3 }, 
  ear: { label: '耳', mod: -5 },
  eye: { label: '目', mod: -7 },
  body: { label: '体', mod: 0 },
  neck: { label: '喉', mod: -5 },
  stomach: { label: '肚', mod: -3 },
  arm: { label: '腕', mod: -2 },
  hand: { label: '手首', mod: -4 },
  leg: { label: '脚', mod: -2 },
  foot: { label: '足首', mod: -4 }
 } as const

//「移動」オプションの定義
export const POSITION_LABELS: Record<Position, string> = {
  back: '後方',
  left: '左翼',
  center: '中央',
  right: '右翼'
} as const

// コマンド名とオプションの組み合わせ定義
export type ActionRequest =
  | { type: 'attack', options: { aim: Aim, fullPower: FullPower }, targets: [Unit] }
  | { type: 'move', options: { position: Position }, targets: [] }
  | { type: 'wait', options: {}, targets: [] }

// ロール定義
type Roll = {
  roll: number // 出目
}

// 判定定義
type Judge = Roll & {
  success: boolean // 成功/失敗
  critical: boolean // クリティカル/ファンブル
}

// コマンド実行可否取得関数と実行関数の定義
type ActionDefinition = {
  attack: {
    options: { aim: readonly Aim[], fullPower: readonly FullPower[] }
    canExecute: () => boolean
    execute: (aim: Aim, fullPower: FullPower, target: Unit) => void
  }
  move: {
    options: { position: readonly Position[] }
    canExecute: (position: Position) => boolean
    execute: (position: Position) => void
  }
  wait: {
    canExecute: () => boolean
    execute: () => void
  }
}

// コマンド (行動) の管理と実行を司るクラス / Actionコンポーネントに対応
export class CombatActionStore {
  public actor: Unit
  private state: State
  public round: number
  private readonly actions: ActionDefinition

  constructor(actor: Unit, state: State) {
    this.actor = actor
    this.state = state
    this.round = state.round
    this.actions = {
      attack: {
        options: { aim: AIM_KEYS, fullPower: FULL_POWER_KEYS },
        canExecute: () => this.canAttack(),
        execute: (aim, fullPower, target) => this.attack(aim, fullPower, target)
      },
      move: {
        options: { position: POSITION_VALUES },
        canExecute: (position) => this.canMove(position),
        execute: (position) => this.move(position)
      },
      wait: {
        canExecute: () => true,
        execute: () => {}
      }
    }
  }

  // ターン毎に更新
  update(actor: Unit, state: State) {
    this.actor = actor
    this.state = state
    this.round = state.round
  }

  // availability を結果として生成
  get availability() {
    return {
      attack: this.actions.attack.canExecute(),
      move: this.actions.move.options.position.reduce((acc, position) => {
        acc[position] = this.actions.move.canExecute(position)
        return acc
      }, {} as Record<Position, boolean>),
      wait: this.actions.wait.canExecute()
    }
  }

  // 「攻撃」実行可否取得
  // 自身が前方に配置されていることが条件 (暫定)
  private canAttack() {
    return this.actor.position !== 'back'
  }

  // 「移動」実行可否取得
  // 後退は自身が後方に配置されていないこと, 前進はそこへ既にユニットが配置されていないことが, それぞれ条件となる
  private canMove(position: Position) {
    if (position === 'back') {
      return this.state.formationStore[this.actor.side].back[this.actor.combatId] === null ? true : false
    } else {
      return this.state.formationStore[this.actor.side].front[position] === null ? true : false
    }
  }
  
  // ターゲットを結果として生成 (暫定)
  get target() {
    return {
      all: this.state.units,
      allies: this.getAllies(),
      enemies: this.getEnemies(),
      melee: this.getMeleeTarget(),
    }
  }

  // 味方取得
  private getAllies() {
    return this.state.units.filter(unit => unit.side === this.actor.side)
  }

  // 敵取得
  private getEnemies() {
    return this.state.units.filter(unit => unit.side !== this.actor.side)
  }

  // 近接攻撃対象取得
  private getMeleeTarget() {
    const enemies = this.getEnemies()
    switch (this.actor.position) {
      case 'left':
        return enemies.filter(unit => {
          return unit.position === 'right' || unit.position === 'center'
        })
      
      case 'center':
        return enemies.filter(unit => {
          return unit.position !== 'back'
        })

      case 'right':
        return enemies.filter(unit => {
          return unit.position === 'left' || unit.position === 'center'
        })

      default: // case 'back':
        return []
    }
  }

  // 実行
  // ActionRequest のプロパティ (type, options, targets) を引数に取って処理を進める
  execute(action: ActionRequest) {
    switch (action.type) {
      case 'attack':
        if (!this.actions.attack.canExecute()) return
        this.actions.attack.execute(action.options.aim, action.options.fullPower, action.targets[0])
        break

      case 'move':
        if (!this.actions.move.canExecute(action.options.position)) return
        this.actions.move.execute(action.options.position)
        break

      default: // case 'wait':
        if (!this.actions.wait.canExecute()) return
        this.actions.wait.execute()
        break
    }
  }

  // ロール結果 (Roll型) を返す
  private roll(count: number = 3, mod: number = 0, sides: number = 6): Roll {
    const roll = this.getRoll(count, mod, sides)
    return { roll }
  }

  // 判定結果 (Judge型) を返す
  private judge(target: number): Judge {
    const roll = this.getRoll()
    const criticalTarget = Math.max(4, Math.min((target - 10), 6)) // クリティカル
    const fumbleTarget = Math.max(17, Math.min((target + 1), 18)) // ファンブル
    const success = roll <= criticalTarget || (roll <= target && roll < 17)
    const critical = roll <= criticalTarget || roll >= fumbleTarget
    return { roll, success, critical }
  }

  // ダイスを振った出目を取得
  private getRoll(count: number = 3, mod: number = 0, sides: number = 6): number {
    return Array.from<number>({ length: count }).reduce(sum => {
      return sum + Math.ceil(Math.random() * sides)
    }, 0) + mod
  }

  // 「攻撃」実行 (暫定: コンソール出力のみ)
  private attack(aim: Aim, fullPower: FullPower, target: Unit) {
    console.log({ aim: AIM_OPTIONS[aim], fullPower: FULL_POWER_OPTIONS[fullPower], target })
  }

  // 「移動」実行
  private move(position: Position) {
    this.actor.position = position
  }
}
