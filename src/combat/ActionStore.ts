// ActionStore.ts

import { type DefanseKey } from '../domains/Equipments'
import { CombatState as State } from './State'
import { POSITION_VALUES, type Position } from './FormationStore'
import { POSTURE_KEYS, POSTURE_MODS, type Posture, CombatUnit as Unit } from './Unit'
import { type Feint } from './Unit/Attack'

export const ACTIONS = ['ready', 'attack', 'feint', 'defense', 'move', 'changePosture', 'recovery', 'wait'] as const

export const ACTION_LABELS: Record<ActionType, string> = {
  ready: '準備',
  attack: '攻撃',
  feint: '牽制',
  defense: '全力防御',
  move: '移動',
  changePosture: '姿勢変更',
  recovery: '回復',
  wait: '待機'
} as const

export const FULL_POWER_KEYS = ['none', 'dmg', 'level', 'feint', 'double'] as const

export const FULL_POWER_OPTIONS: Record<FullPower, { label: string }> = {
  none: { label: '通常攻撃' },
  dmg: { label: 'ダメージ安定' },
  level: { label: '技能値+4' },
  feint: { label: '牽制即攻撃' },
  double: { label: '2回攻撃' }
} as const

export const AIM_KEYS = ['head', 'ear', 'eye', 'body', 'neck', 'stomach', 'arm', 'hand', 'leg', 'foot'] as const

export const AIM_OPTIONS: Record<Aim, { label: string, group: DefanseKey, mod: number }> = {
  head: { label: '頭', group: 'head', mod: -3 }, 
  ear: { label: '耳', group: 'head', mod: -5 },
  eye: { label: '目', group: 'head', mod: -7 },
  body: { label: '体', group: 'body', mod: 0 },
  neck: { label: '喉', group: 'body', mod: -5 },
  stomach: { label: '肚', group: 'body', mod: -3 },
  arm: { label: '腕', group: 'arm', mod: -2 },
  hand: { label: '手首', group: 'arm', mod: -4 },
  leg: { label: '脚', group: 'leg', mod: -2 },
  foot: { label: '足首', group: 'leg', mod: -4 }
 } as const

export const POSITION_LABELS: Record<Position, string> = {
  back: '後方',
  left: '左翼',
  center: '中央',
  right: '右翼'
} as const

// コマンド名の定義
export type ActionType = typeof ACTIONS[number]

// 防御名の定義
export type DefenseType = 'parry' | 'block' | 'dodge'

// コマンドオプションの定義
export type ActionOptions = {
  fullPower?: FullPower
  aim?: Aim
  position?: Position
  posture?: Posture
}

export type FullPower = typeof FULL_POWER_KEYS[number]

export type Aim = typeof AIM_KEYS[number]

// コマンド名とオプションの組み合わせ定義
export type ActionRequest =
  | { type: 'ready', options: {}, targets: [] }
  | { type: 'attack', options: { aim: Aim, fullPower: FullPower }, targets: [Unit] }
  | { type: 'feint', options: {}, targets: [Unit] }
  | { type: 'defense', options: {}, targets: [] }
  | { type: 'move', options: { position: Position }, targets: [] }
  | { type: 'changePosture', options: { posture: Posture }, targets: [] }
  | { type: 'recovery', options: {}, targets: [] }
  | { type: 'wait', options: {}, targets: [] }

// コマンド実行後の判定結果の定義
export type ActionResult = 
  | { type: 'attack', judge: AttackResult }
  | { type: 'defense', judge: DefenseResult }
  | { type: 'dmg', judge: DmgResult }
  | { type: 'injuryOnLimb', judge: InjuryOnLimbResult }
  | { type: 'feint', judge: FeintResult }
  | { type: 'knockedDown', judge: Judge }
  | { type: 'fatal', judge: Judge }
  | { type: 'unconscious', judge: Judge }
  | { type: 'dead', judge: Judge }
  | { type: 'recovery', judge: Judge }

type Roll = {
  roll: number // 出目
}

export type Judge = Roll & {
  success: boolean // 成功/失敗
  critical: boolean // クリティカル/ファンブル
}

