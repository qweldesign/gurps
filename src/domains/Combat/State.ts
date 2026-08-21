// Combat/State.ts

import { CombatLog as Log } from './Log'
import { type CombatUnitModel as Model, type CombatUnitSnapshot as UnitSnapshot, type Side, CombatUnit as Unit } from './Unit'
import { CombatFormation as Formation } from './Formation'
import { CombatAction as Action } from './Action'
import { judgeTimeRegression } from './Action/resolver'
import { SPELL_ELEMENTS } from './Spells'
import { decideEnemyAction } from './AI'

// 勝敗結果 (未決着は null)
export type CombatResult = 'win' | 'lose' | null

// 「重篤な状態」(「時間遡行」の発動条件用): 死亡・気絶・転倒・目/耳/四肢の故障のいずれか
function isCriticalUnit(unit: Unit): boolean {
  return unit.health.dead || unit.health.unconscious || unit.posture === 'prone' ||
    unit.health.blinded || unit.health.deafened || unit.health.injuryOnArm || unit.health.injuryOnLeg
}
function isCriticalSnapshot(snapshot: UnitSnapshot): boolean {
  return snapshot.health.dead || snapshot.health.unconscious || snapshot.posture === 'prone' ||
    snapshot.health.blinded || snapshot.health.deafened || snapshot.health.injuryOnArm || snapshot.health.injuryOnLeg
}

// 全ての情報を集約・管理するクラス
export class CombatState {
  public round: number // 経過時間
  public turnIndex: number // 行動順
  public units: Unit[]
  public formation: Formation | null
  public logs: Log[]
  public playLog: () => Promise<void> // Combat 本体から受け取り, Action から呼び出す
  public action: Action | null
  public foggy: boolean // 濃霧発生中か否か (戦場全体に及ぶ持続効果. 一度発生すれば戦闘終了まで持続する. 「濃霧」用)
  public puppetTarget: Unit | null // 「傀儡」で移行中の対象 (非null の間, actor はこちらを優先する. 通常の行動順の進行とは無関係)
  public result: CombatResult // 勝敗結果 (未決着中は null. 決着後はターンを進めない)

  constructor(models: Model[], playLog: () => Promise<void>) {
    this.round = 1 // 1からカウント
    this.turnIndex = -1 // 開幕前は -1, 開幕と同時に 0 になる
    this.units = models.map((model, i) => {
      return new Unit(model, i + 1) // combatIdは1からカウント
    })
    this.formation = null
    this.logs = []
    this.playLog = playLog
    this.action = null
    this.foggy = false
    this.puppetTarget = null
    this.result = null
  }

  get actor() {
    return this.puppetTarget ?? this.units[this.turnIndex]
  }

  // 勝敗判定: 前衛 (left/center/right) に生存者 (気絶・死亡していない者) が1人もいない陣営があれば, その陣営の敗北とする
  // 開幕直後は全ユニットが後列に配置されているため, 1ターン目 (round === 1, 全員が最初の1巡を終えるまで) は判定対象外とする
  private judgeResult(): CombatResult {
    const hasFrontAlive = (side: Side) => this.units.some(unit => (
      unit.side === side && unit.position !== 'back' && !unit.health.unconscious && !unit.health.dead
    ))
    if (!hasFrontAlive('player')) return 'lose'
    if (!hasFrontAlive('enemy')) return 'win'
    return null
  }

