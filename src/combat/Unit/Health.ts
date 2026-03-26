// Health.ts

import { CombatUnit as Unit } from '../Unit'

// Summary 表示用ラベル
const STATUS_LABELS: Record<StatusKey | EffectKey | BuffKey, string> = {
  stunned: '朦朧状態',
  unconscious: '気絶',
  dead: '死亡',
  puppeted: '傀儡',
  dazzled: '眩しい',
  burning: '火だるま',
  blinded: '盲目',
  deafened: '聾',
  injuryOnArm: '腕故障',
  injuryOnLeg: '脚故障',
  confused: '混乱',
  silence: '沈黙',
  resistant: '痛覚鈍麻',
  poisoned: '毒',
  paralyzed: '麻痺',
  dazed: '幻惑',
  berserk: '狂戦士',
  panic: 'パニック',
  levelBuff: '命中UP',
  dmgBuff: '攻撃UP',
  evBuff: '回避UP',
  drBuff: '防御UP'
}

// 状態: ターン経過だけでは回復しない (判定が必要)
const STATUS_KEYS = [
  'stunned',
  'unconscious',
  'dead',
  'puppeted',
  'dazzled',
  'burning',
  'blinded',
  'deafened',
  'injuryOnArm',
  'injuryOnLeg',
  'confused'
] as const

// 効果: ターン経過で効果が消滅する
const EFFECT_KEYS = [
  'silence',
  'resistant',
  'poisoned',
  'paralyzed',
  'dazed',
  'berserk',
  'panic'
] as const

// バフ: 定量で効果を測り, ターン経過で効果が衰退する
const BUFF_KEYS = [
  'levelBuff',
  'dmgBuff',
  'evBuff',
  'drBuff'
] as const

type StatusKey = typeof STATUS_KEYS[number]
type EffectKey = typeof EFFECT_KEYS[number]
type BuffKey = typeof BUFF_KEYS[number]

export class UnitHealth {
  private self: Unit
  private _injury: number // 負傷 (HPの減少)
  private _status: Map<StatusKey, boolean>
  private _effects: Map<EffectKey, number>
  private _buff: Map<BuffKey, number>
  private dmgInitBuff: number //「怪力」端数
  private evInitBuff: number //「運動」端数
  private _labels: Set<string>

  constructor(self: Unit, dmgBuff: number, evBuff: number) {
    this.self = self
    this._injury = 0
    this._status = new Map<StatusKey, boolean>()
    this._effects = new Map<EffectKey, number>()
    this._buff = new Map<BuffKey, number>()
    this.dmgInitBuff = dmgBuff * 10
    this.evInitBuff = evBuff * 10
    this._labels = new Set<string>()
  }

  // ダメージ効果 (判定不要の処理はここで解決する)
  set injury(newInjury: number) {
    // ダメージ算出
    const dmg = newInjury - this._injury
    // ダメージが最大HPの半分以上の場合, 自動的に朦朧状態に陥る
    if (dmg >= this.self.maxHP / 2) {
      this.stunned = true
    }

    // 負傷が最大HPに達した場合, 自動的に気絶する
    if (newInjury >= this.self.maxHP) {
      this.unconscious = true
      this.self.position = 'back' // 戦線から外す
      this.self.posture = 'prone' // 姿勢変更
    }

    // メンバ変数を更新
    this._injury = newInjury
  }

  get injury() {
    return this._injury
  }

  // 状態をセット
  setState(key: StatusKey, state: boolean) {
    this._status.set(key, state)

    if (state) {
      this._labels.add(STATUS_LABELS[key])
    } else {
      this._labels.delete(STATUS_LABELS[key])
    }
  }

  // 状態を取得
  getState(key: StatusKey) {
    return this._status.get(key) ?? false
  }

  // 効果をセット
  setEffects(key: EffectKey, value: number) {
    this._effects.set(key, value)

    if (value) {
      this._labels.add(STATUS_LABELS[key])
    } else {
      this._labels.delete(STATUS_LABELS[key])
    }
  }

  // 効果を取得
  getEffects(key: EffectKey) {
    return this._effects.get(key) ?? 0
  }

  // バフをセット
  setBuff(key: BuffKey, value: number) {
    this._buff.set(key, value)

    if (value) {
      this._labels.add(STATUS_LABELS[key])
    } else {
      this._labels.delete(STATUS_LABELS[key])
    }
  }

  // バフを取得
  getBuff(key: BuffKey) {
    return this._buff.get(key) ?? 0
  }

  getLevelBuff() {
    // 残ターン数の10分の1 (端数切り上げ) が実際の効果
    return Math.ceil(this.getBuff('levelBuff') / 10)
  }

  getDmgBuff() {
     // 残ターン数の10分の1 (端数切り上げ) + 初期値(10) の半分 が実際の効果
    return Math.floor(Math.ceil((this.dmgInitBuff + this.getBuff('dmgBuff')) / 10) / 2)
  }

  getEvBuff() {
    // 残ターン数の10分の1 (端数切り上げ) + 初期値(10) の半分 が実際の効果
    return Math.floor(Math.ceil((this.evInitBuff + this.getBuff('evBuff')) / 10) / 2)
  }

  getDrBuff() {
    // 残ターン数が残っていれば, 効果は一定
    return this.getBuff('drBuff') > 0 ? 1 : 0
  }

  //
  // 以下, 使用頻度に応じて静的アクセスを可能にする
  //
  set stunned(value: boolean) {
    this.setState('stunned', value)
  }

  set unconscious(value: boolean) {
    this.setState('unconscious', value)
  }

  set dead(value: boolean) {
    this.setState('dead', value)
  }

  get stunned() {
    return this.getState('stunned')
  }

  get unconscious() {
    return this.getState('unconscious')
  }

  get dead() {
    return this.getState('dead')
  }

  get status() {
    return Object.fromEntries(this._status)
  }

  get effects() {
    return Object.fromEntries(this._effects)
  }

  get buff() {
    return {
      level: this.getLevelBuff(),
      dmg: this.getDmgBuff(),
      ev: this.getEvBuff(),
      dr: this.getDrBuff()
    }
  }

  // Summary 表示用ラベル取得
  get label() {
    return [...this._labels].at(-1) ?? ''
  }

  nextTurn() {
    // 毎ターン効果変数をデクリメント
    for (const key of EFFECT_KEYS) {
      this.setEffects(key, Math.max(this.getEffects(key) - 1, 0))
    }

    // 毎ターンバフ変数をデクリメント
    for (const key of BUFF_KEYS) {
      this.setBuff(key, Math.max(this.getBuff(key) - 1, 0))
    }
  }
}