export type Score = Roll & {
  success: boolean
  score: number // 成功度
}

export type AttackResult = Judge & {
  aim: Aim
  fullPower: FullPower
  ready: boolean // 非準備状態に変化したら false を代入
}

export type DefenseResult = Judge & {
  defenseType: DefenseType
  ready: boolean // 非準備状態に変化したら false を代入
}

export type DmgResult = Judge

export type InjuryOnLimbResult = { limb: Aim }

export type FeintResult = Score & {
  target: Unit
}

// コマンド実行可否取得関数と実行関数の定義
type ActionDefinition = {
  ready: {
    canExecute: () => boolean
    execute: () => ActionResult[]
  }
  attack: {
    options: { aim: readonly Aim[], fullPower: readonly FullPower[] }
    canExecute: () => boolean
    execute: (aim: Aim, fullPower: FullPower, target: Unit) => ActionResult[]
  }
  fullPowerAttack: {
    canExcute: () => boolean
  }
  legAttack: {
    canExcute: () => boolean
  }
  feint: {
    canExecute: () => boolean
    execute: (target: Unit) => ActionResult[]
  }
  defense: {
    canExecute: () => boolean
    execute: () => ActionResult[]
  }
  move: {
    options: { position: readonly Position[] }
    canExecute: (position: Position) => boolean
    execute: (position: Position) => ActionResult[]
  }
  changePosture: {
    options: { posture: readonly Posture[] }
    canExecute: (posture: Posture) => boolean
    execute: (posture: Posture) => ActionResult[]
  }
  recovery: {
    execute: () => ActionResult[]
  }
  wait: {
    canExecute: () => boolean
    execute: () => ActionResult[]
  }
}

// コマンド (行動) の管理と実行を司るクラス / Actionコンポーネントに対応
export class CombatActionStore {
  public actor: Unit
  private state: State
  public round: number
  public hasChangedPosture: boolean // 「姿勢変更」を実行したかどうか
  public unlocked: boolean // コマンドパレットのロック状態 → Actions にて検知
  public promise: Promise<void>
  private resolve!: () => void
  private readonly actions: ActionDefinition

  constructor(actor: Unit, state: State) {
    this.actor = actor
    this.state = state
    this.round = state.round
    this.hasChangedPosture = false
    this.unlocked = !this.actor.health.stunned // // コマンドパレットをアンロック

    // ターン終了を Promise で State に伝え, 次のターンへ進む
    this.promise = new Promise<void>(resolve => {
      this.resolve = resolve
    })

    this.actions = {
      ready: {
        canExecute: () => this.canReady(),
        execute: () => this.ready()
      },
      attack: {
        options: { aim: AIM_KEYS, fullPower: FULL_POWER_KEYS },
        canExecute: () => this.canAttack(),
        execute: (aim, fullPower, target) => this.attack(aim, fullPower, target)
      },
      fullPowerAttack: {
        canExcute: () => this.canFullPowerAttack()
      },
      legAttack: {
        canExcute: () => this.canLegAttack()
      },
      feint: {
        canExecute: () => this.canAttack(),
        execute: (target) => this.feint(target)
      },
      defense: {
        canExecute: () => this.canDefense(),
        execute: () => this.defense()
      },
      move: {
        options: { position: POSITION_VALUES },
        canExecute: (position) => this.canMove(position),
        execute: (position) => this.move(position)
      },
      changePosture: {
        options: { posture: POSTURE_KEYS },
        canExecute: (posture) => this.canChangePosture(posture),
        execute: (posture) => this.changePosture(posture)
      },
      recovery: {
        execute: () => this.recovery()
      },
      wait: {
        canExecute: () => true,
        execute: () => []
      }
    }

    // 朦朧状態の場合は回復判定
    if (actor.health.stunned) {
      // ActionRequest を作成し, execute
      const request = { type: 'recovery', options: {}, targets: [] } as ActionRequest
      this.execute(request)
    }
  }