  // 次のターンへ進む
  async nextTurn() {
    // 勝敗判定 (1ターン目を除く. 決着した場合はここで終了し, 以降のターンを進めない)
    if (this.round > 1) {
      const result = this.judgeResult()
      if (result) {
        this.result = result
        this.logs[0]?.receiveResult(result)
        await this.playLog()
        return
      }
    }

    // 倒れているユニットのターンをパス
    let isAlive = false
    while (!isAlive) {
      this.turnIndex++
      if (this.turnIndex === this.units.length) {
        this.round++
        this.turnIndex %= this.units.length
      }
      isAlive = !this.actor.health.unconscious
    }
    this.formation = new Formation(this.actor, this.units)
    // 前ターンのログを, その行動者の履歴として保持 (Summaryの行動ラベル表示用)
    if (this.logs[0]) this.logs[0].actor.history = this.logs[0]
    // 新しいログを追加
    const newLog = new Log(this.actor)
    this.logs.unshift(newLog)

    // 「時間遡行」用: 相手陣営に発動候補 (精神集中(水)が3ターン以上) がいる場合のみ, 全ユニットの状態をスナップショットする
    // (このターンの間, 精神集中は候補側の行動によってしか増減しないため, ターン開始前に候補がいなければ発動しうる者もいない)
    const hasOpposingCandidate = this.units.some(unit => unit.side !== this.actor.side && unit.spellCast.water >= 3)
    const snapshot: Map<Unit, UnitSnapshot> | null = hasOpposingCandidate
      ? new Map(this.units.map(unit => [unit, unit.getSnapshot()]))
      : null

    // ターン開始ログを表示
    await this.playLog()
    // コマンドパレット初期化
    this.action = new Action(this)
    // 開幕時の自動実行 (朦朧回復・消火) の完了を待つ
    await this.action.ready

    // 敵 (NPC) のターンは自動で行動を決定・実行する
    // (自動実行 (recovery/extinguish) で既にターンが終わっている場合は unlocked が false のままなのでスキップする.
    //  「傀儡」で操られている間は, 本来の所属陣営とは無関係にプレイヤー側が操作するため対象外とする.
    //  「射撃」「法術」等, 選択してもターンが終わらない行動があるため, ターンが終わる (unlocked が false になる)
    //  か「傀儡」に移行するまで, 続けて次の行動を決定させる)
    let aiActionCount = 0
    while (this.action.unlocked && this.actor.side === 'enemy' && this.actor.tactic && !this.actor.health.puppeted) {
      aiActionCount++
      if (aiActionCount > 10) break // 安全装置 (通常到達しない想定. 意図しない無限ループを防ぐ)
      const request = decideEnemyAction(this.actor, this)
      await this.action.execute(request)
    }

    //　コマンド入力待機
    await this.action.promise.then(async () => {
      const actor = this.actor
      // 「時間遡行」の発動判定 (行動者のターンが完全に終わった直後, ターン終了処理の前に判定する)
      const regressed = snapshot ? await this.resolveTimeRegression(actor, snapshot) : false

      if (!regressed) {
        // 牽制の持ち越し状態を更新 (自身のターン終了時点で適用可能に, 未適用なら破棄)
        actor.attack.nextTurn()
        // 行動者の能動防御 (受け・止めの試行回数, 全力防御) をリセット
        actor.defense.nextTurn()
        // 行動者の状態異常・バフの残存時間を更新
        actor.statusEffects.nextTurn()
        actor.statusBuff.nextTurn()
      }
      // 自身を呼び出し, また次のターンへ進む
      this.debug()
      this.nextTurn()
    })
  }

  // 「傀儡」: 対象のターンへその場で即座に移行する (通常の行動順の進行を伴わない, その場限りの1ターンのみの制御)
  // nextTurn() のターン開始・終了処理 (Formation再構築・ログ追加・能動防御/状態異常/バフの更新) を, 行動順を進めずに対象1体分だけ再現する
  // (「時間遡行」の巻き戻し判定は行わない. 傀儡ターンでの重篤な状態への言及は現状スコープ外)
  async startPuppetTurn(target: Unit) {
    this.puppetTarget = target
    this.formation = new Formation(this.actor, this.units)
    // 術者のログを, その行動者 (術者) の履歴として保持
    if (this.logs[0]) this.logs[0].actor.history = this.logs[0]
    // 傀儡ターン用の新しいログを追加
    const newLog = new Log(this.actor)
    this.logs.unshift(newLog)

    // ターン開始ログを表示
    await this.playLog()
    // コマンドパレット初期化 (対象のコマンドパレットが開く. Action コンストラクタは this.actor = puppetTarget を参照する)
    this.action = new Action(this)
    // コマンド入力待機 (対象の1ターン分の行動が完了するまで)
    await this.action.promise
    // ターン終了処理 (通常の nextTurn 同様, 牽制の持ち越し・能動防御試行回数・状態異常/バフの残存ターンを更新する)
    target.attack.nextTurn()
    target.defense.nextTurn()
    target.statusEffects.nextTurn()
    target.statusBuff.nextTurn()
    // 傀儡状態を解除し, 通常の行動順 (turnIndex 由来の actor) へ戻す
    target.health.puppeted = false
    this.puppetTarget = null
  }

