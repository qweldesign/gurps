// Equipments.ts
  
export type Weapon = {
  id?: number
  name: string
  secondName?: string
  weaponType: number // 0: 格闘, 1: 通常, 2: 鎖状, 3: 両手, 4: 竿上, 5: 射撃, 6: 盾
  baseDmg: number
  dmgType: number
  skillType: string
  ready: number
  ev: number
  usage?: string
}

export type Armor = {
  id?: number
  name: string
  parts: (string | null)[]
  dr?: string
  sdr: number
  tdr: number
  wt: number
  replace?: string | null
}

const WEAPON_LIST: Weapon[] = [
  { name: '装備無し', weaponType: 0, baseDmg: 2, dmgType: 3, skillType: '格闘', ready: 0, ev: 0 },
  { name: 'ダガー', weaponType: 1, baseDmg: 4, dmgType: 1, skillType: '剣術', ready: 0, ev: 1 },
  { name: 'ショートソード', weaponType: 1, baseDmg: 5, dmgType: 2, skillType: '剣術', ready: 0, ev: 1 },
  { name: 'レイピア', weaponType: 1, baseDmg: 5, dmgType: 1, skillType: '剣術', ready: 0, ev: 1 },
  { name: 'ロングソード',secondName: 'バスタードソード(片手)', weaponType: 1, baseDmg: 6, dmgType: 2, skillType: '剣術', ready: 0, ev: 1 },
  { name: 'バスタードソード',secondName: 'バスタードソード(両手)', weaponType: 3, baseDmg: 8, dmgType: 2, skillType: '武術', ready: 0, ev: 2, usage: 'ロングソード' },
  { name: 'グレートソード', weaponType: 3, baseDmg: 9, dmgType: 2, skillType: '武術', ready: 0, ev: 2 },
  { name: '三日月刀',secondName: '蒼龍刀(片手)', weaponType: 1, baseDmg: 6, dmgType: 2, skillType: '剣術', ready: 0, ev: 1 },
  { name: '蒼龍刀',secondName: '蒼龍刀(両手)', weaponType: 3, baseDmg: 8, dmgType: 2, skillType: '武術', ready: 0, ev: 2, usage: '三日月刀' },
  { name: '鎚槌', weaponType: 2, baseDmg: 8, dmgType: 3, skillType: '剣術', ready: 1, ev: 1 },
  { name: '手斧', weaponType: 1, baseDmg: 8, dmgType: 2, skillType: '剣術', ready: 1, ev: 1 },
  { name: '戦鎚', weaponType: 1, baseDmg: 10, dmgType: 3, skillType: '武術', ready: 1, ev: 1 },
  { name: '戦斧', weaponType: 1, baseDmg: 9, dmgType: 2, skillType: '武術', ready: 1, ev: 1 },
  { name: '杖', weaponType: 4, baseDmg: 6, dmgType: 3, skillType: '剣術', ready: 0, ev: 3 },
  { name: '長槍',secondName: '鉾槍(突き)', weaponType: 4, baseDmg: 5, dmgType: 1, skillType: '剣術', ready: 0, ev: 3 },
  { name: '薙刀', weaponType: 4, baseDmg: 8, dmgType: 2, skillType: '武術', ready: 0, ev: 3 },
  { name: '鉾槍',secondName: '鉾槍(振り)', weaponType: 4, baseDmg: 12, dmgType: 2, skillType: '武術', ready: 1, ev: 3, usage: '長槍' },
  { name: '短弓', weaponType: 5, baseDmg: 4, dmgType: 1, skillType: '剣術', ready: 1, ev: 0 },
  { name: '長弓', weaponType: 5, baseDmg: 5, dmgType: 1, skillType: '弓術', ready: 1, ev: 0 },
  { name: '弩', weaponType: 5, baseDmg: 7, dmgType: 1, skillType: '剣術', ready: 2, ev: 0 },
  { name: '拳', weaponType: 0, baseDmg: 2, dmgType: 3, skillType: '格闘', ready: 0, ev: 0 },
  { name: '蹴り', weaponType: 0, baseDmg: 4, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, usage: '拳' },
  { name: '拳+1', weaponType: 0, baseDmg: 3, dmgType: 3, skillType: '格闘', ready: 0, ev: 0 },
  { name: '蹴り+1', weaponType: 0, baseDmg: 5, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, usage: '拳+1' },
  { name: '拳+2', weaponType: 0, baseDmg: 4, dmgType: 3, skillType: '格闘', ready: 0, ev: 0 },
  { name: '蹴り+2', weaponType: 0, baseDmg: 6, dmgType: 3, skillType: '格闘', ready: 0, ev: 0, usage: '拳+2' },
  { name: '小盾', weaponType: 6, baseDmg: 4, dmgType: 3, skillType: '剣術', ready: 1, ev: 2 },
  { name: '中盾', weaponType: 6, baseDmg: 4, dmgType: 3, skillType: '武術', ready: 1, ev: 3 },
  { name: '大盾', weaponType: 6, baseDmg: 4, dmgType: 3, skillType: '武術', ready: 1, ev: 4 }
]

