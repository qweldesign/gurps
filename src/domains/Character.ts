// Character.ts

import { type Point, type ParameterName, type Parameter, Parameters } from './Parameters'
import { type Weapon, type Armor, type Dmg, type WeaponName, type ArmorName, type HeadArmorName, type ArmArmorName, type LegArmorName, type EquipmentSet, Equipments } from './Equipments'
import { STORAGE_KEY } from './SaveData'

export type CharacterModel = {
  id: number
  name: string
  gender: string
  points: Point[]
  totalPoints: number
  equipments: EquipmentSet | null
}

export class Character {
  public id: number
  public uid: string
  public name: string
  public gender: string
  public points: number
  protected parameters: Parameters
  protected equipments: Equipments
  private storageKey: string

  constructor(model: CharacterModel) {
    const { id, name, gender, points, totalPoints, equipments } = model
    this.id = id
    this.uid = String(id).padStart(2, '0')
    this.name = name
    this.gender = gender
    this.points = totalPoints
    this.parameters = new Parameters(points)
    this.equipments = new Equipments(equipments)
    this.storageKey = `${STORAGE_KEY}:${this.uid}`
  }

  // nameとpointを指定し、Point を追加
  setParam(name: ParameterName, point: Point) {
    return this.parameters.set(name, point)
  }

  // nameを指定し、Pointから削除
  unsetParam(name: ParameterName) {
    this.parameters.unset(name)
  }

  // nameとsizeを指定してPointを増減し、変化後のPointを返す
  // Mapに無ければ追加する
  stepParam(name: ParameterName, size: number = 1): number {
    if (size === 0) return this.getParam(name)
    return (size > 0) ? this.parameters.increase(name, Math.abs(size)) : this.parameters.decrease(name, Math.abs(size))
  }

  // nameを指定してPointを減らし、変化後のPointを返す
  decreaseParam(name: ParameterName, size: number = 1): number {
    return this.parameters.decrease(name, size)
  }

  // nameを指定してPointを増やし、変化後のPointを返す
  increaseParam(name: ParameterName, size: number = 1): number {
    return this.parameters.increase(name, size)
  }

  // nameを指定してPointを取り出す
  getParam(name: ParameterName): Point {
    return this.parameters.get(name)
  }

  // nameを指定してオブジェクトをそのまま返す
  getParamValue(name: ParameterName): Parameter {
    return this.parameters.getValue(name)
  }

  // nameを指定してlevelを返すか, 無い場合は追加してその値を返す
  // includeWeight オプションにて胴防具の重量を加味
  getParamLevel(name: ParameterName, includeWeight: boolean = false): number {
    const param = this.getParamValue(name)
    let weight = 0
    // 胴防具の重量を加味するのは 敏捷力 ベースのパラメータのみ
    if (includeWeight && (param.name === '敏捷力' || param.base === '敏捷力')) {
      // 敏捷力への修正は 重量 - 2 と定義
      weight = Math.max(this.body.wt - 2, 0)
    }
    return this.parameters.getLevel(name) - weight
  }

  // 全てのパラメータを取得
  get params() {
    return this.parameters.params
  }

  // 全ての技能を取得
  get skills() {
    return this.parameters.skills
  }

  // 主技能 (Point消費が最も多い技能) を返す (無ければ「武術」を返す)
  // この関数は暫定的に作成 (Level でソートすべきかなど仕様が未定)
  get mainSkill(): Parameter {
    let skill: Parameter
    if (this.skills.length) {
      const sorted = [...this.skills].sort((a, b) => {
        const pointA = a[1].point ?? 0
        const pointB = b[1].point ?? 0
        return pointB - pointA
      })
      skill = sorted[0][1]
    } else {
      this.setParam('武術', 0)
      skill = this.getParamValue('武術')
    }
    return {
      ...skill,
      level: this.getParamLevel(skill.name)
    }
  }

  // Point総計を算出して返す
  get currentTotal(): number {
    return this.parameters.total
  }

  // 武器をセット
  set weapon(weaponName: WeaponName) {
    this.equipments.setWeapon(weaponName, false)
  }

  // autoSet オプションで 盾もセット (技能を指定する)
  setWeapon(weaponName: WeaponName, autoSet: boolean = true, skill: string = '武術'): Weapon {
    return this.equipments.setWeapon(weaponName, autoSet, skill)
  }

