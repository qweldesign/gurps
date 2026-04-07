// Equipments.ts

import { type ParameterKey } from "./Parameters"

export const WEAPON_KEYS = [
  '装備無し', 'ダガー', 'ショートソード', 'レイピア', 'ロングソード', 'バスタードソード', 'グレートソード',
  '三日月刀', '蒼龍刀', '鎚槌', '手斧', '戦鎚', '戦斧', '杖', '長槍', '薙刀', '鉾槍',
  '短弓', '長弓', '弩', '拳', '蹴り', '拳+1', '蹴り+1', '拳+2', '蹴り+2',
  '小盾', '中盾', '大盾'
] as const

const WEAPON_USAGE_KEYS = ['バスタードソード(片手)', 'バスタードソード(両手)', '蒼龍刀(片手)', '蒼龍刀(両手)', '鉾槍(突き)', '鉾槍(振り)'] as const

export const BODY_ARMOR_KEYS = [
  '装備無し', '服', '革服', '革鎧', 'チェインメイル', 'ブリガンディ', 'プレイトメイル'
] as const

export const HEAD_ARMOR_KEYS = [
  '装備無し', '革の帽子', 'ヘッドギア', 'チェインコイフ', 'オープンヘルム', 'クローズヘルム'
] as const

export const ARM_ARMOR_KEYS = [
  '装備無し', 'グローブ', 'レザーグローブ', 'ガントレット', 'ヴァンブレイス'
] as const

export const LEG_ARMOR_KEYS = [
  '装備無し', 'ブーツ', 'レザーブーツ', 'ソールレット', 'グリーヴ'
] as const

