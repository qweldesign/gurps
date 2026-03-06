// Character.ts

import { type Point, type Parameter, Parameters } from './Parameters'

export class Character {
  public id: number
  public name: string
  public position: number // 0: 戦士, 1: 剣士, 2: 弓使い(フリー), 3: 術士
  public gender: string
  private parameters: Parameters

  // CPの配列をParametersクラスの型に変換
  constructor(id: number, name: string, gender: string, position: number, points: Point[]) {
    this.id = id
    this.name = name
    this.gender = gender
    this.position = position
    this.parameters = new Parameters(points)
  }

  // nameとpointを指定し、Point を追加
  setParam(name: Parameter, point: Point) {
    this.parameters.set(name, point)
  }

  // nameを指定し、Pointから削除
  unsetParam(name: Parameter) {
    this.parameters.unset(name)
  }

  // nameとsizeを指定してPointを増減し、変化後のPointを返す
  // Mapに無ければ追加する
  stepParam(name: Parameter, size: -1 | 1 = 1): number {
    return (size === 1) ? this.parameters.increase(name) : this.parameters.decrease(name)
  }

  // nameを指定してPointを減らし、変化後のPointを返す
  decreaseParam(name: Parameter): number {
    return this.parameters.decrease(name)
  }

  // nameを指定してPointを増やし、変化後のPointを返す
  increaseParam(name: Parameter): number {
    return this.parameters.increase(name)
  }

  // nameを指定してPointを取り出す
  getParam(name: Parameter): Point {
    return this.parameters.get(name)
  }

  // nameを指定してPointからValueを算出して返す
  getParamValue(name: Parameter): number {
    return this.parameters.getValue(name)
  }

  // 全てのパラメータを取得
  getParams(): Map<Parameter, Point> {
    return this.parameters.getAll()
  }

  // 全ての技能を取得
  getSkills() {
    return this.parameters.getSkills()
  }

  // Point総計を算出して返す
  getParamTotal(): number {
    return this.parameters.getTotal()
  }
}
