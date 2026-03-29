// Parameters.ts

const POINT_STEP = [
  0, 0.5, 1, 2, 4, 8, 16, 24, 32
] as const

const PARAMETER_KEYS = [
  '筋力', '敏捷力', '知力', '生命力',
  '武術', '剣術', '弓術', '木行術', '火行術', '土行術', '金行術', '水行術',
  '怪力', '格闘', '柔術', '探索', '運動', '細工', '早業', '隠密', '軽業', '演奏', '舞踏', '技術',
  '礼法', '交渉', '尋問', '演技', '鑑定', '治癒', '歴史', '言語', '知識', '修養', '鍛錬', '歌唱'
] as const

const PARAMETERS: Record<ParameterKey, { id: number, base: ParameterKey | 10 }> = {
  '筋力': { id: 0, base: 10 },
  '敏捷力': { id: 1, base: 10 },
  '知力': { id: 2, base: 10 },
  '生命力': { id: 3, base: 10 },
  '武術': { id: 4, base: '筋力' },
  '剣術': { id: 5, base: '敏捷力' },
  '弓術': { id: 6, base: '敏捷力' },
  '木行術': { id: 7, base: '知力' },
  '火行術': { id: 8, base: '知力' },
  '土行術': { id: 9, base: '知力' },
  '金行術': { id: 10, base: '知力' },
  '水行術': { id: 11, base: '知力' },
  '怪力': { id: 12, base: '筋力' },
  '格闘': { id: 13, base: '筋力' },
  '柔術': { id: 14, base: '敏捷力' },
  '探索': { id: 15, base: '敏捷力' },
  '運動': { id: 16, base: '敏捷力' },
  '細工': { id: 17, base: '敏捷力' },
  '早業': { id: 18, base: '敏捷力' },
  '隠密': { id: 19, base: '敏捷力' },
  '軽業': { id: 20, base: '敏捷力' },
  '演奏': { id: 21, base: '敏捷力' },
  '舞踏': { id: 22, base: '敏捷力' },
  '技術': { id: 23, base: '敏捷力' },
  '礼法': { id: 24, base: '知力' },
  '交渉': { id: 25, base: '知力' },
  '尋問': { id: 26, base: '知力' },
  '演技': { id: 27, base: '知力' },
  '鑑定': { id: 28, base: '知力' },
  '治癒': { id: 29, base: '知力' },
  '歴史': { id: 30, base: '知力' },
  '言語': { id: 31, base: '知力' },
  '知識': { id: 32, base: '知力' },
  '修養': { id: 33, base: '知力' },
  '鍛錬': { id: 34, base: '生命力' },
  '歌唱': { id: 35, base: '生命力' }
} as const

export type Point = typeof POINT_STEP[number]

export type ParameterKey = typeof PARAMETER_KEYS[number]

export type Parameter = {
  id: number
  name: ParameterKey
  base: ParameterKey | 10
  point: Point
  level: number
}

// 能力値・技能値を Point の Map として司るクラス
export class Parameters {
  private points: Map<ParameterKey, Point>

  // CPの配列を Point の Map に変換
  constructor(points: Point[]) {
    this.points = new Map(
      points.map((p, i) => [PARAMETER_KEYS[i], p])
    )
  }

  // name と point を指定し, Point を追加
  private set(name: ParameterKey, point: Point) {
    point > 0 ? this.points.set(name, point) : this.unset(name)
  }

  // name を指定し, Point から削除
  private unset(name: ParameterKey) {
    this.points.delete(name)
  }

  // name を指定し, Point を減らす
  private decrease(name: ParameterKey, size: number = 1) {
    for (let i = 0; i < size; i++) {
      const point = this.get(name)
      if (!point) return // Map に無ければ無視
      const index = POINT_STEP.indexOf(point as Point)
      const result = index > 0 ? POINT_STEP[index - 1] : 0 // 最小値(0)であれば削除
      this.set(name, result)
    }
  }

  // name を指定し, Pointを増やす
  private increase(name: ParameterKey, size: number = 1) {
    for (let i = 0; i < size; i++) {
      const point = this.get(name)
      if (!point) this.set(name, 0.5) // Map に無ければ追加
      const index = POINT_STEP.indexOf(point as Point)
      const result = index < POINT_STEP.length - 1 ? POINT_STEP[index + 1] : point // 最大値であれば無視
      this.set(name, result)
    }
  }

  // name と size を指定し, Point を増減
  // Map に無ければ追加し, 最小値(0)になれば削除する
  step(name: ParameterKey, size: number = 1) {
    (size > 0) ? this.increase(name, Math.abs(size)) : this.decrease(name, Math.abs(size))
  }

  // name を指定し, Point を取得
  get(name: ParameterKey): Point {
    return this.points.get(name) ?? 0
  }

  // name を指定し, level を算出
  getLevel(name: ParameterKey): number {
    const base = PARAMETERS[name].base
    const baseValue = base !== 10 ? this.getLevel(base) : 10
    const point = this.get(name)
    if (!point) return baseValue - 2 // Map に無ければ baseValue を返す (-2が基準)
    return baseValue + POINT_STEP.indexOf(point) - 2
  }

  // name を指定し, その全ての属性を, オブジェクトに変換して取得
  getValue(name: ParameterKey): Parameter {
    return {
      name, point: this.get(name), level: this.getLevel(name), ...PARAMETERS[name]
    }
  }
  
  // 全てのパラメータとその全ての属性を, オブジェクトの配列に変換して取得 (ソート込み)
  get params(): Parameter[] {
    return [...this.points]
      .map(([name]) => this.getValue(name))
      .sort((a, b) => a.id - b.id)
  }

  // 全ての技能とその全ての属性を, オブジェクトの配列に変換して取得 (ソート込み)
  get skills(): Parameter[] {
    return this.params
      .filter(p => p.base !== 10)
  }

  // 「武術」保有判定
  get isWarrior(): boolean {
    return this.get('武術') > 0 ? true : false
  }

  // 「剣術」保有判定
  get isFencer(): boolean {
    return this.get('剣術') > 0 ? true : false
  }

  // Point 総計を算出
  get total(): number {
    let total = 0
    for (const p of this.points.values()) total += p ?? 0
    return total
  }

  // Model用データに変換
  get model(): Point[] {
    return PARAMETER_KEYS.map(key => this.get(key))
  }
}