export const WEAPONS: Record<WeaponKey, Weapon> = {
  '装備無し': { id: 0, name: '装備無し', weaponType: 0, baseDmg: 2, dmgType: 0, skill: '格闘', ready: 0, ev: 0, gold: 0 },
  'ダガー': { id: 1, name: 'ダガー', weaponType: 1, baseDmg: 6, dmgType: 2, skill: '剣術', ready: 0, ev: 1, gold: 30 },
  'ショートソード': { id: 2, name: 'ショートソード', weaponType: 1, baseDmg: 6, dmgType: 1, skill: '剣術', ready: 0, ev: 1, gold: 40 },
  'レイピア': { id: 3, name: 'レイピア', weaponType: 1, baseDmg: 8, dmgType: 2, skill: '剣術', ready: 0, ev: 1, gold: 60 },
  'ロングソード': { id: 4, name: 'ロングソード', secondName: 'バスタードソード(片手)', weaponType: 1, baseDmg: 8, dmgType: 1, skill: '剣術', ready: 0, ev: 1, gold: 80 },
  'バスタードソード': { id: 5, name: 'バスタードソード', secondName: 'バスタードソード(両手)', weaponType: 3, baseDmg: 10, dmgType: 10 , skill: '武術', ready: 0, ev: 2, usage: 'ロングソード', gold: 120 },
  'グレートソード': { id: 6, name: 'グレートソード', weaponType: 3, baseDmg: 12, dmgType: 1, skill: '武術', ready: 0, ev: 2, gold: 160 },
  '三日月刀': { id: 7, name: '三日月刀', secondName: '蒼龍刀(片手)', weaponType: 1, baseDmg: 8, dmgType: 1, skill: '剣術', ready: 0, ev: 1, gold: 80 },
  '蒼龍刀': { id: 8, name: '蒼龍刀', secondName: '蒼龍刀(両手)', weaponType: 3, baseDmg: 10, dmgType: 1, skill: '武術', ready: 0, ev: 2, usage: '三日月刀', gold: 120 },
  '鎚槌': { id: 9, name: '鎚槌', weaponType: 2, baseDmg: 8, dmgType: 0, skill: '剣術', ready: 1, ev: 1, gold: 25 },
  '手斧': { id: 10, name: '手斧', weaponType: 1, baseDmg: 10, dmgType: 1, skill: '剣術', ready: 1, ev: 1, gold: 50 },
  '戦鎚': { id: 11, name: '戦鎚', weaponType: 1, baseDmg: 10, dmgType: 0, skill: '武術', ready: 1, ev: 1, gold: 75 },
  '戦斧': { id: 12, name: '戦斧', weaponType: 1, baseDmg: 12, dmgType: 1, skill: '武術', ready: 1, ev: 1, gold: 100 },
  '杖': { id: 13, name: '杖', weaponType: 4, baseDmg: 6, dmgType: 0, skill: '武術', ready: 0, ev: 2, gold: 20 },
  '長槍': { id: 14, name: '長槍', secondName: '鉾槍(突き)', weaponType: 4, baseDmg: 8, dmgType: 2, skill: '剣術', ready: 0, ev: 3, gold: 60 },
  '薙刀': { id: 15, name: '薙刀', weaponType: 4, baseDmg: 10, dmgType: 1, skill: '武術', ready: 0, ev: 3, gold: 90 },
  '鉾槍': { id: 16, name: '鉾槍', secondName: '鉾槍(振り)', weaponType: 4, baseDmg: 16, dmgType: 1, skill: '武術', ready: 1, ev: 3, usage: '長槍', gold: 120 },
  '短弓': { id: 17, name: '短弓', weaponType: 5, baseDmg: 6, dmgType: 2, skill: '剣術', ready: 1, ev: 0, gold: 30 },
  '長弓': { id: 18, name: '長弓', weaponType: 5, baseDmg: 8, dmgType: 2, skill: '弓術', ready: 1, ev: 0, gold: 60 },
  '弩': { id: 19, name: '弩', weaponType: 5, baseDmg: 10, dmgType: 2, skill: '剣術', ready: 2, ev: 0, gold: 120 },
  '拳': { id: 20, name: '拳', weaponType: 0, baseDmg: 2, dmgType: 0, skill: '格闘', ready: 0, ev: 0, gold: 0 },
  '蹴り': { id: 21, name: '蹴り', weaponType: 0, baseDmg: 4, dmgType: 0, skill: '格闘', ready: 0, ev: 0, usage: '拳', gold: 0 },
  '拳+1': { id: 22, name: '拳+1', weaponType: 0, baseDmg: 3, dmgType: 0, skill: '格闘', ready: 0, ev: 0, gold: 0 },
  '蹴り+1': { id: 23, name: '蹴り+1', weaponType: 0, baseDmg: 5, dmgType: 0, skill: '格闘', ready: 0, ev: 0, usage: '拳+1', gold: 0 },
  '拳+2': { id: 24, name: '拳+2', weaponType: 0, baseDmg: 4, dmgType: 0, skill: '格闘', ready: 0, ev: 0, gold: 0 },
  '蹴り+2': { id: 25, name: '蹴り+2', weaponType: 0, baseDmg: 6, dmgType: 0, skill: '格闘', ready: 0, ev: 0, usage: '拳+2', gold: 0 },
  '小盾': { id: 26, name: '小盾', weaponType: 6, baseDmg: 4, dmgType: 0, skill: '剣術', ready: 1, ev: 2, gold: 10 },
  '中盾': { id: 27, name: '中盾', weaponType: 6, baseDmg: 4, dmgType: 0, skill: '武術', ready: 1, ev: 3, gold: 15 },
  '大盾': { id: 28, name: '大盾', weaponType: 6, baseDmg: 4, dmgType: 0, skill: '武術', ready: 1, ev: 4, gold: 20 }
 } as const

export const ARMORS: Record<BodyArmorKey, Armor> = {
  '装備無し': { id: 0, name:['装備無し', '装備無し', '装備無し', '装備無し'], sdr:0, tdr:0, dr: '0', wt:0, gold: 0},
  '服': { id: 1, name: ['服', null, null, null], sdr: 1, tdr: 0, dr: '1 (0)', wt: 0, replace: null, gold: 20 },
  '革服': { id: 2, name: ['革服', '革の帽子', 'グローブ', 'ブーツ'], sdr: 1, tdr: 1, dr: '1', wt: 0, gold: 40 },
  '革鎧': { id: 3, name: ['革鎧', 'ヘッドギア', 'レザーグローブ', 'レザーブーツ'], sdr: 2, tdr: 2, dr: '2', wt: 1, gold: 80 },
  'チェインメイル': { id: 4, name: ['チェインメイル', 'チェインコイフ', null, null], sdr: 3, tdr: 1, dr: '3 (1)', wt: 2, replace: '革鎧', gold: 120 },
  'ブリガンディ': { id: 5, name: ['ブリガンディ', 'オープンヘルム', 'ガントレット', 'ソールレット'], sdr: 3, tdr: 3, dr: '3', wt: 3, gold: 160 },
  'プレイトメイル': { id: 6, name: ['プレイトメイル', 'クローズヘルム', 'ヴァンブレイス', 'グリーヴ'], sdr: 4, tdr: 4, dr: '4', wt: 4, gold: 320 }
 } as const

