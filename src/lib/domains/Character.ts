// Character.ts

import { type Point, type ParameterName, type Parameter, Parameters } from './Parameters'
import { type Weapon, type Armor, type Dmg, type WeaponName, type ArmorName, type HeadArmorName, type ArmArmorName, type LegArmorName, type EquipmentSet, Equipments } from './Equipments'

export type CharacterData = {
  id: number
  name: string
  gender: string
  points: Point[]
  totalPoints: number
  equipments: EquipmentSet | null
  gold: number
}

export class Character {
  public id: number
  public name: string
  public gender: string
  protected parameters: Parameters
  public points: number
  protected equipments: Equipments
  public gold: number

  constructor(data: CharacterData) {
    const { id, name, gender, points, totalPoints, equipments, gold } = data
    this.id = id
    this.name = name
    this.gender = gender
    this.parameters = new Parameters(points)
    this.points = totalPoints
    this.equipments = new Equipments(equipments)
    this.gold = gold
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
      weight = Math.max(this.getBodyArmor().wt - 2, 0)
    }
    return this.parameters.getLevel(name) - weight
  }

  // 全てのパラメータを取得
  getAllParams() {
    return this.parameters.getAllParams()
  }

  // 全ての技能を取得
  getAllSkills() {
    return this.parameters.getAllSkills()
  }

  // 主技能 (Point消費が最も多い技能) を返す (無ければ「武術」を返す)
  // この関数は暫定的に作成 (Level でソートすべきかなど仕様が未定)
  getMainSkill(): Parameter {
    const skills = this.getAllSkills()
    if (skills.length) {
      const sorted = [...skills].sort((a, b) => {
        const pointA = a[1].point ?? 0
        const pointB = b[1].point ?? 0
        return pointB - pointA
      })
      return sorted[0][1]
    } else {
      this.setParam('武術', 0)
      return this.getParamValue('武術')
    }
  }

  // 主技能の技能値を返す
  getMainSkillLevel(): number {
    const skill = this.getMainSkill()
    return this.getParamLevel(skill.name)
  }

  // Point総計を算出して返す
  getParamTotal(): number {
    return this.parameters.getTotal()
  }

  // 武器をセット
  // autoSet オプションで 盾もセット (技能を指定する)
  setWeapon(weaponName: WeaponName, autoSet: boolean = true, skill: string = '武術'): Weapon {
    return this.equipments.setWeapon(weaponName, autoSet, skill)
  }

  // 射撃武器をセット
  setMissile(weaponName: WeaponName): Weapon {
    return this.equipments.setMissile(weaponName)
  }

  // 盾をセット
  setShield(weaponName: WeaponName): Weapon {
    return this.equipments.setShield(weaponName)
  }

  // 胴防具をセット
  // autoSet オプションで 頭, 腕, 脚もセット
  setBody(armorName: ArmorName, autoSet: boolean = true): Armor {
    return this.equipments.setBody(armorName, autoSet)
  }

  // 頭防具をセット
  setHead(armorName: HeadArmorName): Armor {
    return this.equipments.setHead(armorName)
  }

  // 腕防具をセット
  setArm(armorName: ArmArmorName): Armor {
    return this.equipments.setArm(armorName)
  }

  // 脚防具をセット
  setLeg(armorName: LegArmorName): Armor {
    return this.equipments.setLeg(armorName)
  }

  // 武器を取得
  getWeapon(): Weapon {
    return this.equipments.getWeapon()
  }
  
  // 武器の主用途を取得
  getMainUsage(): Weapon {
    return this.equipments.getMainUsage()
  }

  // 武器の副用途を取得
  getSubUsage(): Weapon {
    return this.equipments.getSubUsage()
  }

  // 射撃武器を取得
  getMissile(): Weapon {
    return this.equipments.getMissile()
  }

  // 盾を取得
  getShield(): Weapon {
    return this.equipments.getShield()
  }

  // 能力値と装備から Dmg を算出し、ダメージ型を足して返す
  getDmg(key: 'main' | 'sub' | 'missile' | 'shield' = 'main', typeOption = true): Dmg {
    return this.equipments.getDmg(key, typeOption, this.getDmgModifier())
  }

  // 能力値と装備から Dmg を算出し、表記を返す
  getDmgName(key: 'main' | 'sub' | 'missile' | 'shield' = 'main', typeOption = true): string {
    return this.equipments.getDmgName(key, typeOption, this.getDmgModifier())
  }

  // 能力値と装備から Lv を算出して返す
  getLevel(key: 'main' | 'sub' | 'missile' | 'shield' = 'main'): number {
    const weapon = (key === 'main' ? this.getMainUsage()
      : key === 'sub' ? this.getSubUsage()
      : key === 'missile' ? this.getMissile() : this.getShield())
    const skill = weapon.skillType
    if (skill === '剣術') {
      // 「武術」で「剣術」技能の武器を扱う場合は技能値の高い方を返す
      return Math.max(this.getParamLevel('武術', true), this.getParamLevel(skill, true))
    } else {
      return this.getParamLevel(skill, true)
    }
  }

  getMaxHP() {
    return this.getParamLevel('鍛錬') * 2
  }

  getDmgModifier() {
    return Math.floor(this.getParamLevel('怪力') / 2) - 5
  }

  getDEV() {
    return Math.floor(this.getParamLevel('運動', true) / 2) + 5
  }
  
  getRE() {
    return this.getParamLevel('修養')
  }

  // 胴防具を取得
  getBodyArmor(): Armor {
    return this.equipments.getBodyArmor()
  }

  // 頭防具を取得
  getHeadArmor(): Armor {
    return this.equipments.getHeadArmor()
  }

  // 腕防具を取得
  getArmArmor(): Armor {
    return this.equipments.getArmArmor()
  }

  // 脚防具を取得
  getLegArmor(): Armor {
    return this.equipments.getLegArmor()
  }

  // Gold総額を算出して返す
  getGold(): number {
    return this.equipments.getGold()
  }

  // シリアライズ用データ変換
  toData(): CharacterData {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      points: this.parameters.toData(),
      totalPoints: this.points,
      equipments: this.equipments.toData(),
      gold: this.gold
    }
  }
}