  // availability を結果として生成
  get availability() {
    return {
      ready: this.actions.ready.canExecute(),
      attack: this.actions.attack.canExecute(),
      fullPowerAttack: this.actions.fullPowerAttack.canExcute(),
      legAttack: this.actions.legAttack.canExcute(),
      feint: this.actions.attack.canExecute(),
      defense: this.actions.defense.canExecute(),
      move: this.actions.move.options.position.reduce((acc, position) => {
        acc[position] = this.actions.move.canExecute(position)
        return acc
      }, {} as Record<Position, boolean>),
      changePosture: this.actions.changePosture.options.posture.reduce((acc, posture) => {
        acc[posture] = this.actions.changePosture.canExecute(posture)
        return acc
      }, {} as Record<Posture, boolean>),
      wait: this.actions.wait.canExecute()
    }
  }

  // 「準備」実行可否取得
  // 武器が非準備状態であることが条件
  private canReady(): boolean {
    return this.actor.attack.ready > 0
  }

  // 「攻撃」「牽制」実行可否取得
  // 武器が準備状態, かつ自身が前方に配置されている, かつ狂戦士状態ではないことが条件
  private canAttack(): boolean {
    return this.actor.attack.ready === 0 && this.actor.position !== 'back' && !this.actor.health.getEffects('berserk')
  }

  // 「全力攻撃」実行可否取得
  // 自身が前方に配置されていることが条件
  private canFullPowerAttack(): boolean {
    return this.actor.position !== 'back'
  }

  // 脚 (足首) 狙い攻撃実行可否取得
  // 屈みの姿勢, または竿状武器・射撃武器を構えていることが条件
  private canLegAttack(): boolean {
    return this.actor.posture !== 'standing' || this.actor.attack.model.isPole || this.actor.attack.model.isMissile
  }

  // 「全力防御」実行可否取得
  // 狂戦士状態ではないことが条件
  private canDefense(): boolean {
    return !this.actor.health.getEffects('berserk')
  }

  // 「移動」実行可否取得
  // 後退は自身が後方に配置されていないこと, かつ姿勢が「膝着き」でないこと, かつ狂戦士状態ではないこと
  // 前進はそこへ既にユニットが配置されていないこと, かつ姿勢が「膝着き」でないことが, それぞれ条件となる
  private canMove(position: Position): boolean {
    if (!this.state.formationStore) return false
    if (this.actor.posture === 'kneeling') return false
    if (position === 'back') {
      return this.state.formationStore[this.actor.side].back[this.actor.combatId] === null && !this.actor.health.getEffects('berserk') ? true : false
    } else {
      return this.state.formationStore[this.actor.side].front[position] === null ? true : false
    }
  }

  // 「姿勢変更」実行可否取得
  // 直立 → 這い は不可能
  // 這い → 膝着 のみ可能
  // その他の現行の姿勢以外には, いつでも変更可能
  private canChangePosture(posture: Posture): boolean {
    // 現行の姿勢を取得
    const current = this.actor.posture
    // このターンに既に姿勢変更をしていた場合は不可
    if (this.hasChangedPosture) return false
    // 現行の姿勢によって姿勢の変更可否を返す
    if (current === 'standing') {
      return posture !== current && posture !== 'prone'
    } else if (current === 'prone') {
      return posture !== current && posture === 'kneeling'
    } else {
      return posture !== current
    }
  }
  
  // ターゲットを結果として生成
  get target() {
    return {
      all: this.state.units,
      allies: this.getAllies(),
      enemies: this.getEnemies(),
      melee: this.getMeleeTarget(),
    }
  }

  // 味方取得
  private getAllies() {
    return this.state.units.filter(unit => unit.side === this.actor.side)
  }

  // 敵取得
  private getEnemies() {
    return this.state.units.filter(unit => unit.side !== this.actor.side)
  }

  // 近接攻撃対象取得
  private getMeleeTarget() {
    const enemies = this.getEnemies()
    switch (this.actor.position) {
      case 'left':
        return enemies.filter(unit => {
          return unit.position === 'right' || unit.position === 'center'
        })
      
      case 'center':
        return enemies.filter(unit => {
          return unit.position !== 'back'
        })

      case 'right':
        return enemies.filter(unit => {
          return unit.position === 'left' || unit.position === 'center'
        })

      default: // case 'back':
        return []
    }
  }

