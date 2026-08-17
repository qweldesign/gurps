// Combat/Action/effects.ts

import { CombatState as State } from '../State'
import { type WeaponSlotKey } from '../../Equipments'
import { type Position, type Posture, type CombatUnit as Unit } from '../Unit'
import { type Aim, type FullPower, type ActionResult, type DefenseResult } from './types'
import { judgeAttack, judgeDefense, rollDmg, judgeFeint, judgeCast, judgeSpell, judgeRecovery, judgeMaintainCast, judgeKnockedDown, judgeFatal, judgeUnconscious, judgeDead } from './resolver'
import { SPELL_ELEMENTS, SPELL_LIST, type SpellElement, type SpellEffect } from '../Spells'

// 行動実行 (状態変更) を司るクラス / Action.execute から呼び出される
export class ActionEffects {
  private state: State

  constructor(state: State) {
    this.state = state
  }

  //「準備」実行
  ready(): ActionResult[] {
    this.state.actor.attack.ready--
    return []
  }

  //「攻撃」実行 (全力攻撃オプションに応じて,「牽制即攻撃」「2回攻撃」へ処理を振り分ける)
  attack(aim: Aim, fullPower: FullPower, target: Unit): ActionResult[] {
    const actor = this.state.actor
    const results: ActionResult[] = []

    // 全力攻撃オプション選択時, 自身は次の自分のターンまで能動防御 (受け・止め・よけ) が行えなくなる
    // (Defense.canParry/canBlock/canDodge が参照する isFullAttack は, isFullAttackTurn から次ターンの Defense.nextTurn() で引き継がれる)
    if (fullPower !== 'none') actor.defense.isFullAttackTurn = true

    if (fullPower === 'feint') {
      // 全力攻撃オプション「牽制即攻撃」: 牽制を即座に適用した上で, そのまま攻撃する
      results.push(...this.feint(target, true))
      results.push(...this.attackRoutine(aim, fullPower, target))
    } else if (fullPower === 'double') {
      // 全力攻撃オプション「2回攻撃」: 対象が気絶しなければ, 続けてもう一度攻撃する
      results.push(...this.attackRoutine(aim, fullPower, target))
      if (!target.health.unconscious) {
        results.push(...this.attackRoutine(aim, fullPower, target))
      }
    } else {
      // 通常攻撃, および全力攻撃オプション「ダメージ安定」「技能値+4」(既に resolver/Attack 側で反映済み)
      results.push(...this.attackRoutine(aim, fullPower, target))
    }

    return results
  }

  // 攻撃1回分の判定・効果適用 (判定結果に基づき, HPへのダメージ反映と朦朧・転倒・気絶・死亡までを処理する)
  private attackRoutine(aim: Aim, fullPower: FullPower, target: Unit): ActionResult[] {
    const results: ActionResult[] = []
    const actor = this.state.actor

    // 攻撃判定
    const attackJudge = judgeAttack(actor, aim, fullPower, target)
    // 武器の準備状態を更新 (準備の要る武器の場合, 攻撃後は非準備状態になる)
    actor.attack.ready = actor.attack.model.ready
    results.push({ type: 'attack', judge: { ...attackJudge, ready: actor.attack.ready === 0 } })
    if (!attackJudge.success) return results // 攻撃失敗時はここで処理を止める

    // 防御判定 (攻撃判定がクリティカルか, 対象がいかなる防御も行えない (自身が全力攻撃選択中など) 場合はスキップ)
    // 全力防御中の対象は, 最初の防御に失敗しても続けて別の防御方法を試みるため, 複数回分の結果が返ることがある
    const canDefend = target.defense.getCanBlock(aim) || target.defense.canParry || target.defense.canDodge
    if (!attackJudge.critical && canDefend) {
      const defenseJudges = judgeDefense(actor, aim, target)
      const { results: defenseResults, defended } = this.resolveDefenseAttempts(target, defenseJudges)
      results.push(...defenseResults)
      if (defended) return results // 防御成功時はここで処理を止める
    }

    // ダメージ判定
    const dmgJudge = rollDmg(actor, aim, fullPower, target)

    // 部位狙いによる, 頭・四肢への負傷上限と故障判定
    // (耳・目は2点, 手首・足首は最大HPの1/3, 腕・脚は最大HPの1/2を超える負傷を負えず, 超えた分は故障として扱う)
    let injuryOnLimb = false
    let dmg = dmgJudge.roll
    if (aim === 'ear' || aim === 'eye') {
      injuryOnLimb = dmg >= 2
      dmg = Math.min(dmg, 2)
    }
    if (aim === 'hand' || aim === 'foot') {
      injuryOnLimb = dmg >= target.health.maxHp / 3
      dmg = Math.min(dmg, Math.floor(target.health.maxHp / 3))
    }
    if (aim === 'arm' || aim === 'leg') {
      injuryOnLimb = dmg >= target.health.maxHp / 2
      dmg = Math.min(dmg, Math.floor(target.health.maxHp / 2))
    }

    results.push({ type: 'dmg', judge: { ...dmgJudge, roll: dmg } })
    if (!dmgJudge.success) return results // ダメージが通らなかった時はここで処理を止める

    // ダメージ効果
    target.health.injury += dmg

    // 頭・四肢を狙った攻撃 (負傷上限を超えた場合のみ故障する)
    if (injuryOnLimb) {
      results.push({ type: 'injuryOnLimb', judge: { limb: aim } })
    }

    // それ以外 (頭・体・喉・肚) を狙った攻撃
    if (aim === 'head' || aim === 'body' || aim === 'neck' || aim === 'stomach') {
      // 朦朧状態・転倒判定 (気絶に至っていない場合のみ行う. 頭・喉狙いは急所のため, 最大HPの1/3以上でも対象になる)
      if (!target.health.unconscious && (dmg >= target.health.maxHp / 2 || ((aim === 'head' || aim === 'neck') && dmg >= target.health.maxHp / 3))) {
        target.health.stunned = true
        const knockedDownJudge = judgeKnockedDown(target)
        results.push({ type: 'knockedDown', judge: knockedDownJudge })
        if (!knockedDownJudge.success) {
          target.posture = 'prone' // 姿勢変更
        }
      }

      // 気絶・死亡判定 (負傷が最大HPに達し, 気絶している場合)
      if (target.health.unconscious) {
        const fatalJudge = judgeFatal(target)
        results.push({ type: 'fatal', judge: fatalJudge })
        if (!fatalJudge.success) {
          target.health.dead = true // 死亡
        }
        return results // ダメージで気絶した時はここで処理を止める
      }

      // 気絶判定 (頭狙いで, ダメージが最大HPの半分以上の場合のみ. 失敗すると即座に気絶する)
      if (aim === 'head' && dmg >= target.health.maxHp / 2) {
        const unconsciousJudge = judgeUnconscious(target, actor.attack.model.dmgType)
        if (!unconsciousJudge.success) {
          results.push({ type: 'unconscious', judge: unconsciousJudge })
          target.health.unconscious = true
        }
      }

      // 即死判定 (喉狙いで, ダメージが最大HPの半分以上の場合のみ. 失敗すると即座に死亡する)
      if (aim === 'neck' && dmg >= target.health.maxHp / 2) {
        const deadJudge = judgeDead(target, actor.attack.model.dmgType)
        if (!deadJudge.success) {
          results.push({ type: 'dead', judge: deadJudge })
          target.health.unconscious = true
          target.health.dead = true
        }
      }
    }

    return results
  }

