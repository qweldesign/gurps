// Equipments.ts
  
export type Weapon = {
  id: number
  name: string
  secondName?: string
  weaponType: number // 0: 格闘, 1: 通常, 2: 鎖状, 3: 両手, 4: 竿上, 5: 射撃, 6: 盾
  baseDmg: number
  dmgType: number
  skillType: string
  ready: number
  ev: number
  usage?: string
  gold: number
}

export type Armor = {
  id: number
  name: string
  parts: (string | null)[]
  dr: string
  sdr: number
  tdr: number
  wt: number
  replace?: string | null
  gold: number
}

export const WEAPON_LIST: Weapon[] = [
  { id: 0, name: '装備無し', weaponType: 0, baseDmg: 2, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, gold: 0},
  { id: 1, name: 'ダガー', weaponType: 1, baseDmg: 4, dmgType: 1, skillType: '剣術', ready: 0, ev: 1, gold: 30 },
  { id: 2, name: 'ショートソード', weaponType: 1, baseDmg: 5, dmgType: 2, skillType: '剣術', ready: 0, ev: 1, gold: 40 },
  { id: 3, name: 'レイピア', weaponType: 1, baseDmg: 5, dmgType: 1, skillType: '剣術', ready: 0, ev: 1, gold: 60 },
  { id: 4, name: 'ロングソード',secondName: 'バスタードソード(片手)', weaponType: 1, baseDmg: 6, dmgType: 2, skillType: '剣術', ready: 0, ev: 1, gold: 80 },
  { id: 5, name: 'バスタードソード',secondName: 'バスタードソード(両手)', weaponType: 3, baseDmg: 8, dmgType: 2, skillType: '武術', ready: 0, ev: 2, usage: 'ロングソード', gold: 120 },
  { id: 6, name: 'グレートソード', weaponType: 3, baseDmg: 9, dmgType: 2, skillType: '武術', ready: 0, ev: 2, gold: 160 },
  { id: 7, name: '三日月刀',secondName: '蒼龍刀(片手)', weaponType: 1, baseDmg: 6, dmgType: 2, skillType: '剣術', ready: 0, ev: 1, gold: 80 },
  { id: 8, name: '蒼龍刀',secondName: '蒼龍刀(両手)', weaponType: 3, baseDmg: 8, dmgType: 2, skillType: '武術', ready: 0, ev: 2, usage: '三日月刀', gold: 120 },
  { id: 9, name: '鎚槌', weaponType: 2, baseDmg: 8, dmgType: 3, skillType: '剣術', ready: 1, ev: 1, gold: 25 },
  { id: 10, name: '手斧', weaponType: 1, baseDmg: 8, dmgType: 2, skillType: '剣術', ready: 1, ev: 1, gold: 50 },
  { id: 11, name: '戦鎚', weaponType: 1, baseDmg: 10, dmgType: 3, skillType: '武術', ready: 1, ev: 1, gold: 75 },
  { id: 12, name: '戦斧', weaponType: 1, baseDmg: 9, dmgType: 2, skillType: '武術', ready: 1, ev: 1, gold: 100 },
  { id: 13, name: '杖', weaponType: 4, baseDmg: 6, dmgType: 3, skillType: '剣術', ready: 0, ev: 3, gold: 30 },
  { id: 14, name: '長槍',secondName: '鉾槍(突き)', weaponType: 4, baseDmg: 5, dmgType: 1, skillType: '剣術', ready: 0, ev: 3, gold: 60 },
  { id: 15, name: '薙刀', weaponType: 4, baseDmg: 8, dmgType: 2, skillType: '武術', ready: 0, ev: 3, gold: 90 },
  { id: 16, name: '鉾槍',secondName: '鉾槍(振り)', weaponType: 4, baseDmg: 12, dmgType: 2, skillType: '武術', ready: 1, ev: 3, usage: '長槍', gold: 120 },
  { id: 17, name: '短弓', weaponType: 5, baseDmg: 4, dmgType: 1, skillType: '剣術', ready: 1, ev: 0, gold: 30 },
  { id: 18, name: '長弓', weaponType: 5, baseDmg: 5, dmgType: 1, skillType: '弓術', ready: 1, ev: 0, gold: 60 },
  { id: 19, name: '弩', weaponType: 5, baseDmg: 7, dmgType: 1, skillType: '剣術', ready: 2, ev: 0, gold: 120 },
  { id: 20, name: '拳', weaponType: 0, baseDmg: 2, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, gold: 0 },
  { id: 21, name: '蹴り', weaponType: 0, baseDmg: 4, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, usage: '拳', gold: 0 },
  { id: 22, name: '拳+1', weaponType: 0, baseDmg: 3, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, gold: 0 },
  { id: 23, name: '蹴り+1', weaponType: 0, baseDmg: 5, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, usage: '拳+1', gold: 0 },
  { id: 24, name: '拳+2', weaponType: 0, baseDmg: 4, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, gold: 0 },
  { id: 25, name: '蹴り+2', weaponType: 0, baseDmg: 6, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, usage: '拳+2', gold: 0 },
  { id: 26, name: '小盾', weaponType: 6, baseDmg: 4, dmgType: 3, skillType: '剣術', ready: 1, ev: 2, gold: 10 },
  { id: 27, name: '中盾', weaponType: 6, baseDmg: 4, dmgType: 3, skillType: '武術', ready: 1, ev: 3, gold: 15 },
  { id: 28, name: '大盾', weaponType: 6, baseDmg: 4, dmgType: 3, skillType: '武術', ready: 1, ev: 4, gold: 20 }
] as const