  // 実行
  // ActionRequest のプロパティ (type, options, targets) を引数に取って処理を進め, 
  // ActionResult の配列を Log に渡し, 再生して次のターンへ移る
  async execute (action: ActionRequest) {
    // コマンドパレットをロック (アンロックはコンストラクタで行われる)
    this.unlocked = false

    // コマンド実行前の姿勢
    const prevPosture = this.actor.posture

    // コマンド実行
    let results: ActionResult[]
    switch (action.type) {
      case 'ready':
        if (!this.actions.ready.canExecute()) results = []
        results = this.actions.ready.execute()
        break

      case 'attack':
        if (!this.actions.attack.canExecute()) results = []
        results = this.actions.attack.execute(action.options.aim, action.options.fullPower, action.targets[0])
        break

      case 'feint':
        if (!this.actions.attack.canExecute()) results = []
        results = this.actions.feint.execute(action.targets[0])
        break

      case 'defense':
        if (!this.actions.defense.canExecute()) results = []
        results = this.actions.defense.execute()
        break

      case 'move':
        if (!this.actions.move.canExecute(action.options.position)) results = []
        results = this.actions.move.execute(action.options.position)
        break

      case 'changePosture':
        if (!this.actions.changePosture.canExecute(action.options.posture)) results = []
        results = this.actions.changePosture.execute(action.options.posture)
        break
      
      case 'recovery':
        results = this.actions.recovery.execute()
        break
        
      default: // case 'wait':
        if (!this.actions.wait.canExecute()) results = []
        results = this.actions.wait.execute()
    }

    // ログを更新
    const log = this.state.logs[0]
    log.receiveResults(action, results)

    // 行動終了分岐
    let nextTurn = true
    if (prevPosture !== 'prone' && action.type === 'changePosture') {
      nextTurn = false
    }
    if (action.type === 'recovery') {
      const recoveryResult = results[0].judge as Judge
      if (recoveryResult.success) {
        nextTurn = false
      }
    }

    // 行動終了
    await this.state.playLog() // ログの再生完了を待つ
    if (!nextTurn) {
      this.unlocked = true
    } else {
      this.resolve()
    }
  }

  // ロール結果 (Roll型) を返す (ダメージ判定)
  private roll(count: number = 3, mod: number = 0, rate: number = 1,sides: number = 6): Roll {
    const roll = Math.floor(this.getRoll(count, mod, sides) * rate)
    return { roll }
  }

  // 判定結果 (Judge型) を返す
  private judge(target: number): Judge {
    const roll = this.getRoll()
    const criticalTarget = Math.max(4, Math.min((target - 10), 6)) // クリティカル
    const fumbleTarget = Math.max(17, Math.min((target + 1), 18)) // ファンブル
    const success = roll <= criticalTarget || (roll <= target && roll < 17)
    const critical = roll <= criticalTarget || roll >= fumbleTarget
    return { roll, success, critical }
  }

  private score(target: number): Score {
    const roll = this.getRoll()
    const success = roll < target
    const score = target - roll
    return { roll, success, score}
  }

  // ダイスを振った出目を取得
  private getRoll(count: number = 3, mod: number = 0, sides: number = 6): number {
    return Array.from<number>({ length: count }).reduce(sum => {
      return sum + Math.ceil(Math.random() * sides)
    }, 0) + mod
  }
  
  // 武器の準備状態を更新し, 攻撃の判定結果を返す
  // 姿勢・バフによる修正は込み
  private judgeAttack(aim: Aim, fullPower: FullPower, missileMod: number): ActionResult {
    this.actor.attack.ready = this.actor.attack.model.ready // 武器の準備状態を更新
    // 武器の非準備状態への変化 (trueなら変化無し)
    const ready = this.actor.attack.ready === 0
    // 目標値算出
    let target = this.actor.attack.target
    target += AIM_OPTIONS[aim].mod
    target += fullPower === 'level' ? 4 : 0
    // 射撃の場合, ターゲットの姿勢による修正を受ける
    target += missileMod
    return {
      type: 'attack',
      judge: { aim, fullPower, ready, ...this.judge(target) } as AttackResult
    }
  }