  // 防御判定結果配列を順に適用し, 実際の防御試行回数・武器準備状態への反映とログ用結果を生成する
  // 防御を1回でも試みた場合, 対象自身の準備・狙い・精神集中への副次的な影響も合わせて解決する (resolveDefenseInterrupts)
  private resolveDefenseAttempts(target: Unit, defenseJudges: Array<Omit<DefenseResult, 'ready'>>): { results: ActionResult[], defended: boolean } {
    const results: ActionResult[] = []
    let defended = false

    for (const defenseJudge of defenseJudges) {
      // 能動防御の試行回数を加算 (「受け」「止め」はターンにつき通常1回, 全力防御時は2回まで. Defense.canParry/canBlock が参照する)
      // 「受け」の場合のみ, 武器の準備状態も更新する (準備の要る武器の場合, 受けの後は非準備状態になる)
      let ready = true
      if (defenseJudge.defenseType === 'parry') {
        target.defense.parryCount++
        target.attack.ready = target.attack.model.ready
        ready = target.attack.ready === 0
      } else if (defenseJudge.defenseType === 'block') {
        target.defense.blockCount++
      }

      results.push({ type: 'defense', judge: { ...defenseJudge, ready } })
      if (defenseJudge.success) {
        defended = true
        break
      }
    }

    // 防御 (受け・止め・よけのいずれか) を1回でも試みたなら, 対象自身への副次的な影響を解決する (成否は問わない)
    if (defenseJudges.length > 0) {
      results.push(...this.resolveDefenseInterrupts(target))
    }

    return { results, defended }
  }

  // 防御を試みたことによる, 対象自身への副次的な影響を解決する
  // 準備: 準備中 (ready > 0) の射撃武器を持っている場合, 判定なしで常にそのターン分の準備が巻き戻る
  // 狙い:「狙い」由来の持ち越し (attack.feint.source === 'snipe') がある場合のみ, 判定なしで常に破棄される (「牽制」由来は対象外)
  // 精神集中: いずれかの系統に詠唱時間を蓄積中の場合のみ, 維持判定 (IN-4 もしくは 修養-2 相当) を行う. 失敗すれば集中が途絶える
  private resolveDefenseInterrupts(target: Unit): ActionResult[] {
    const results: ActionResult[] = []

    if (target.attack.ready > 0 && target.attack.model.isMissile) {
      target.attack.ready = Math.min(target.attack.ready + 1, target.attack.model.ready)
      results.push({ type: 'readyInterrupted', judge: { weaponName: target.attack.model.name } })
    }

    if (target.attack.feint?.source === 'snipe') {
      target.attack.feint = null
      results.push({ type: 'aimInterrupted', judge: { source: 'snipe' } })
    }

    const castingElement = SPELL_ELEMENTS.find(element => target.spellCast[element] > 0)
    if (castingElement) {
      const maintainJudge = judgeMaintainCast(target)
      results.push({ type: 'castInterrupted', judge: maintainJudge })
      if (!maintainJudge.success) {
        target.spellCast[castingElement] = 0 // 精神集中の途絶
      }
    }

    return results
  }