const DMG_STEP: BaseDmg[] = [
  { id: 0, name: '1d-4', dice: 1, mod: -4 },
  { id: 1, name: '1d-3', dice: 1, mod: -3 },
  { id: 2, name: '1d-2', dice: 1, mod: -2 },
  { id: 3, name: '1d-1', dice: 1, mod: -1 },
  { id: 4, name: '1d', dice: 1, mod: 0 },
  { id: 5, name: '1d+1', dice: 1, mod: 1 },
  { id: 6, name: '1d+2', dice: 1, mod: 2 },
  { id: 7, name: '2d-1', dice: 2, mod: -1 },
  { id: 8, name: '2d', dice: 2, mod: 0 },
  { id: 9, name: '2d+1', dice: 2, mod: 1 },
  { id: 10, name: '2d+2', dice: 2, mod: 2 },
  { id: 11, name: '3d-1', dice: 3, mod: -1 },
  { id: 12, name: '3d', dice: 3, mod: 0 },
  { id: 13, name: '3d+1', dice: 3, mod: 1 },
  { id: 14, name: '3d+2', dice: 3, mod: 2 },
  { id: 15, name: '4d-1', dice: 4, mod: -1 },
  { id: 16, name: '4d', dice: 4, mod: 0 },
  { id: 17, name: '4d+1', dice: 4, mod: 1 }
] as const

const WEAPON_SLOT_KEYS = ['main', 'sub', 'spare', 'shield'] as const

const ARMOR_SLOT_KEYS = ['body', 'head', 'arm', 'leg'] as const

export type WeaponKey = typeof WEAPON_KEYS[number]

type WeaponUsageKey = typeof WEAPON_USAGE_KEYS[number]

export type BodyArmorKey = typeof BODY_ARMOR_KEYS[number]

export type HeadArmorKey = typeof HEAD_ARMOR_KEYS[number]

export type ArmArmorKey = typeof ARM_ARMOR_KEYS[number]

export type LegArmorKey = typeof LEG_ARMOR_KEYS[number]

export type EquipmentSet = {
  weapon?: WeaponKey
  spare?: WeaponKey
  shield?: WeaponKey
  body?: BodyArmorKey
  head?: HeadArmorKey
  arm?: ArmArmorKey
  leg?: LegArmorKey
}

export type Weapon = {
  id: number
  name: WeaponKey |  WeaponUsageKey
  secondName?: WeaponUsageKey
  weaponType: number // 0: 格闘, 1: 通常, 2: 鎖状, 3: 両手, 4: 竿状, 5: 射撃, 6: 盾
  baseDmg: number
  dmgType: number // 0: 叩, 1: 切, 2: 刺
  skill: ParameterKey
  ready: number
  ev: number
  usage?: WeaponKey
  gold: number
}

export type Armor = {
  id: number
  name: [BodyArmorKey, HeadArmorKey | null, ArmArmorKey | null, LegArmorKey | null]
  dr: string
  sdr: number
  tdr: number
  wt: number
  replace?: BodyArmorKey | null
  gold: number
}

type BaseDmg = {
  id: number
  name: string
  dice: number
  mod: number
}

export type Dmg = BaseDmg & {
  type: number
}

export type WeaponSlotKey = typeof WEAPON_SLOT_KEYS[number]

export type ArmorSlotKey = typeof ARMOR_SLOT_KEYS[number]

// ダメージ型の有効/無効で, それぞれダメージを算出して返す
function getDmg(weapon: Weapon, typeOption: boolean, mod:number = 0): Dmg {
  const baseDmg = typeOption && weapon.dmgType == 2 // (刺)
    ? weapon.baseDmg - Math.max((Math.floor((weapon.baseDmg - 1) / 3) + 1), 2)
    : typeOption && weapon.dmgType == 1 // (切)
      ? weapon.baseDmg - Math.max(Math.floor(weapon.baseDmg / 4), 1)
      : weapon.baseDmg // (叩)
  const dmg = baseDmg + mod
  return { ...DMG_STEP[dmg], type: weapon.dmgType }
}