  // 防御の判定結果を返す
  // 姿勢・朦朧状態・バフによる修正は込み
  private judgeDefanse(target: Unit): ActionResult[] {
    // 修正の算出
    const feint = this.actor.attack.feint
    let mod = 0
    if (feint && feint.target === target) mod -= feint.score  // 牽制のターゲットの場合による修正

    // 全力防御オプション
    let defenseCount = 0
    const maxDefenseCount = target.defense.isFullDefense ? 2 : 1
    const results = []
    
    // 分岐
    if (target.defense.canBlock) {
      const blockResult = this.judgeBlock(target, mod)
      const blockJudge = blockResult.judge as DefenseResult
      results.push(blockResult)
      defenseCount++
      if (blockJudge.success) return results
    }
    if (target.defense.canParry && defenseCount < maxDefenseCount) {
      const parryResult = this.judgeParry(target, mod)
      const parryJudge = parryResult.judge as DefenseResult
      results.push(parryResult)
      defenseCount++
      if (parryJudge.success) return results
    }
    if (target.defense.canDodge && defenseCount < maxDefenseCount){
      const dodgeResult = this.judgeDodge(target, mod)
      results.push(dodgeResult)
    }
    return results
  }

  // 武器の準備状態を更新, parryCount をインクリメントし,「受け」の判定結果を返す
  private judgeParry(target: Unit, mod: number): ActionResult {
    target.attack.ready = target.attack.model.ready // 武器の準備状態を更新
    const ready = target.attack.ready === 0
    target.defense.parryCount++ // parryCount をインクリメント
    return {
      type: 'defense',
      judge: { defenseType: 'parry', ready, ...this.judge(target.defense.parryTarget + mod) } as DefenseResult
    }
  }

  // blockCount をインクリメントし,「止め」の判定結果を返す
  private judgeBlock(target: Unit, mod: number): ActionResult {
    target.defense.blockCount++ //  blockCount をインクリメント
    const ready = true
    return {
      type: 'defense',
      judge: { defenseType: 'block', ready, ...this.judge(target.defense.blockTarget + mod) } as DefenseResult
    }
  }

  // 「よけ」の判定結果を返す
  private judgeDodge(target: Unit, mod: number): ActionResult {
    const ready = true
    return {
      type: 'defense',
      judge: { defenseType: 'dodge', ready, ...this.judge(target.defense.dodgeTarget + mod) } as DefenseResult
    }
  }

  // ダメージ判定結果を返す
  private rollDmg(aim: Aim, fullPower: FullPower, target: Unit): ActionResult {
    const attack = this.actor.attack.model
    const defense = target.defense.getModel(AIM_OPTIONS[aim].group)
    const dmgType = attack.dmgType
    let count = attack.dmgDice
    count -= fullPower === 'dmg' ? 1 : 0 // 全力攻撃オプション「ダメージ安定」
    let mod = attack.dmgMod - (dmgType ? defense.sdr : defense.tdr)
    mod += fullPower === 'dmg' ? 6 : 0 // 全力攻撃オプション「ダメージ安定」
    const rate = aim === 'neck' || aim === 'stomach'
      ? (dmgType === 0 ? 1.5 : dmgType === 1 ? 2 : 3)
      : (dmgType === 0 ? 1 : dmgType === 1 ? 1.5 : 2)
    const roll = this.roll(count, mod, rate).roll
    return {
      type: 'dmg',
      judge: { roll, success: roll > 0, critical: roll >= 10 } as DmgResult
    }
  }

  private judgeFeint(target: Unit): ActionResult {
    return {
      type: 'feint',
      judge: { target, ...this.score(this.actor.attack.target) } as FeintResult
    }
  }