const ARMOR_LIST: Armor[] = [
  { name: '服', parts: ['帽子', null, null], sdr: 1, tdr: 0, wt: 0, replace: null },
  { name: '革服', parts: ['革の帽子', 'グローブ', 'ブーツ'], sdr: 1, tdr: 1, wt: 0 },
  { name: '革鎧', parts: ['ヘッドギア', 'レザーグローブ', 'レザーブーツ'], sdr: 2, tdr: 2, wt: 1 },
  { name: 'チェインメイル', parts: ['チェインコイフ', null, null], sdr: 3, tdr: 1, wt: 2, replace: '革鎧' },
  { name: 'ブリガンディ', parts: ['オープンヘルム', 'ガントレット', 'ソールレット'], sdr: 3, tdr: 3, wt: 3 },
  { name: 'プレイトメイル', parts: ['クローズヘルム', 'ヴァンブレイス', 'グリーヴ'], sdr: 4, tdr: 4, wt: 4 }
]

// ID を設定
WEAPON_LIST.map((weapon, i) => {
  weapon.id = i
})

// ID, DR 文字列を設定
ARMOR_LIST.map((armor, i) => {
  armor.id = i
  const sdr = armor.sdr
  const tdr = armor.tdr
  if (sdr === tdr) armor.dr = String(sdr)
  else armor.dr = `${String(sdr)} (${String(tdr)})`
})

export type WeaponName = typeof WEAPON_LIST[number]['name']

export type ArmorName = typeof ARMOR_LIST[number]['name']

export type HeadArmorName = typeof ARMOR_LIST[number]['parts'][0]

export type ArmArmorName = typeof ARMOR_LIST[number]['parts'][1]

export type LegArmorName = typeof ARMOR_LIST[number]['parts'][2]

export type EquipmentSet = {
  weapon: Weapon
  missile: Weapon | null
  shield: Weapon | null
  body: Armor
  head: Armor | null
  arm: Armor | null
  leg: Armor | null
}

// 装備のデータを司るクラス
export class Equipments {
  private weapon: Weapon
  private mainUsage: Weapon
  private subUsage: Weapon | null
  private missile: Weapon | null
  private shield: Weapon | null
  private body: Armor
  private head: Armor | null
  private arm: Armor | null
  private leg: Armor | null

  constructor(set: EquipmentSet | null) {
    this.weapon = set?.weapon ?? WEAPON_LIST[0]
    this.mainUsage = this.setMainUsage(this.weapon)
    this.subUsage = this.setSubUsage(this.weapon)
    this.missile = set?.missile ?? null
    this.shield = set?.shield ?? null
    this.body = set?.body ?? ARMOR_LIST[0]
    this.head = set?.head ?? null
    this.arm = set?.arm ?? null
    this.leg = set?.leg ?? null
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
  setSubUsage(weapon: Weapon): Weapon | null {
    if (weapon.usage) {
      // 用途が別にある武器は副用途の secondName を使用
      weapon = {
        ...weapon,
        name: weapon.secondName! // 必ずある
      }
      return weapon
    }
    return null
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
        this.arm = this.leg = null
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
  getSubUsage(): Weapon | null {
    return this.subUsage
  }

  // 射撃武器を取得
  getMissile(): Weapon | null {
    return this.missile
  }

  // 盾を取得
  getShield(): Weapon | null {
    return this.shield
  }

  // 胴防具を取得
  getBodyArmor(): Armor {
    return this.body
  }

  // 頭防具を取得
  getHeadArmor(): Armor | null {
    return this.head
  }

  // 腕防具を取得
  getArmArmor(): Armor | null {
    return this.arm
  }

  // 脚防具を取得
  getLegArmor(): Armor | null {
    return this.leg
  }
}
