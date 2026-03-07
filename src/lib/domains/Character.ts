// Character.ts

import { type Point, type ParameterName, type Parameter, Parameters } from './Parameters'
import { type Weapon, type Armor, type WeaponName, type ArmorName, type HeadArmorName, type ArmArmorName, type LegArmorName, type EquipmentSet, Equipments } from './Equipments'

export type Dmg = {
  id?: number
  name?: string
  dice: number
  mod: number
  type?: number
}

const DMG_STEP: Dmg[] = [
  { dice: 1, mod: -4 },
  { dice: 1, mod: -3 },
  { dice: 1, mod: -2 },
  { dice: 1, mod: -1 },
  { dice: 1, mod: 0 },
  { dice: 1, mod: 1 },
  { dice: 1, mod: 2 },
  { dice: 2, mod: -1 },
  { dice: 2, mod: 0 },
  { dice: 2, mod: 1 },
  { dice: 2, mod: 2 },
  { dice: 3, mod: -1 },
  { dice: 3, mod: 0 },
  { dice: 3, mod: 1 },
  { dice: 3, mod: 2 },
  { dice: 4, mod: -1 },
  { dice: 4, mod: 0 },
  { dice: 4, mod: 1 }
]

DMG_STEP.map((dmg, i) => {
  dmg.id = i
  const mod = dmg.mod > 0 ? `+${dmg.mod}` : dmg.mod === 0 ? '' : dmg.mod
  dmg.name = `${dmg.dice}d${mod}`
})

export class Character {
  public id: number
  public name: string
  public gender: string
  private parameters: Parameters
  private equipments: Equipments

  constructor(id: number, name: string, gender: string, points: Point[], equipments: EquipmentSet | null) {
    this.id = id
    this.name = name
    this.gender = gender
    this.parameters = new Parameters(points)
    this.equipments = new Equipments(equipments)
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
  stepParam(name: ParameterName, size: -1 | 1 = 1): number {
    return (size === 1) ? this.parameters.increase(name) : this.parameters.decrease(name)
  }

  // nameを指定してPointを減らし、変化後のPointを返す
  decreaseParam(name: ParameterName): number {
    return this.parameters.decrease(name)
  }

  // nameを指定してPointを増やし、変化後のPointを返す
  increaseParam(name: ParameterName): number {
    return this.parameters.increase(name)
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

  // Point総計を算出して返す
  getParamTotal(): number {
    return this.parameters.getTotal()
  }

  // 武器をセット
  // autoSet オプションで 盾もセット (技能を指定する)
  setWeapon(weaponName: WeaponName, autoSet: boolean = true, skill: string = '武術'): Weapon {
    return this.equipments.setWeapon(weaponName, autoSet, skill)
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
  getSubUsage(): Weapon | null {
    return this.equipments.getSubUsage()
  }

  // 盾を取得
  getShield(): Weapon | null {
    return this.equipments.getShield()
  }

  // 能力値と装備から Dmg を算出し、ダメージ型を足して返す
  getDmg(key: 'main' | 'sub' | 'shield' = 'main'): Dmg | null {
    const weapon = (key === 'main' ? this.getMainUsage()
      : key === 'sub' ? this.getSubUsage() : this.getShield())
    if (weapon) {
      const dmg = weapon.baseDmg + this.getDmgModifier()
      return { ...DMG_STEP[dmg], type: weapon.dmgType }
    } else {
      return null
    }
  }

  getDmgName(key: 'main' | 'sub' | 'shield' = 'main') {
    const dmg = this.getDmg(key)
    if (!dmg) return null
    const dmgType = dmg.type === 1 ? ' (刺)' : dmg.type === 2 ? ' (切)' : dmg.type === 3 ? ' (叩)' : ''
    return `${dmg.name}${dmgType}`
  }

  // 能力値と装備から Lv を算出して返す
  getLevel(key: 'main' | 'sub' | 'shield' = 'main'): number | null {
    const weapon = (key === 'main' ? this.getMainUsage()
      : key === 'sub' ? this.getSubUsage() : this.getShield())
    if (weapon) {
      const skill = weapon.skillType
      if (skill === '剣術') {
        // 「武術」で「剣術」技能の武器を扱う場合は技能値の高い方を返す
        return Math.max(this.getParamLevel('武術', true), this.getParamLevel(skill, true))
      } else {
        return this.getParamLevel(skill, true)
      }
      
    } else {
      return null
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
  getHeadArmor(): Armor | null {
    return this.equipments.getHeadArmor()
  }

  // 腕防具を取得
  getArmArmor(): Armor | null {
    return this.equipments.getArmArmor()
  }

  // 脚防具を取得
  getLegArmor(): Armor | null {
    return this.equipments.getLegArmor()
  }
}