  // 「時間遡行」(水行術, spellType: 'defense') の発動判定・巻き戻しを行う
  // 発動条件: actor の相手陣営に精神集中(水)を3ターン以上維持している (=このターンの間に阻害されていない) 者がおり,
  // かつ その陣営の誰か (術者自身を含む) が, このターンの間に新たに重篤な状態 (死亡・気絶・転倒・目/耳/四肢の故障) に陥った場合
  // 候補が複数いる場合は combatId が最も若い者が発動する
  // 成否を問わず, 発動した時点で精神集中はリセットされる. 成功した場合のみ全ユニットの状態をスナップショット時点へ巻き戻す
  // 巻き戻しに成功した場合, そのターン (行動者自身の終了処理を含む) が丸ごと無かったことになるため, 呼び出し元は行動者の
  // ターン終了処理 (attack/defense/statusEffects/statusBuff の nextTurn) をスキップする (戻り値 true で判別する)
  private async resolveTimeRegression(actor: Unit, snapshot: Map<Unit, UnitSnapshot>): Promise<boolean> {
    // 発動候補: actor の相手陣営で, このターンの間も精神集中(水)を3ターン以上維持できている (=阻害されていない) ユニット
    // 気絶・死亡している者は (このターンでそうなった場合を含め) 行動不能のため候補から除外する
    // (「転倒」による重篤化は既存の無条件解除ルールにより自身の集中も同時に途絶えるため, 自動的に候補から外れる.
    //  気絶」「死亡」は一撃で意識を失う場合もあり, その場合精神集中自体は数値上残ってしまうため, ここで明示的に除外する)
    const candidates = this.units.filter(unit => unit.side !== actor.side && unit.spellCast.water >= 3 && !unit.health.unconscious && !unit.health.dead)
    if (candidates.length === 0) return false

    // このターンの間に, 候補の陣営の誰か (術者自身を含む) が新たに重篤な状態に陥ったか
    const candidateSide = candidates[0].side
    const newlyCritical = this.units.some(unit => {
      if (unit.side !== candidateSide) return false
      const before = snapshot.get(unit)
      if (!before || isCriticalSnapshot(before)) return false // 元々重篤だった場合は対象外 (新たに「陥った」場合のみ)
      return isCriticalUnit(unit)
    })
    if (!newlyCritical) return false

    // combatId が最も若い候補が発動する
    const caster = [...candidates].sort((a, b) => a.combatId - b.combatId)[0]

    // 発動 (成否を問わず, 発動時点で精神集中はリセットされる)
    const judge = judgeTimeRegression(caster)
    SPELL_ELEMENTS.forEach(element => { caster.spellCast[element] = 0 })

    const log = this.logs[0]
    log.receiveTimeRegression(caster, judge)
    await this.playLog()

    if (!judge.success) return false

    // 巻き戻し: 全ユニットの状態をスナップショット時点へ復元する
    this.units.forEach(unit => {
      const before = snapshot.get(unit)
      if (before) unit.restoreSnapshot(before)
    })
    // 精神集中は巻き戻し後もリセットされたままとする (復元により一旦元の値に戻るため, 改めてリセットする)
    SPELL_ELEMENTS.forEach(element => { caster.spellCast[element] = 0 })

    return true
  }

  debug() {
    const { round, turnIndex, units } = this
    console.log({ round, turnIndex, units })
  }
}