  // 転倒判定
  private judgeKnockedDown(target: Unit): ActionResult {
    return {
      type: 'knockedDown',
      judge: this.judge(target.defense.pre)
    }
  }

  // 致死判定
  private judgeFatal(target: Unit): ActionResult {
    return {
      type: 'fatal',
      judge: this.judge(target.defense.pre)
    }
  }

  // 気絶判定 (頭狙い)
  private judgeUnconscious(target: Unit, dmgType: number): ActionResult {
    const mod = dmgType === 0 ? -2 : 0 // 攻撃型が「叩」の場合の修正
    return {
      type: 'unconscious',
      judge: this.judge(target.defense.pre + mod)
    }
  }

  // 即死判定 (喉狙い)
  private judgeDead(target: Unit, dmgType: number): ActionResult {
    const mod = dmgType > 0 ? -2 : 0 // 攻撃型が「切」「刺」の場合の修正
    return {
      type: 'dead',
      judge: this.judge(target.defense.pre + mod)
    }
  }
  

  // 朦朧状態からの回復判定
  private judgeRecovery(): ActionResult {
    return {
      type: 'recovery',
      judge: this.judge(this.actor.defense.pre)
    }
  }

  // 「準備」実行
  private ready(): ActionResult[] {
    this.actor.attack.ready--
    return []
  }

  private attack(aim: Aim, fullPower: FullPower, target: Unit): ActionResult[] {
    const results: ActionResult[] = []
    // 全力攻撃フラグを true にする
    if (fullPower !== 'none') this.actor.defense.isFullAttackTurn = true
    // 攻撃ルーティン
    if (fullPower === 'feint') {
      // 牽制即攻撃
      results.push(...this.feint(target, true))
      results.push(...this.attackRoutine(aim, fullPower, target))
    } else if (fullPower === 'double') {
      // 2回攻撃
      results.push(...this.attackRoutine(aim, fullPower, target))
      if (!target.health.unconscious) { // ターゲットが倒れなければ攻撃続行
        results.push(...this.attackRoutine(aim, fullPower, target))
      }
    } else {
      // 通常攻撃
      results.push(...this.attackRoutine(aim, fullPower, target))
    }
    return results
  }