// ダメージ型の有効/無効で, それぞれダメージの文字列を結合して返す
function getDmgName(weapon: Weapon, typeOption: boolean, mod:number = 0): string {
  const dmg = getDmg(weapon, typeOption, mod)
  const dmgType = dmg.type === 2 ? ' (刺)' : dmg.type === 1 ? ' (切)' : ' (叩)'
  return typeOption ? `${dmg.name}${dmgType}` : `${dmg.name}`
}

// 装備を司るクラス
export class Equipments {
  private _weapon: Weapon
  private _mainUsage: Weapon
  private _subUsage: Weapon
  private _spare: Weapon
  private _shield: Weapon
  private _body: Armor
  private _head: Armor
  private _arm: Armor
  private _leg: Armor

  constructor(set: EquipmentSet) {
    const weaponKey = set?.weapon ?? '装備無し'
    this._weapon = WEAPONS[weaponKey]
    this._mainUsage = this.setMainUsage(this._weapon)
    this._subUsage = this.setSubUsage(this._weapon)

    const spareKey = set?.spare ?? '装備無し'
    this._spare = WEAPONS[spareKey]

    const shieldKey = set?.shield ?? '装備無し'
    this._shield = WEAPONS[shieldKey]

    const bodyArmorKey = set?.body ?? '服' // 最低限「服」を装備
    this._body = ARMORS[bodyArmorKey]

    const headArmorKey = set?.head ?? '装備無し'
    this._head = Object.entries(ARMORS).find(([, armor]) => armor.name[1] === headArmorKey)?.[1] || ARMORS['装備無し']

    const armArmorKey = set?.arm ?? '装備無し'
    this._arm = Object.entries(ARMORS).find(([, armor]) => armor.name[2] === armArmorKey)?.[1] || ARMORS['装備無し']

    const legArmorKey = set?.leg ?? '装備無し'
    this._leg = Object.entries(ARMORS).find(([, armor]) => armor.name[3] === legArmorKey)?.[1] || ARMORS['装備無し']
  }

  // 武器をセット
  set weapon(weaponKey: WeaponKey) {
    this.setWeapon(weaponKey, false)
  }

  // autoSet オプションで盾もセット (技能を指定する)
  setWeapon(weaponKey: WeaponKey, autoSet: boolean = true, skill: string = '武術') {
    this._weapon = WEAPONS[weaponKey]
    this._mainUsage = this.setMainUsage(this._weapon)
    this._subUsage = this.setSubUsage(this._weapon)
    // 盾もセット
    const type = this._mainUsage.weaponType
    if ((type === 1 || type === 2) && autoSet) {
      if (skill === '武術') this.shield = '中盾'
      else this.shield = '小盾'
    }
  }

  // 武器の主用途をセット
  private setMainUsage(weapon: Weapon): Weapon {
    if (weapon.usage) {
      // 用途が別にある武器は主用途の secondName を使用
      weapon = WEAPONS[weapon.usage] || WEAPONS['装備無し']
      weapon = {
        ...weapon,
        name: weapon.secondName! // 必ずある
      }
      return weapon
    }
    return weapon
  }

  // 武器の副用途をセット (現状: バスタードソードと鉾槍の場合のみ)
  private setSubUsage(weapon: Weapon): Weapon {
    if (weapon.usage) {
      // 用途が別にある武器は副用途の secondName を使用
      weapon = {
        ...weapon,
        name: weapon.secondName! // 必ずある
      }
      return weapon
    }
    return WEAPONS['装備無し']
  }

  // 予備武器をセット
  set spare(weaponKey: WeaponKey) {
    this._spare = WEAPONS[weaponKey]
  }

  // 盾をセット
  set shield(weaponKey: WeaponKey) {
    this._shield = WEAPONS[weaponKey]
  }

  // 胴防具をセット
  set body(bodyArmorKey: BodyArmorKey) {
    this.setBody(bodyArmorKey, false)
  }

