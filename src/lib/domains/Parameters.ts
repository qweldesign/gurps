// Parameters.ts

const POINT_STEP = [
  0, 0.5, 1, 2, 4, 8, 16
] as const

export type Point = typeof POINT_STEP[number]

const PARAMETER_LIST = [
  { name: '筋力', base: 10 },
  { name: '敏捷力', base: 10 },
  { name: '知力', base: 10 },
  { name: '生命力', base: 10 },
  { name: '武術', base: '筋力' },
  { name: '剣術', base: '敏捷力' },
  { name: '弓術', base: '敏捷力' },
  { name: '木行術', base: '知力' },
  { name: '火行術', base: '知力' },
  { name: '土行術', base: '知力' },
  { name: '金行術', base: '知力' },
  { name: '水行術', base: '知力' },
  { name: '怪力', base: '筋力' },
  { name: '格闘', base: '筋力' },
  { name: '柔術', base: '敏捷力' },
  { name: '探索', base: '敏捷力' },
  { name: '運動', base: '敏捷力' },
  { name: '細工', base: '敏捷力' },
  { name: '早業', base: '敏捷力' },
  { name: '隠密', base: '敏捷力' },
  { name: '軽業', base: '敏捷力' },
  { name: '演奏', base: '敏捷力' },
  { name: '舞踏', base: '敏捷力' },
  { name: '技術', base: '敏捷力' },
  { name: '礼法', base: '知力' },
  { name: '交渉', base: '知力' },
  { name: '尋問', base: '知力' },
  { name: '演技', base: '知力' },
  { name: '鑑定', base: '知力' },
  { name: '治癒', base: '知力' },
  { name: '歴史', base: '知力' },
  { name: '言語', base: '知力' },
  { name: '知識', base: '知力' },
  { name: '修養', base: '知力' },
  { name: '鍛錬', base: '生命力' },
  { name: '歌唱', base: '生命力' }
] as const

export type Parameter = typeof PARAMETER_LIST[number]['name']

// 能力値・技能値を、PointのMapとして司るクラス
export class Parameters {
  private points: Map<Parameter, Point>

  // CPの配列をPointのMapに変換
  constructor(points: Point[]) {
    this.points = new Map(
      points.map((p, i) => [PARAMETER_LIST[i].name, p])
    )
  }

  // nameとpointを指定し、Point を追加
  set(name: Parameter, point: Point) {
    this.points.set(name, point)
  }

  // nameを指定し、Pointから削除
  unset(name: Parameter) {
    this.points.delete(name)
  }

  // nameとsizeを指定してPointを増減し、変化後のPointを返す
  // Mapに無ければ追加する
  step(name: Parameter, size: -1 | 1 = 1): number {
    return (size === 1) ? this.increase(name) : this.decrease(name)
  }

  // nameを指定してPointを減らし、変化後のPointを返す
  decrease(name: Parameter): number {
    const point = this.points.get(name)
    if (!point) {
      return 0 // Mapに無ければ無視
    }
    const index = POINT_STEP.indexOf(point as Point)
    // 最小値(0)であればそのまま返す
    const result = index > 0 ? POINT_STEP[index - 1] : 0
    this.points.set(name, result)
    return result
  }

  // nameを指定してPointを増やし、変化後のPointを返す
  increase(name: Parameter): number {
    const point = this.points.get(name)
    if (!point) {
      this.points.set(name, 0.5) // Mapに無ければ追加
      return 0.5
    }
    const index = POINT_STEP.indexOf(point as Point)
    // 最大値であればそのまま返す
    const result = index < POINT_STEP.length - 1 ? POINT_STEP[index + 1] : point
    this.points.set(name, result)
    return result
  }

  // nameを指定してPointを取り出す
  get(name: Parameter): Point {
    return this.points.get(name) ?? 0
  }

  // nameを指定してPointからValueを算出して返す
  getValue(name: Parameter): number {
    const base = PARAMETER_LIST.find(p => p.name === name)!.base as 10 | Parameter // 必ず見つかる
    const baseValue = base !== 10 ? this.getValue(base) : 10
    const point = this.points.get(name)
    if (!point) { // Mapに無ければbaseValueを返す
      return baseValue - 2 // -2が基準
    }
    return baseValue + POINT_STEP.indexOf(point) - 2
  }

  // 全てのパラメータを取得
  getAll(): Map<Parameter, Point> {
    return this.points
  }

  // 全ての技能を取得 (ソート込み)
  getSkills() {
    const skills: Map<Parameter, Point> = new Map()
    PARAMETER_LIST.forEach(param => {
      if (
        param.name !== '筋力'
        && param.name !== '敏捷力'
        && param.name !== '知力'
        && param.name !== '生命力'
        && this.get(param.name) > 0
      ) {
        skills.set(param.name, this.get(param.name))
      }
    })
    return skills
  }

  // Point総計を算出して返す
  getTotal(): number {
    let total = 0
    for (const p of this.points.values()) {
      total += p
    }
    return total
  }
}