  // 「攻撃」実行
  private attackRoutine(aim: Aim, fullPower: FullPower, target: Unit): ActionResult[] {
    // 判定結果の配列
    const results: ActionResult[] = []
    
    // 攻撃判定
    const missileMod = this.actor.attack.model.isMissile ? POSTURE_MODS[target.posture].missileMod : 0
    const attackResult = this.judgeAttack(aim, fullPower, missileMod)
    const attackJudge = attackResult.judge as AttackResult
    results.push(attackResult)
    if (!attackJudge.success) return results // 攻撃失敗時はここで処理を止める

    // 防御判定
    // 攻撃判定がクリティカルか, ターゲットが全力攻撃選択時は, 防御判定をスキップ
    if (!attackJudge.critical || target.defense.isFullAttack) {
      const defenseResults = this.judgeDefanse(target)
      let success = false // 防御成功フラグ
      // defenseResults は配列で返される (ターゲットが全力防御の場合の対応)
      defenseResults.forEach(defenseResult => {
        const defenseJudge = defenseResult.judge as DefenseResult
        results.push(defenseResult)
        if (defenseJudge.success) success = true
      })
      if (success) return results // 防御成功時はここで処理を止める
    }

    // ダメージ判定
    const dmgResult = this.rollDmg(aim, fullPower, target)
    const dmgJudge = dmgResult.judge as DmgResult

    // 部位狙いによる顔・四肢の故障判定と, 最大ダメージ制限
    let injuryOnLimb = false
    if (aim === 'ear' || aim === 'eye') {
      if (dmgJudge.roll >= 2) injuryOnLimb = true
      dmgJudge.roll = Math.min(dmgJudge.roll, 2)
    }
    if (aim === 'hand' || aim === 'foot') {
      if (dmgJudge.roll >= target.maxHP / 3) injuryOnLimb = true
      dmgJudge.roll = Math.min(dmgJudge.roll, Math.floor(target.maxHP / 3))
    }
    if (aim === 'arm' || aim === 'leg') {
      if (dmgJudge.roll >= target.maxHP / 2) injuryOnLimb = true
      dmgJudge.roll = Math.min(dmgJudge.roll, Math.floor(target.maxHP / 2))
    }
    results.push(dmgResult)
    if (!dmgJudge.success) return results // ダメージが通らなかった時はここで処理を止める

    // 負傷 (ダメージ効果)
    const dmg = dmgJudge.roll
    target.health.injury += dmg

    // 顔・四肢を狙った攻撃
    if ((aim === 'ear' || aim === 'eye' || aim === 'arm' || aim === 'leg' || aim === 'hand' || aim === 'foot') && injuryOnLimb) {
      const injuryOnLimbResult = { type: 'injuryOnLimb', judge: { limb: aim } } as ActionResult
      results.push(injuryOnLimbResult)
    }

    // それ以外を狙った攻撃
    if (aim === 'head' || aim === 'body' || aim === 'neck' || aim === 'stomach') {

      // 朦朧状態・転倒判定 (気絶に至ってない場合のみ)
      if (!target.health.unconscious && (dmg >= target.maxHP / 2 // 通常
        || ((aim === 'head' || aim === 'neck') && dmg >= target.maxHP / 3) // 頭・喉狙い
      )) {
        target.health.stunned = true
        const knockedDownResult = this.judgeKnockedDown(target)
        const knockedDownJudge = knockedDownResult.judge as Judge
        results.push(knockedDownResult)
        if (!knockedDownJudge.success) {
          target.posture = 'prone' // 姿勢変更
        }
      }

      // 気絶・致死判定
      if (target.health.unconscious) {
        const fatalResult = this.judgeFatal(target)
        const fatalJudge = fatalResult.judge as Judge
        results.push(fatalResult)
        if (!fatalJudge.success) {
          target.health.dead = true // 死亡
        }
        return results // ダメージで気絶した時はここで処理を止める
      }

      // 気絶判定 (頭狙い)
      if (aim === 'head' && dmg >= target.maxHP / 2) {
        const unconsciousResult = this.judgeUnconscious(target, this.actor.attack.model.dmgType)
        const unconsciousJudge = unconsciousResult.judge as Judge
        if (!unconsciousJudge.success) {
          results.push(unconsciousResult)
          target.health.unconscious = true
        }
      }

      // 即死判定 (喉狙い)
      if (aim === 'neck' && dmg >= target.maxHP / 2) {
        const deadResult = this.judgeDead(target, this.actor.attack.model.dmgType)
        const deadJudge = deadResult.judge as Judge
        if (!deadJudge.success) {
          results.push(deadResult)
          target.health.unconscious = true
          target.health.dead = true
        }
      }
    }
    
    return results
  }
  
  // 「牽制」実行
  // 全力攻撃時の牽制即攻撃は, isImmediate: true で処理 (牽制効果を次ターンに持ち越さない)
  private feint(target: Unit, isImmediate: boolean = false): ActionResult[] {
    const result = this.judgeFeint(target)
    const judge = result.judge as FeintResult
    const score = judge.score
    // 牽制結果を次ターンに保持
    if (score > 0) this.actor.attack.feint = { currentTurn: !isImmediate, target, score } as Feint
    return [result]
  }

  // 「全力防御」実行
  private defense(): ActionResult[] {
    // 全力防御フラグを true にする
    this.actor.defense.isFullDefenseTurn = true
    return []
  }

  // 「移動」実行
  private move(position: Position): ActionResult[] {
    this.actor.position = position
    return []
  }

  // 「姿勢変更」実行
  private changePosture(posture: Posture): ActionResult[] {
    this.actor.posture = posture
    this.hasChangedPosture = true // 1ターンに1度まで
    return []
  }

  // 朦朧状態からの「回復」実行
  private recovery(): ActionResult[] {
    const result = this.judgeRecovery()
    const judge = result.judge as Judge
    if (judge.success) this.actor.health.stunned = false
    return [result]
  }
}
