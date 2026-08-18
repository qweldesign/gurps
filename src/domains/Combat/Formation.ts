// Combat/Formation.ts

import { SIDE_KEYS, POSITION_KEYS, type Side, type Position, CombatUnit as Unit } from './Unit'

export const BACK_VALUES = { player: [1, 2, 3, 4], enemy: [5, 6, 7, 8] } as const
export const FRONT_VALUES: Position[] = ['left', 'center', 'right'] as const

type BackFormation = Record<number, Unit | null>
type FrontFormation = Record<Position, Unit | null>
type Formation = { back: BackFormation, front: FrontFormation }

// ユニットの配置を司るクラス / Formationコンポーネントに対応
export class CombatFormation {
  public actor: Unit // CSSマーク用
  private units: Unit[]
  private back: Map<number, Unit | null>
  private front: Map<string, Unit | null>

  constructor(actor: Unit, units: Unit[]) {
    this.actor = actor
    this.units = units
    this.back = new Map<number, Unit | null>()
    this.front = new Map<string, Unit | null>()
    // Front 初期化
    SIDE_KEYS.forEach(side => {
      POSITION_KEYS.slice(1).forEach(position => {
        this.front.set(`${side}-${position}`, null)
      })
    })
    // ユニット配置 (Back 初期化含む)
    units.forEach((unit, i) => {
      if (unit.position === 'back') {
        this.back.set(i + 1, unit)
      } else {
        this.back.set(i + 1, null)
        this.front.set(`${unit.side}-${unit.position}`, unit)
      }
    })
  }

  // Store[Side][Position] でユニットへ静的アクセスできる
  private getFormation(side: Side): { back: BackFormation, front: FrontFormation } {
    const back = BACK_VALUES[side].reduce<BackFormation>((acc, value) => {
      acc[value] = this.back.get(value) ?? null
      return acc
    }, {} as BackFormation)

    const front = FRONT_VALUES.reduce<FrontFormation>((acc, pos) => {
      acc[pos] = this.front.get(`${side}-${pos}`) ?? null
      return acc
    }, {} as FrontFormation)

    return {
      back, front
    }
  }

  get player(): Formation {
    return this.getFormation('player')
  }

  get enemy(): Formation {
    return this.getFormation('enemy')
  }

  // 味方取得 (対象選択用. 気絶・死亡したユニットは戦闘から除外扱いとし, 対象に含めない. 「傀儡」等, これらを対象に取る術は別途専用の取得ロジックを設ける)
  getAllies(): Unit[] {
    return this.units.filter(unit => unit.side === this.actor.side && !unit.health.unconscious && !unit.health.dead)
  }

  // 敵取得 (対象選択用. 気絶・死亡したユニットは戦闘から除外扱いとし, 対象に含めない. 「傀儡」等, これらを対象に取る術は別途専用の取得ロジックを設ける)
  getEnemies(): Unit[] {
    return this.units.filter(unit => unit.side !== this.actor.side && !unit.health.unconscious && !unit.health.dead)
  }

  // 近接攻撃対象取得
  getMeleeTargets(): Unit[] {
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
}