  //「牽制」実行 (成功時, 次の自分の攻撃 (対象が同じ場合) まで防御目標値の低下効果を持ち越す)
  // isImmediate: true の場合 (全力攻撃オプション「牽制即攻撃」から呼ばれる), 同じ行動内で直後に続く攻撃から即座に適用する
  feint(target: Unit, isImmediate: boolean = false): ActionResult[] {
    const actor = this.state.actor
    const feintJudge = judgeFeint(actor, target)
    if (feintJudge.success) {
      actor.attack.feint = { currentTurn: !isImmediate, target, score: feintJudge.score, source: 'feint' }
    }
    return [{ type: 'feint', judge: feintJudge }]
  }

  //「射撃」実行 (武器・ターゲット選定が異なるのみで,「攻撃」の通常攻撃と同じ判定・効果処理を用いる)
  shoot(aim: Aim, target: Unit): ActionResult[] {
    return this.attackRoutine(aim, 'none', target)
  }

  //「狙い」実行 (「牽制」と全く同じ判定・効果処理を, 近接に限らないターゲットに対して用いる)
  // 発生源を 'snipe' としてマークする (「狙い」由来の持ち越しのみ, 対象が防御を試みると乱れて破棄されるため)
  snipe(target: Unit): ActionResult[] {
    const results = this.feint(target)
    const feintResult = results[0]
    if (feintResult.type === 'feint' && feintResult.judge.success) {
      this.state.actor.attack.feint!.source = 'snipe'
    }
    return results
  }

  //「集中」実行 (該当する系統の詠唱時間を1蓄積する. 他の系統に集中していた場合, その詠唱時間はリセットされる)
  // 聾・沈黙状態の場合のみ判定を要する (それ以外は無条件で詠唱時間が進む)
  cast(element: SpellElement): ActionResult[] {
    const actor = this.state.actor
    actor.spellCast[element]++
    SPELL_ELEMENTS.forEach(spellElement => {
      if (spellElement !== element) actor.spellCast[spellElement] = 0
    })
    const castJudge = judgeCast(actor, element)
    return castJudge ? [{ type: 'cast', judge: castJudge }] : []
  }

  //「法術」実行 (蓄積した詠唱時間を消費して発動する. 全ての系統の詠唱時間をリセットする)
  // 発動判定に成功した場合のみ, 術に対応する効果を target (バフ系: 自身 or 選択した味方) に適用する
  spell(element: SpellElement, spellId: number, target: Unit): ActionResult[] {
    const actor = this.state.actor
    SPELL_ELEMENTS.forEach(spellElement => { actor.spellCast[spellElement] = 0 })
    const spellJudge = judgeSpell(actor, element, spellId)
    if (spellJudge.success) {
      this.applySpellEffect(target, SPELL_LIST[element][spellId].effect)
    }
    return [{ type: 'spell', judge: spellJudge }]
  }

  // 術の効果適用 (未対応の効果種別は何もしない. 今後 dmg/debuff/recover 等を追加予定)
  private applySpellEffect(target: Unit, effect?: SpellEffect) {
    if (!effect) return
    switch (effect.kind) {
      case 'buff':
        if (effect.target === 'level') target.statusBuff.addLevelBuff()
        else if (effect.target === 'dmg') target.statusBuff.addDmgBuff()
        else if (effect.target === 'ev') target.statusBuff.addEvBuff()
        else if (effect.target === 'dr') target.statusBuff.addDrBuff()
        break
    }
  }

  //「全力防御」実行 (次の相手のターンまで, 能動防御の試行回数上限が2回に増える. Defense.nextTurn() で isFullDefense に引き継がれる)
  defense(): ActionResult[] {
    this.state.actor.defense.isFullDefenseTurn = true
    return []
  }

  //「移動」実行
  move(position: Position) {
    this.state.actor.position = position
  }

  //「装備変更」実行
  changeWeapon(weaponSlotKey: WeaponSlotKey): ActionResult[] {
    this.state.actor.attack.key = weaponSlotKey
    return []
  }

  //「姿勢変更」実行
  changePosture(posture: Posture): ActionResult[] {
    this.state.actor.posture = posture
    return []
  }

  //「待機」実行
  wait() {
    // 状態変更なし
  }

  // 朦朧状態からの「回復」実行 (stunned な状態のターン開始時に自動実行される)
  recovery(): ActionResult[] {
    const recoveryJudge = judgeRecovery(this.state.actor)
    if (recoveryJudge.success) {
      this.state.actor.health.stunned = false // 回復
    }
    return [{ type: 'recovery', judge: recoveryJudge }]
  }
}