export const ARMOR_LIST: Armor[] = [
  { id: 0, name: '装備無し', parts:['装備無し', '装備無し', '装備無し'], sdr:0, tdr:0, dr: '0', wt:0, gold: 0},
  { id: 1, name: '服', parts: [null, null, null], sdr: 1, tdr: 0, dr: '1 (0)', wt: 0, replace: null, gold: 20 },
  { id: 2, name: '革服', parts: ['革の帽子', 'グローブ', 'ブーツ'], sdr: 1, tdr: 1, dr: '1', wt: 0, gold: 40 },
  { id: 3, name: '革鎧', parts: ['ヘッドギア', 'レザーグローブ', 'レザーブーツ'], sdr: 2, tdr: 2, dr: '2', wt: 1, gold: 80 },
  { id: 4, name: 'チェインメイル', parts: ['チェインコイフ', null, null], sdr: 3, tdr: 1, dr: '3 (1)', wt: 2, replace: '革鎧', gold: 120 },
  { id: 5, name: 'ブリガンディ', parts: ['オープンヘルム', 'ガントレット', 'ソールレット'], sdr: 3, tdr: 3, dr: '3', wt: 3, gold: 160 },
  { id: 6, name: 'プレイトメイル', parts: ['クローズヘルム', 'ヴァンブレイス', 'グリーヴ'], sdr: 4, tdr: 4, dr: '4', wt: 4, gold: 320 }
] as const

export type WeaponName = typeof WEAPON_LIST[number]['name']

export type ArmorName = typeof ARMOR_LIST[number]['name']

export type HeadArmorName = typeof ARMOR_LIST[number]['parts'][0]

export type ArmArmorName = typeof ARMOR_LIST[number]['parts'][1]

export type LegArmorName = typeof ARMOR_LIST[number]['parts'][2]

export type EquipmentSet = {
  weapon: WeaponName
  missile: WeaponName
  shield: WeaponName
  body: ArmorName
  head: HeadArmorName
  arm: ArmArmorName
  leg: LegArmorName
}

// 装備のデータを司るクラス
export class Equipments {
  private weapon: Weapon
  private mainUsage: Weapon
  private subUsage: Weapon
  private missile: Weapon
  private shield: Weapon
  private body: Armor
  private head: Armor
  private arm: Armor
  private leg: Armor

  constructor(set: EquipmentSet | null) {
    const weaponName = set?.weapon ?? WEAPON_LIST[0].name
    this.weapon = WEAPON_LIST.find(item => item.name === weaponName)!
    this.mainUsage = this.setMainUsage(this.weapon)
    this.subUsage = this.setSubUsage(this.weapon)

    const missileName = set?.missile ?? WEAPON_LIST[0].name
    this.missile = WEAPON_LIST.find(item => item.name === missileName)!

    const shieldName = set?.shield ?? WEAPON_LIST[0].name
    this.shield = WEAPON_LIST.find(item => item.name === shieldName)!

    const bodyArmorName = set?.body ?? ARMOR_LIST[0].name
    this.body = ARMOR_LIST.find(item => item.name === bodyArmorName)!

    const headArmorName = set?.head ?? ARMOR_LIST[0].parts[0]
    this.head = ARMOR_LIST.find(item => item.parts[0] === headArmorName)!

    const armArmorName = set?.arm ?? ARMOR_LIST[0].parts[1]
    this.arm = ARMOR_LIST.find(item => item.parts[1] === armArmorName)!
    
    const legArmorName = set?.leg ?? ARMOR_LIST[0].parts[2]
    this.leg = ARMOR_LIST.find(item => item.parts[2] === legArmorName)!
  }

