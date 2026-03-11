// Parameters.ts

const POINT_STEP = [
  0, 0.5, 1, 2, 4, 8, 16, 24, 32
] as const

export type Point = typeof POINT_STEP[number]

export type Parameter = {
  id: number
  name: string
  base: string | 10
  point?: Point
}

export const PARAMETER_LIST: Parameter[] = [
  { id: 0, name: '筋力', base: 10 },
  { id: 1, name: '敏捷力', base: 10 },
  { id: 2, name: '知力', base: 10 },
  { id: 3, name: '生命力', base: 10 },
  { id: 4, name: '武術', base: '筋力' },
  { id: 5, name: '剣術', base: '敏捷力' },
  { id: 6, name: '弓術', base: '敏捷力' },
  { id: 7, name: '木行術', base: '知力' },
  { id: 8, name: '火行術', base: '知力' },
  { id: 9, name: '土行術', base: '知力' },
  { id: 10, name: '金行術', base: '知力' },
  { id: 11, name: '水行術', base: '知力' },
  { id: 12, name: '怪力', base: '筋力' },
  { id: 13, name: '格闘', base: '筋力' },
  { id: 14, name: '柔術', base: '敏捷力' },
  { id: 15, name: '探索', base: '敏捷力' },
  { id: 16, name: '運動', base: '敏捷力' },
  { id: 17, name: '細工', base: '敏捷力' },
  { id: 18, name: '早業', base: '敏捷力' },
  { id: 19, name: '隠密', base: '敏捷力' },
  { id: 20, name: '軽業', base: '敏捷力' },
  { id: 21, name: '演奏', base: '敏捷力' },
  { id: 22, name: '舞踏', base: '敏捷力' },
  { id: 23, name: '技術', base: '敏捷力' },
  { id: 24, name: '礼法', base: '知力' },
  { id: 25, name: '交渉', base: '知力' },
  { id: 26, name: '尋問', base: '知力' },
  { id: 27, name: '演技', base: '知力' },
  { id: 28, name: '鑑定', base: '知力' },
  { id: 29, name: '治癒', base: '知力' },
  { id: 30, name: '歴史', base: '知力' },
  { id: 31, name: '言語', base: '知力' },
  { id: 32, name: '知識', base: '知力' },
  { id: 33, name: '修養', base: '知力' },
  { id: 34, name: '鍛錬', base: '生命力' },
  { id: 35, name: '歌唱', base: '生命力' }
] as const

export type ParameterName = typeof PARAMETER_LIST[number]['name']

// 能力値・技能値を、PointのMapとして司るクラス
export class Parameters {
  private points: Map<ParameterName, Parameter>

  // CPの配列をPointのMapに変換
  constructor(points: Point[]) {
    this.points = new Map(
      points.map((p, i) => [PARAMETER_LIST[i].name, { ...PARAMETER_LIST[i], point: p}])
    )
  }

  // nameとpointを指定し、Point を追加
  set(name: ParameterName, point: Point): Parameter {
    const param = PARAMETER_LIST.find(p => p.name === name)!
    this.points.set(name, { ...param, point })
    return this.points.get(name)!
  }

  // nameを指定し、Pointから削除
  unset(name: ParameterName) {
    this.points.delete(name)
  }

  // nameとsizeを指定してPointを増減し、変化後のPointを返す
  // Mapに無ければ追加する
  step(name: ParameterName, size: number = 1): number {
    if (size === 0) return this.get(name)
    return (size > 0) ? this.increase(name, Math.abs(size)) : this.decrease(name, Math.abs(size))
  }

  // nameを指定してPointを減らし、変化後のPointを返す
  decrease(name: ParameterName, size: number = 1): number {
    let result = 0 as Point
    for (let i = 0; i < size; i++) {
      const point = this.get(name)
      if (!point) {
        return 0 // Mapに無ければ無視
      }
      const index = POINT_STEP.indexOf(point as Point)
      // 最小値(0)であればそのまま返す
      result = index > 0 ? POINT_STEP[index - 1] : 0
      this.set(name, result)
    }
    return result
  }

  // nameを指定してPointを増やし、変化後のPointを返す
  increase(name: ParameterName, size: number = 1): number {
    let result = 0 as Point
    for (let i = 0; i < size; i++) {
      const point = this.get(name)
      if (!point) {
        this.set(name, 0.5) // Mapに無ければ追加
        result = 0.5
      }
      const index = POINT_STEP.indexOf(point as Point)
      // 最大値であればそのまま返す
      result = index < POINT_STEP.length - 1 ? POINT_STEP[index + 1] : point
      this.set(name, result)
    }
    return result
  }

  // nameを指定してPointを取り出す
  get(name: ParameterName): Point {
    const param = this.points.get(name)
    return param?.point ?? 0
  }

  // nameを指定してオブジェクトをそのまま返す
  getValue(name: ParameterName): Parameter {
    return this.points.get(name) ?? this.set(name, 0)
  }

  // nameを指定してlevelを返す
  getLevel(name: ParameterName): number {
    const base = PARAMETER_LIST.find(p => p.name === name)!.base as 10 | ParameterName // 必ず見つかる
    const baseValue = base !== 10 ? this.getLevel(base) : 10
    const point = this.get(name)
    if (!point) { // Mapに無ければbaseValueを返す
      return baseValue - 2 // -2が基準
    }
    return baseValue + POINT_STEP.indexOf(point) - 2
  }

  // 全てのパラメータを取得
  getAllParams(): Map<ParameterName, Parameter> {
    return this.points
  }

  // 全ての技能を取得 (ソート込み)
  getAllSkills() {
    return [...this.points].filter(p => p[1].base !== 10 && p[1].point! > 0)
      .sort((a, b) => a[1].id! - b[1].id!)
  }

  // Point総計を算出して返す
  getTotal(): number {
    let total = 0
    for (const p of this.points.values()) {
      total += p.point || 0
    }
    return total
  }
}