  // autoSet オプションで 頭, 腕, 脚もセット
  setBody(armorKey: BodyArmorKey, autoSet: boolean = true): Armor {
    this._body = ARMORS[armorKey]
    // 頭, 腕, 脚もセット
    if (autoSet) {
      const replace = this._body.replace
      if (replace) { // チェインメイルのように腕・脚防具が代替の場合
        this._head = this._body
        this._arm = this._leg = ARMORS[replace]
      } else if (replace === null) { // 服のように腕・脚防具の代替が無い場合
        this._head = this._arm = this._leg = ARMORS['装備無し']
      } else if (replace === undefined) { // 代替が未定義の場合
        this._head = this._arm = this._leg = this._body
      }
    }
    return this._body
  }

  // 頭防具をセット
  set head(armorKey: HeadArmorKey) {
    this._head = Object.entries(ARMORS).find(([, armor]) => armor.name[1] === armorKey)?.[1] || ARMORS['装備無し']
  }

  // 腕防具をセット
  set arm(armorKey: ArmArmorKey) {
    this._arm = Object.entries(ARMORS).find(([, armor]) => armor.name[2] === armorKey)?.[1] || ARMORS['装備無し']
  }

  // 脚防具をセット
  set leg(armorKey: LegArmorKey) {
    this._leg = Object.entries(ARMORS).find(([, armor]) => armor.name[3] === armorKey)?.[1] || ARMORS['装備無し']
  }

  // 武器を取得
  get weapon(): Weapon {
    return this._weapon
  }

  // 武器の主用途を取得
  get mainUsage(): Weapon {
    return this._mainUsage
  }

  // 武器の副用途を取得
  get subUsage(): Weapon {
    return this._subUsage
  }

  // 予備武器を取得
  get spare(): Weapon {
    return this._spare
  }

  // 盾を取得
  get shield(): Weapon {
    return this._shield
  }

  // 武器スロット一式を取得
  get weapons(): Record<WeaponSlotKey, Weapon> {
    return {
      main: this._mainUsage,
      sub: this._subUsage,
      spare: this._spare,
      shield: this._shield
    }
  }

  // 胴防具を取得
  get body(): Armor {
    return this._body
  }

  // 頭防具を取得
  get head(): Armor {
    return this._head
  }

  // 腕防具を取得
  get arm(): Armor {
    return this._arm
  }

  // 脚防具を取得
  get leg(): Armor {
    return this._leg
  }

  // 防具スロット一式を取得
  get armors(): Record<ArmorSlotKey, Armor> {
    return {
      body: this._body,
      head: this._head,
      arm: this._arm,
      leg: this._leg
    }
  }


  // 引数の修正値から Dmg を算出し, ダメージ型を足した Dmg 型を返す
  getDmg(key: WeaponSlotKey = 'main', typeOption:boolean = true, mod: number = 0): Dmg {
    const weapon = (key === 'main' ? this.mainUsage
      : key === 'sub' ? this.subUsage
      : key === 'spare' ? this.spare : this.shield)
    return getDmg(weapon, typeOption, mod)
  }

  // 引数の修正値から Dmg を算出し, 表記を返す
  getDmgName(key: WeaponSlotKey = 'main', typeOption:boolean = true, mod: number = 0): string {
    const weapon = (key === 'main' ? this.mainUsage
      : key === 'sub' ? this.subUsage
      : key === 'spare' ? this.spare : this.shield)
    return getDmgName(weapon, typeOption, mod)
  }

  // Gold 総額を算出
  get gold(): number {
    let total = 0
    total += this._weapon.gold
    total += this._spare?.gold ?? 0
    total += this._shield?.gold ?? 0
    total += (this._body?.gold ?? 0) * 0.5
    total += (this._head?.gold ?? 0) * 0.25
    total += (this._arm?.gold ?? 0) * 0.1
    total += (this._leg?.gold ?? 0) * 0.15
    return total
  }

  // Model用データに変換
  get model(): EquipmentSet {
    return {
      weapon: this.weapon.name as WeaponKey,
      spare: this.spare.name as WeaponKey,
      shield: this.shield.name as WeaponKey,
      body: this.body.name[0],
      head: this.head.name[1] || '装備無し',
      arm: this.arm.name[2] || '装備無し',
      leg: this.leg.name[3] || '装備無し'
    }
  }
}
