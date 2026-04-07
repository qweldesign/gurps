// Character.ts

import { type Point, type ParameterKey, type Parameter, Parameters } from './Parameters'
import { type WeaponKey, type BodyArmorKey, type HeadArmorKey, type ArmArmorKey, type LegArmorKey, type EquipmentSet, type Weapon, type Armor, type Dmg, type WeaponSlotKey, type ArmorSlotKey, Equipments } from './Equipments'
import { STORAGE_KEY } from './SaveData'

export type CharacterModel = {
  id: number
  name: string
  gender: string
  points: Point[]
  equipments: EquipmentSet
}

// キャラクターを司るクラス
export class Character {
  public id: number
  public name: string
  public gender: string
  protected parameters: Parameters
  protected equipments: Equipments
  private storageKey: string

  constructor(model: CharacterModel) {
    const { id, name, gender, points, equipments } = model
    this.id = id
    this.name = name
    this.gender = gender
    this.parameters = new Parameters(points)
    this.equipments = new Equipments(equipments)
    this.storageKey = `${STORAGE_KEY}:${String(id).padStart(2, '0')}`
  }

  // name と size を指定し, Point を増減
  // Map に無ければ追加し, 最小値(0)になれば削除する
  stepParam(name: ParameterKey, size: number = 1) {
    this.parameters.step(name, size)
  }

  // name を指定し, Point を取得
  getParam(name: ParameterKey): Point {
    return this.parameters.get(name)
  }

  // name を指定し, level を算出
  // includeWeight オプションにて胴防具の重量を加味
  getParamLevel(name: ParameterKey, includeWeight: boolean = false): number {
    const param = this.parameters.getValue(name)
    let weight = 0
    // 胴防具の重量を加味するのは 敏捷力 ベースのパラメータのみ
    if (includeWeight && (param.name === '敏捷力' || param.base === '敏捷力')) {
      // 敏捷力への修正は 重量 - 2 と定義
      weight = Math.max(this.body.wt - 2, 0)
    }
    return this.parameters.getLevel(name) - weight
  }

  // name を指定し, その全ての属性を, オブジェクトに変換して取得
  getParamValue(name: ParameterKey): Parameter {
    return this.parameters.getValue(name)
  }

  // 全てのパラメータとその全ての属性を, オブジェクトの配列に変換して取得 (ソート込み)
  get params() {
    return this.parameters.params
  }

  // 全ての技能とその全ての属性を, オブジェクトの配列に変換して取得 (ソート込み)
  get skills() {
    return this.parameters.skills
  }

  // 「武術」保有判定
  get isWarrior(): boolean {
    return this.parameters.isWarrior
  }

  // 「剣術」保有判定
  get isFencer(): boolean {
    return this.parameters.isFencer
  }

  // Point 総計を算出
  get total(): number {
    return this.parameters.total
  }

  // 主技能 (level が最も高いか Point 消費が最も多い技能) を取得
  // 無ければ「武術」を返す
  get mainSkill(): Parameter {
    if (this.skills.length) {
      const sorted = this.skills.sort((a, b) => {
        return b.level === a.level ? b.point - a.point : b.level - a.level
      })
      return sorted[0]
    } else {
      return {
        name: '武術', id: 4, base: '筋力', point: 0, level: this.getParamLevel('筋力') - 2
      }
    }
  }

  // 最大Hpを取得
  get maxHp() {
    return this.getParamLevel('鍛錬') * 2
  }

  // ダメージ修正を取得
  get dmgModifier() {
    return Math.floor(this.getParamLevel('怪力') / 2) - 5
  }

  //「よけ」を取得
  get DEV() {
    return Math.floor(this.getParamLevel('運動', true) / 2) + 5
  }

  // 身体抵抗値を取得
  get PRE() {
    return this.getParamLevel('生命力')
  }

  // 精神抵抗値を取得
  get MRE() {
    return this.getParamLevel('修養')
  }

  // 武器をセット
  set weapon(weaponKey: WeaponKey) {
    this.equipments.setWeapon(weaponKey, false)
  }

  // autoSet オプションで 盾もセット (技能を指定する)
  setWeapon(weaponKey: WeaponKey, autoSet: boolean = true, skill: string = '武術') {
    this.equipments.setWeapon(weaponKey, autoSet, skill)
  }

  // 予備武器をセット
  set spare(weaponKey: WeaponKey) {
    this.equipments.spare = weaponKey
  }

  // 盾をセット
  set shield(weaponKey: WeaponKey) {
    this.equipments.shield = weaponKey
  }

  // 胴防具をセット
  set body(armorKey: BodyArmorKey) {
    this.equipments.setBody(armorKey, false)
  }

  // autoSet オプションで 頭, 腕, 脚もセット
  setBody(armorKey: BodyArmorKey, autoSet: boolean = true): Armor {
    return this.equipments.setBody(armorKey, autoSet)
  }

  // 頭防具をセット
  set head(armorKey: HeadArmorKey) {
    this.equipments.head = armorKey
  }

  // 腕防具をセット
  set arm(armorKey: ArmArmorKey) {
    this.equipments.arm = armorKey
  }

  // 脚防具をセット
  set leg(armorKey: LegArmorKey) {
    this.equipments.leg = armorKey
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

  // 予備武器を取得
  get spare(): Weapon {
    return this.equipments.spare
  }

  // 盾を取得
  get shield(): Weapon {
    return this.equipments.shield
  }

  // 武器スロット一式を取得
  get weapons(): Record<WeaponSlotKey, Weapon> {
    return this.equipments.weapons
  }

  // 能力値と装備から Dmg を算出し, ダメージ型を足した Dmg 型を返す
  getDmg(key: WeaponSlotKey = 'main', typeOption = true): Dmg {
    return this.equipments.getDmg(key, typeOption, this.dmgModifier)
  }

  // 能力値と装備から Dmg を算出し, 表記を返す
  getDmgName(key: WeaponSlotKey = 'main', typeOption = true): string {
    return this.equipments.getDmgName(key, typeOption, this.dmgModifier)
  }

  // 能力値と装備から level を算出して返す
  getLevel(key: WeaponSlotKey = 'main'): number {
    const weapon = key === 'main' ? this.mainUsage
      : key === 'sub' ? this.subUsage
      : key === 'spare' ? this.spare : this.shield
    const skill = weapon.skill
    if (skill === '剣術') {
      // 「武術」で「剣術」技能の武器を扱う場合は技能値の高い方を返す
      return Math.max(this.getParamLevel('武術', true), this.getParamLevel(skill, true))
    } else {
      return this.getParamLevel(skill, true)
    }
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

  // 防具スロット一式を取得
  get armors(): Record<ArmorSlotKey, Armor> {
    return this.equipments.armors
  }

  // Gold総額を算出して返す
  get gold(): number {
    return this.equipments.gold
  }
  
  // Model用データに変換
  get model(): CharacterModel {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      points: this.parameters.model,
      equipments: this.equipments.model
    }
  }

  // 保存
  save(isTemporary: boolean = false) {
    const storage = isTemporary ? sessionStorage : localStorage
    const model = this.model
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