  // 射撃武器をセット
  set missile(weaponName: WeaponName) {
    this.equipments.missile = weaponName
  }

  // 盾をセット
  set shield(weaponName: WeaponName) {
    this.equipments.shield = weaponName
  }

  // 胴防具をセット
  set body(armorName: ArmorName) {
    this.equipments.setBody(armorName, false)
  }

  // autoSet オプションで 頭, 腕, 脚もセット
  setBody(armorName: ArmorName, autoSet: boolean = true): Armor {
    return this.equipments.setBody(armorName, autoSet)
  }

  // 頭防具をセット
  set head(armorName: HeadArmorName) {
    this.equipments.head = armorName
  }

  // 腕防具をセット
  set arm(armorName: ArmArmorName) {
    this.equipments.arm = armorName
  }

  // 脚防具をセット
  set leg(armorName: LegArmorName) {
    this.equipments.leg = armorName
  }

  // 武器を取得
  get weapon(): Weapon {
    return this.equipments.weapon
  }
  
  // 武器の主用途を取得
  get mainUsage(): Weapon {
    return this.equipments.mainUsage
  }

  // 武器の副用途を取得
  get subUsage(): Weapon {
    return this.equipments.subUsage
  }

  // 射撃武器を取得
  get missile(): Weapon {
    return this.equipments.missile
  }

  // 盾を取得
  get shield(): Weapon {
    return this.equipments.shield
  }

  // 能力値と装備から Dmg を算出し、ダメージ型を足して返す
  getDmg(key: 'main' | 'sub' | 'missile' | 'shield' = 'main', typeOption = true): Dmg {
    return this.equipments.getDmg(key, typeOption, this.dmgModifier)
  }

  // 能力値と装備から Dmg を算出し、表記を返す
  getDmgName(key: 'main' | 'sub' | 'missile' | 'shield' = 'main', typeOption = true): string {
    return this.equipments.getDmgName(key, typeOption, this.dmgModifier)
  }

  // 能力値と装備から Lv を算出して返す
  getLevel(key: 'main' | 'sub' | 'missile' | 'shield' = 'main'): number {
    const weapon = key === 'main' ? this.mainUsage
      : key === 'sub' ? this.subUsage
      : key === 'missile' ? this.missile : this.shield
    const skill = weapon.skillType
    if (skill === '剣術') {
      // 「武術」で「剣術」技能の武器を扱う場合は技能値の高い方を返す
      return Math.max(this.getParamLevel('武術', true), this.getParamLevel(skill, true))
    } else {
      return this.getParamLevel(skill, true)
    }
  }

  get maxHP() {
    return this.getParamLevel('鍛錬') * 2
  }

  get dmgModifier() {
    return Math.floor(this.getParamLevel('怪力') / 2) - 5
  }

  get DEV() {
    return Math.floor(this.getParamLevel('運動', true) / 2) + 5
  }
  
  get PRE() {
    return this.getParamLevel('生命力')
  }
  
  get MRE() {
    return this.getParamLevel('修養')
  }

  // 胴防具を取得
  get body(): Armor {
    return this.equipments.body
  }

  // 頭防具を取得
  get head(): Armor {
    return this.equipments.head
  }

  // 腕防具を取得
  get arm(): Armor {
    return this.equipments.arm
  }

  // 脚防具を取得
  get leg(): Armor {
    return this.equipments.leg
  }

  // Gold総額を算出して返す
  get gold(): number {
    return this.equipments.gold
  }

  // シリアライズ用データ変換
  toModel(): CharacterModel {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      points: this.parameters.toModel(),
      totalPoints: this.points,
      equipments: this.equipments.toModel()
    }
  }

  // 保存
  save(isTemporary: boolean = false) {
    const storage = isTemporary ? sessionStorage : localStorage
    const model = this.toModel()
    const raw = JSON.stringify(model)
    storage.setItem(this.storageKey, raw)
  }

  // 読み込み
  load(isTemporary: boolean = false) {
    const storage = isTemporary ? sessionStorage : localStorage
    const raw = storage.getItem(this.storageKey) ?? '{}'
    const model = JSON.parse(raw)
    return model
  }

  // クリア
  clear() {
    localStorage.removeItem(this.storageKey)
    sessionStorage.removeItem(this.storageKey)
  }
}