  // 武器をセット
  // autoSet オプションで 盾もセット (技能を指定する)
  setWeapon(weaponName: WeaponName, autoSet: boolean = true, skill: string = '武術'): Weapon {
    this.weapon = WEAPON_LIST.find(item => item.name === weaponName)!
    this.mainUsage = this.setMainUsage(this.weapon)
    this.subUsage = this.setSubUsage(this.weapon)
    // 盾もセット
    const type = this.mainUsage.weaponType
    if ((type === 1 || type === 2) && autoSet) {
      if (skill === '武術') this.setShield('中盾')
      else this.setShield('小盾')
    }
    return this.weapon
  }

  // 武器の主用途をセット
  setMainUsage(weapon: Weapon): Weapon {
    if (weapon.usage) {
      // 用途が別にある武器は主用途の secondName を使用
      weapon = WEAPON_LIST.find(item => item.name === weapon.usage) || WEAPON_LIST[0]
      weapon = {
        ...weapon,
        name: weapon.secondName! // 必ずある
      }
      return weapon
    }
    return weapon
  }

  // 武器の副用途をセット (現状: バスタードソードと鉾槍の場合のみ)
  setSubUsage(weapon: Weapon): Weapon {
    if (weapon.usage) {
      // 用途が別にある武器は副用途の secondName を使用
      weapon = {
        ...weapon,
        name: weapon.secondName! // 必ずある
      }
      return weapon
    }
    return WEAPON_LIST[0]
  }

  // 射撃武器をセット
  setMissile(weaponName: WeaponName): Weapon {
    this.missile = WEAPON_LIST.find(item => item.name === weaponName)!
    return this.missile
  }

  // 盾をセット
  setShield(weaponName: WeaponName): Weapon {
    this.shield = WEAPON_LIST.find(item => item.name === weaponName)!
    return this.shield
  }

  // 胴防具をセット
  // autoSet オプションで 頭, 腕, 脚もセット
  setBody(armorName: ArmorName, autoSet: boolean = true): Armor {
    this.body = ARMOR_LIST.find(item => item.name === armorName)!
    // 頭, 腕, 脚もセット
    if (autoSet) {
      const replace = this.body.replace
      if (replace) { // チェインメイルのように腕・脚防具が代替の場合
        this.head = this.body
        this.arm = this.leg = ARMOR_LIST.find(item => item.name === replace)!
      } else if (replace === null) { // 服のように腕・脚防具の代替が無い場合
        this.head = this.arm = this.leg = ARMOR_LIST[0]
      } else if (replace === undefined) { // 代替が未定義の場合
        this.head = this.arm = this.leg = this.body
      }
    }
    return this.body
  }

  // 頭防具をセット
  setHead(armorName: HeadArmorName): Armor {
    this.head = ARMOR_LIST.find(item => item.parts[0] === armorName)!
    return this.head
  }

  // 腕防具をセット
  setArm(armorName: ArmArmorName): Armor {
    this.arm = ARMOR_LIST.find(item => item.parts[1] === armorName)!
    return this.arm
  }

  // 脚防具をセット
  setLeg(armorName: LegArmorName): Armor {
    this.leg = ARMOR_LIST.find(item => item.parts[2] === armorName)!
    return this.leg
  }

  // 武器を取得
  getWeapon(): Weapon {
    return this.weapon
  }

  // 武器の主用途を取得
  getMainUsage(): Weapon {
    return this.mainUsage
  }

  // 武器の副用途を取得
  getSubUsage(): Weapon {
    return this.subUsage
  }

  // 射撃武器を取得
  getMissile(): Weapon {
    return this.missile
  }

  // 盾を取得
  getShield(): Weapon {
    return this.shield
  }

  // 胴防具を取得
  getBodyArmor(): Armor {
    return this.body
  }

  // 頭防具を取得
  getHeadArmor(): Armor {
    return this.head
  }

  // 腕防具を取得
  getArmArmor(): Armor {
    return this.arm
  }

  // 脚防具を取得
  getLegArmor(): Armor {
    return this.leg
  }

  // Gold総額を算出して返す
  getGold(): number {
    let total = 0
    total += this.weapon.gold
    total += this.missile?.gold ?? 0
    total += this.shield?.gold ?? 0
    total += (this.body?.gold ?? 0) * 0.5
    total += (this.head?.gold ?? 0) * 0.25
    total += (this.arm?.gold ?? 0) * 0.1
    total += (this.leg?.gold ?? 0) * 0.15
    return total
  }
}
