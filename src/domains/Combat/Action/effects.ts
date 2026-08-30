// Combat/Action/effects.ts

import { CombatState as State } from '../State'
import { type WeaponSlotKey } from '../../Equipments'
import { type Position, type Posture, type CombatUnit as Unit } from '../Unit'
import { AIM_OPTIONS, type Aim, type FullPower, type ActionResult, type DefenseResult, type DmgResult, type SpellEffectResult, type FlashResult, type HealResult, type CleanseResult, type DebuffAllResult } from './types'
import { judgeAttack, judgeDefense, rollDmg, judgeSpellDefense, judgeShieldBlock, rollSpellDmg, judgeFeint, judgeCast, judgeSpell, judgeTrip, judgeResist, judgeRecovery, judgeMaintainCast, judgeKnockedDown, judgeFatal, judgeUnconscious, judgeDead } from './resolver'
import { SPELL_ELEMENTS, SPELL_LIST, MAX_SPELL_CAST, type SpellElement, type SpellEffect, type Spell } from '../Spells'

// 部位狙いによる負傷上限 (耳・目は2点固定, それ以外は対象の最大HP比. resolveDamage で利用する)
const LIMB_INJURY_CAP: Partial<Record<Aim, (target: Unit) => number>> = {
  ear: () => 2,
  eye: () => 2,
  hand: target => Math.floor(target.health.maxHp / 3),
  foot: target => Math.floor(target.health.maxHp / 3),
  arm: target => Math.floor(target.health.maxHp / 2),
  leg: target => Math.floor(target.health.maxHp / 2),
}

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
    const attackJudge = judgeAttack(actor, aim, fullPower, target, this.state.shootPenalty[actor.side])
    // 武器の準備状態を更新 (準備の要る武器の場合, 攻撃後は非準備状態になる)
    // ファンブルの場合, 武器の種別 (準備が元々不要な武器を含む) に関わらず,
    // 大きく空振りして最低1ターンの引き戻しが必要になる
    const isFumble = attackJudge.critical && !attackJudge.success
    actor.attack.ready = isFumble ? Math.max(actor.attack.model.ready, 1) : actor.attack.model.ready
    results.push({ type: 'attack', judge: { ...attackJudge, ready: actor.attack.ready === 0 } })
    if (!attackJudge.success) return results // 攻撃失敗時はここで処理を止める

    // 防御判定 (攻撃判定がクリティカルか, 対象がいかなる防御も行えない (自身が全力攻撃選択中など) 場合はスキップ)
    // 全力防御中の対象は, 最初の防御に失敗しても続けて別の防御方法を試みるため, 複数回分の結果が返ることがある
    const canDefend = target.defense.getCanBlock(aim) || target.defense.canParry || target.defense.canDodge
    const { results: defenseResults, defended, criticalDefense, castCanceledResults } =
      this.tryDefend(target, !attackJudge.critical && canDefend, () => judgeDefense(actor, aim, target))
    results.push(...defenseResults)
    if (defended) {
      // 対象の防御判定がクリティカル成功した場合も, 武器の種別に関わらず自身が体勢を崩し最低1ターンの引き戻しが必要になる
      if (criticalDefense) {
        actor.attack.ready = Math.max(actor.attack.ready, 1)
        results.push({ type: 'overextended', judge: { weaponName: actor.attack.model.name } })
      }
      results.push(...castCanceledResults) // ダメージ判定が発生しない場合はここで表示する
      return results // 防御成功時はここで処理を止める
    }

    // ダメージ判定 (攻撃判定がクリティカルの場合, 対象のDRを無視する)
    const dmgJudge = rollDmg(actor, aim, fullPower, target, attackJudge.critical)
    results.push(...this.resolveDamage(dmgJudge, aim, actor.attack.model.dmgType, target, castCanceledResults))

    return results
  }

  // ダメージ判定結果を元に, HPへの反映と部位狙いの故障・朦朧・転倒・気絶・死亡までの結果を返す
  // (「攻撃」「射撃」および術の直接ダメージ型で共通利用する. dmgType は攻撃手段 (武器/術) のダメージ型)
  // deferredCastCanceled: 防御を試みた時点で判定済みの精神集中の維持判定結果 (あれば). ダメージ判定 (dmg) の直後に表示する
  private resolveDamage(dmgJudge: DmgResult, aim: Aim, dmgType: number, target: Unit, deferredCastCanceled: ActionResult[] = []): ActionResult[] {
    const results: ActionResult[] = []

    // 部位狙いによる, 頭・四肢への負傷上限と故障判定
    // (耳・目は2点, 手首・足首は最大HPの1/3, 腕・脚は最大HPの1/2を超える負傷を負えず, 超えた分は故障として扱う. 上限値は LIMB_INJURY_CAP 参照)
    let injuryOnLimb = false
    let dmg = dmgJudge.roll
    const limbCap = LIMB_INJURY_CAP[aim]?.(target)
    if (limbCap !== undefined) {
      injuryOnLimb = dmg >= limbCap
      dmg = Math.min(dmg, limbCap)
    }

    results.push({ type: 'dmg', judge: { ...dmgJudge, roll: dmg, target } })
    // 防御を試みたことによる維持判定の結果は, 実際にダメージが通ったか否かによらずここで表示する (判定自体は既に防御試行時点で完了している)
    results.push(...deferredCastCanceled)
    if (!dmgJudge.success) return results // ダメージが通らなかった時はここで処理を止める

    // ダメージ効果
    target.health.injury += dmg

    // 頭・四肢を狙った攻撃 (負傷上限を超えた場合のみ故障する)
    if (injuryOnLimb) {
      results.push({ type: 'injuryOnLimb', judge: { limb: aim } })
      // 実際の故障フラグを反映する (耳→聾, 目→盲目, 手首/腕→腕故障, 足首/脚→脚故障)
      if (aim === 'ear') target.health.deafened = true
      else if (aim === 'eye') target.health.blinded = true
      else if (aim === 'hand' || aim === 'arm') {
        target.health.injuryOnArm = true
        // 両手用武器を装備している最中に腕・手首が故障した場合, 片手では扱えなくなり, 追加で1ターンの引き戻しが必要になる
        if (target.attack.model.isTwoHanded) target.attack.ready += 1
      }
      else if (aim === 'foot' || aim === 'leg') {
        target.health.injuryOnLeg = true
        target.posture = 'prone' // 姿勢変更 (杖のような支えが無ければ立ち上がれなくなるため, 強制的に「這い」にする)
        results.push(...this.cancelCast(target)) // 転倒時と同様, 精神集中を無条件で解除する
      }
    }

    // それ以外 (頭・体・喉・肚) を狙った攻撃
    if (aim === 'head' || aim === 'body' || aim === 'neck' || aim === 'stomach') {
      // アンデッド・スライムは朦朧・気絶のいずれの状態にも陥らないが, 転倒はする (public/docs/04-04.md 「魔物」章参照)
      // その代わり, 負傷が累積して最大HPに達した時点で, 気絶・判定のいずれも経由せず自動的に死亡する (でなければ蓄積ダメージで打倒する手段が無くなるため)
      const isUndeadOrSlime = target.defense.creatureType === 'undead' || target.defense.creatureType === 'slime'

      // 朦朧状態・転倒判定 (気絶に至っていない場合のみ行う. 頭・喉狙いは急所のため, 最大HPの1/3以上でも対象になる)
      // アンデッド・スライムに対しては target.health.stunned への代入は Health.ts の stunned セッター側で無視されるため, 転倒判定自体はそのまま行ってよい
      if (!target.health.unconscious && (dmg >= target.health.maxHp / 2 || ((aim === 'head' || aim === 'neck') && dmg >= target.health.maxHp / 3))) {
        target.health.stunned = true
        const knockedDownJudge = judgeKnockedDown(target)
        results.push({ type: 'knockedDown', judge: knockedDownJudge })
        if (!knockedDownJudge.success) {
          target.posture = 'prone' // 姿勢変更
          results.push(...this.cancelCast(target)) // 維持判定を生き延びていても, 転倒時は無条件で解除する
        }
      }

      // 気絶・死亡判定 (負傷が最大HPに達し, 気絶している場合. アンデッド・スライムは気絶しないため, 代わりに負傷が最大HPに達している間は毎回この条件に該当する)
      if (isUndeadOrSlime ? target.health.injury >= target.health.maxHp : target.health.unconscious) {
        if (isUndeadOrSlime) {
          // アンデッド・スライムは判定を挟まず, 負傷が最大HPに達した時点で自動的に死亡する
          results.push({ type: 'fatal', judge: { roll: 0, success: false, critical: false } })
          target.health.dead = true // 死亡
        } else {
          const fatalJudge = judgeFatal(target)
          results.push({ type: 'fatal', judge: fatalJudge })
          if (!fatalJudge.success) {
            target.health.dead = true // 死亡
          }
        }
        return results // ダメージで気絶した (アンデッド・スライムの場合は負傷が最大HPに達した) 時はここで処理を止める
      }

      // 気絶判定 (頭狙いで, ダメージが最大HPの半分以上の場合のみ. 失敗すると即座に気絶する. アンデッド・スライムは気絶しないため対象外)
      if (!isUndeadOrSlime && aim === 'head' && dmg >= target.health.maxHp / 2) {
        const unconsciousJudge = judgeUnconscious(target, dmgType)
        if (!unconsciousJudge.success) {
          results.push({ type: 'unconscious', judge: unconsciousJudge })
          target.health.unconscious = true
        }
      }

      // 即死判定 (喉狙いで, ダメージが最大HPの半分以上の場合のみ. 失敗すると即座に死亡する. アンデッド・スライムは対象外)
      if (!isUndeadOrSlime && aim === 'neck' && dmg >= target.health.maxHp / 2) {
        const deadJudge = judgeDead(target, dmgType)
        if (!deadJudge.success) {
          results.push({ type: 'dead', judge: deadJudge })
          target.health.unconscious = true
          target.health.dead = true
        }
      }
    }

    return results
  }

  // 防御を試みるべきか (canDefend) を見た上で resolveDefenseAttempts に委譲する共通処理
  // (attackRoutine/spellDmgRoutine/spellTripRoutine/spellFlashRoutine の「防御を試みて, 成功していれば打ち切る」定型処理を集約する)
  // canDefend が false の場合は判定自体を行わず, 何も起きなかった結果を返す
  private tryDefend(
    target: Unit,
    canDefend: boolean,
    getDefenseJudges: () => Array<Omit<DefenseResult, 'ready'>>
  ): { results: ActionResult[], defended: boolean, criticalDefense: boolean, castCanceledResults: ActionResult[] } {
    if (!canDefend) return { results: [], defended: false, criticalDefense: false, castCanceledResults: [] }
    return this.resolveDefenseAttempts(target, getDefenseJudges())
  }

  // 防御判定結果配列を順に適用し, 実際の防御試行回数・武器準備状態への反映とログ用結果を生成する
  // 防御を1回でも試みた場合, 対象自身の準備・狙い・精神集中への副次的な影響も合わせて解決する (resolveDefenseInterrupts)
  // (精神集中の維持判定はここ (防御を試みた時点) で判定・状態反映まで行うが, ログ表示上の結果 (castCanceledResults) は
  // ダメージ判定の後に表示したいため, results には含めず呼び出し元へ別枠で返す. 呼び出し元は damage 判定の直後にこれを追加する)
  // 「盾」(金行術): 精神集中(金)が2ターン以上完了しており, かつ全力攻撃選択中でなければ (= canDodge が true なら),
  // 通常の防御試行回数 (blockCount/parryCount) とは別枠で, 術の技能値による「止め」相当の追加防御を最初に試みる
  // (成否を問わず発動時点で精神集中(金)はリセットされる. 成功すれば通常の防御判定は行わずそこで処理を止める)
  // criticalDefense: 成立した防御判定 (盾を含む) がクリティカル成功だったか否か (攻撃側の追加の引き戻し判定に用いる. 呼び出し元の責務とする)
  private resolveDefenseAttempts(target: Unit, defenseJudges: Array<Omit<DefenseResult, 'ready'>>): { results: ActionResult[], defended: boolean, criticalDefense: boolean, castCanceledResults: ActionResult[] } {
    const results: ActionResult[] = []
    let defended = false
    let criticalDefense = false
    let attempted = defenseJudges.length > 0
    let castCanceledResults: ActionResult[] = []

    if (target.spellCast.metal >= 2 && target.defense.canDodge) {
      const shieldJudge = judgeShieldBlock(target)
      target.spellCast.metal = 0
      attempted = true
      results.push({ type: 'shield', judge: { ...shieldJudge, target } })
      if (shieldJudge.success) {
        const interrupts = this.resolveDefenseInterrupts(target)
        results.push(...interrupts.results)
        return { results, defended: true, criticalDefense: shieldJudge.critical, castCanceledResults: interrupts.castCanceledResults }
      }
    }

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

      results.push({ type: 'defense', judge: { ...defenseJudge, ready, target } })
      if (defenseJudge.success) {
        defended = true
        criticalDefense = defenseJudge.critical
        break
      }
    }

    // 防御 (「盾」(金行術)・受け・止め・よけのいずれか) を1回でも試みたなら, 対象自身への副次的な影響を解決する (成否は問わない)
    if (attempted) {
      const interrupts = this.resolveDefenseInterrupts(target)
      results.push(...interrupts.results)
      castCanceledResults = interrupts.castCanceledResults
    }

    return { results, defended, criticalDefense, castCanceledResults }
  }

  // 防御を試みたことによる, 対象自身への副次的な影響を解決する
  // 準備: 準備中 (ready > 0) の射撃武器を持っている場合, 判定なしで常にそのターン分の準備が巻き戻る
  // 狙い:「狙い」由来の持ち越し (attack.feint.source === 'snipe') がある場合のみ, 判定なしで常に破棄される (「牽制」由来は対象外)
  // 精神集中: いずれかの系統に詠唱時間を蓄積中の場合のみ, 維持判定 (IN-4 もしくは 修養-2 相当) を行う. 失敗すれば集中が途絶える
  //           (結果は castCanceledResults として別枠で返す. ログとしての表示位置は呼び出し元がダメージ判定の後に配置する)
  private resolveDefenseInterrupts(target: Unit): { results: ActionResult[], castCanceledResults: ActionResult[] } {
    const results: ActionResult[] = []

    if (target.attack.ready > 0 && target.attack.model.isMissile) {
      target.attack.ready = Math.min(target.attack.ready + 1, target.attack.model.ready)
      results.push({ type: 'readyInterrupted', judge: { weaponName: target.attack.model.name } })
    }

    if (target.attack.feint?.source === 'snipe') {
      target.attack.feint = null
      results.push({ type: 'aimInterrupted', judge: { source: 'snipe' } })
    }

    const castCanceledResults = this.maintainCastOnDefense(target)

    return { results, castCanceledResults }
  }

  // 精神集中中に防御を試みたことによる維持判定 (継続中の系統がある場合のみ判定する)
  // 成功時は何も起こらない. 失敗時は cancelCast と同じ扱い (無条件解除・同じログ) にする
  private maintainCastOnDefense(target: Unit): ActionResult[] {
    const castingElement = SPELL_ELEMENTS.find(element => target.spellCast[element] > 0)
    if (!castingElement) return []
    const maintainJudge = judgeMaintainCast(target)
    if (maintainJudge.success) return []
    return this.cancelCast(target)
  }

  //「牽制」実行 (成功時, 次の自分の攻撃 (対象が同じ場合) まで防御目標値の低下効果を持ち越す)
  // isImmediate: true の場合 (全力攻撃オプション「牽制即攻撃」から呼ばれる), 同じ行動内で直後に続く攻撃から即座に適用する
  feint(target: Unit, isImmediate: boolean = false): ActionResult[] {
    const actor = this.state.actor
    const feintJudge = judgeFeint(actor, target, this.state.shootPenalty[actor.side])
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
  // MAX_SPELL_CAST (=3) 到達後も「集中」を継続できるが, 詠唱時間はそれ以上蓄積されない (これ以上習得済みの術が増えないため)
  cast(element: SpellElement): ActionResult[] {
    const actor = this.state.actor
    actor.spellCast[element] = Math.min(actor.spellCast[element] + 1, MAX_SPELL_CAST)
    SPELL_ELEMENTS.forEach(spellElement => {
      if (spellElement !== element) actor.spellCast[spellElement] = 0
    })
    const castJudge = judgeCast(actor, element)
    return castJudge ? [{ type: 'cast', judge: castJudge }] : []
  }

  //「法術」実行 (蓄積した詠唱時間を消費して発動する. 全ての系統の詠唱時間をリセットする)
  // 発動判定に成功した場合のみ, 術に対応する効果を target (自身 or 選択した対象) に適用する
  // dmg (直接ダメージ型)・trip (転倒効果) は防御判定以降の一連の結果を追加の ActionResult として返す
  // (buff/status/debuff は無条件/抵抗判定のみで完結するため, 従来通り SpellResult.effectResults に集約する)
  // spellType が 'range' (範囲呪文) の場合, 対象選択を経ないため target 引数は用いず, 発動時点の敵全員に対して個別に効果を解決する
  // 発動判定がファンブルだった場合, 術者自身がそのターンのみ幻惑状態に陥る
  // 「盾」「時間遡行」(spellType: 'defense') はこのメソッドを経由しない (自動反応として個別の判定関数で処理する) ため, 対象外となる
  spell(element: SpellElement, spellId: number, target: Unit): ActionResult[] {
    const actor = this.state.actor
    SPELL_ELEMENTS.forEach(spellElement => { actor.spellCast[spellElement] = 0 })
    const spellData = SPELL_LIST[element][spellId]
    const distanceMod = this.getSpellDistanceMod(spellData, target)
    const spellJudge = judgeSpell(actor, element, spellId, distanceMod)
    const effects = spellData.effects ?? []
    const effectResults: SpellEffectResult[] = []
    const extraResults: ActionResult[] = []

    if (!spellJudge.success && spellJudge.critical) {
      actor.statusEffects.dazed = 2 // そのターンはすぐ終了して回復してしまうため 2 とする
    }

    if (spellJudge.success) {
      if (spellData.spellType === 'range') {
        // 範囲呪文: 対象選択を経ず, 効果の性質に応じた対象集団 (dmg/flash: 敵全員 (dmg は randomTarget: true ならランダムに1体)/cleanse: 味方全員・術者自身を含む/debuffAll: 敵味方全員・術者自身を除く) に対し個別に効果を解決する
        effects.forEach(effect => {
          if (effect.kind === 'dmg') {
            const enemies = this.state.formation?.getEnemies() ?? []
            const rangeTargets = effect.randomTarget ? this.pickRandomTarget(enemies) : enemies
            rangeTargets.forEach(rangeTarget => extraResults.push(...this.spellDmgRoutine(rangeTarget, effect)))
          } else if (effect.kind === 'flash') {
            const rangeTargets = this.state.formation?.getEnemies() ?? []
            rangeTargets.forEach(rangeTarget => extraResults.push(...this.spellFlashRoutine(rangeTarget, effect)))
          } else if (effect.kind === 'cleanse') {
            const rangeTargets = this.state.formation?.getAllies() ?? []
            rangeTargets.forEach(rangeTarget => extraResults.push(...this.spellCleanseRoutine(rangeTarget)))
          } else if (effect.kind === 'debuffAll') {
            const allies = this.state.formation?.getAllies().filter(unit => unit !== actor) ?? []
            const enemies = this.state.formation?.getEnemies() ?? []
            const rangeTargets = [...allies, ...enemies]
            rangeTargets.forEach(rangeTarget => extraResults.push(...this.spellDebuffAllRoutine(rangeTarget, actor, effect)))
          }
        })
      } else {
        effects.forEach(effect => {
          if (effect.kind === 'dmg') {
            extraResults.push(...this.spellDmgRoutine(target, effect))
          } else if (effect.kind === 'trip') {
            extraResults.push(...this.spellTripRoutine(target, effect))
          } else if (effect.kind === 'heal') {
            extraResults.push(...this.spellHealRoutine(target, spellData.label, effect))
          } else if (effect.kind === 'shootPenalty') {
            // 「守りの風」: 対象を持たない持続効果. 術者と敵対する陣営 (自陣営には影響しない) にのみ適用され,
            // 一度発動すれば戦闘終了まで持続する (再発動しても変化なし)
            this.state.shootPenalty[actor.side === 'player' ? 'enemy' : 'player'] = true
            effectResults.push({ kind: 'shootPenalty' })
          } else if (effect.kind !== 'flash' && effect.kind !== 'cleanse' && effect.kind !== 'debuffAll') {
            effectResults.push(this.applySpellEffect(target, effect))
          }
        })
      }
    }

    return [{ type: 'spell', judge: { ...spellJudge, effectResults } }, ...extraResults]
  }

  // 術の発動判定 (judgeSpell) に課す, 距離による修正 (術者自身へのペナルティ) を返す
  // 射撃武器の distanceMod と同じ考え方 (対象の防御・抵抗判定側には一切影響しない). 詳細は Spells.ts 冒頭のコメント参照
  // spellType: 'range' (対象選択を経ず, 発動時点の敵全員, もしくは「瓦礫の雨」のようにランダムな1体に効果が及ぶ術) は,
  // 個々の対象の位置を発動判定の時点で一意に定められないため, dmg/flash 効果を持つものに限り位置によらず一律のペナルティとする
  // (「サイレン」(debuffAll)・「癒しの風」(cleanse) は距離の概念が当てはまらないため対象外 (0))
  // spellType: 'range' 以外は, target (UI で選択された対象, もしくは targetScope の無い術では暫定的に自身) が
  // 敵 (術者と別陣営) の場合のみ, その配置に応じたペナルティを課す (味方・自身が対象の場合は 0)
  private getSpellDistanceMod(spellData: Spell, target: Unit): number {
    const actor = this.state.actor
    const shootPenalty = this.state.shootPenalty[actor.side] // 術者自身の所属陣営が「守りの風」の影響下にあるか否か
    if (spellData.spellType === 'range') {
      const kind = spellData.effects?.[0]?.kind
      if (kind !== 'dmg' && kind !== 'flash') return 0
      return -2 * (shootPenalty ? 2 : 1)
    }
    if (target.side === actor.side) return 0
    const baseMod = target.position === 'back' ? -2 : -1
    return baseMod * (shootPenalty ? 2 : 1)
  }

  // 術の効果を1つ適用し, 結果を返す (buff/status/debuff/puppet のみを対象とする. dmg/trip は spellDmgRoutine/spellTripRoutine が個別に処理する)
  // buff: 無条件で適用する (発動判定自体は既に成功している)
  // status: 無条件で適用する (抵抗判定を伴わない StatusEffects への直接付与)
  // debuff: 対象自身の抵抗判定 (MRE, resistMod があれば加算した上で) に失敗した場合のみ適用する
  //         duration が 'margin' なら失敗度, 数値ならその値をそのままターン数とする
  // puppet: 無条件で適用する (発動判定自体は既に成功している. 対象のターンへの移行は Action.execute 側で行う)
  private applySpellEffect(target: Unit, effect: Extract<SpellEffect, { kind: 'buff' } | { kind: 'status' } | { kind: 'debuff' } | { kind: 'puppet' }>): SpellEffectResult {
    if (effect.kind === 'buff') {
      if (effect.target === 'level') target.statusBuff.addLevelBuff()
      else if (effect.target === 'dmg') target.statusBuff.addDmgBuff()
      else if (effect.target === 'ev') target.statusBuff.addEvBuff()
      else if (effect.target === 'dr') target.statusBuff.addDrBuff()
      return { kind: 'buff', target: effect.target }
    }

    if (effect.kind === 'status') {
      target.statusEffects[effect.target] = effect.duration
      return { kind: 'status', target: effect.target }
    }

    if (effect.kind === 'puppet') {
      target.health.puppeted = true
      return { kind: 'puppet', target }
    }

    // effect.kind === 'debuff'
    const resistJudge = judgeResist(target, effect.resistMod ?? 0)
    const applied = !resistJudge.success
    if (applied) {
      target.statusEffects[effect.target] = effect.duration === 'margin' ? -resistJudge.score : effect.duration
    }
    return { kind: 'debuff', target: effect.target, applied }
  }

  // 術の直接ダメージ型 (射撃呪文) 効果の判定・効果適用
  // 発動判定 (詠唱) は既に成功しているため, 通常の攻撃・射撃と異なり命中判定を経ず, 対象の防御判定から解決する
  private spellDmgRoutine(target: Unit, effect: Extract<SpellEffect, { kind: 'dmg' }>): ActionResult[] {
    const results: ActionResult[] = []
    const aim = effect.aim ?? 'body'
    const allowParry = effect.allowParry ?? true

    // 金属装備者へのペナルティ (「召雷」用. 対象部位の防具がSDR>2 (チェインメイル以上) なら金属製とみなす)
    // 該当する場合, 回避判定に一律-2, かつダメージ計算でDRを無視する
    const isMetal = effect.metalPenalty === true && target.defense.getModelByKey(AIM_OPTIONS[aim].group).sdr > 2
    const extraMod = isMetal ? -2 : 0

    // 対象がいかなる防御も行えない (自身が全力攻撃選択中など) 場合は防御判定自体をスキップする
    const canDefend = target.defense.getCanBlock(aim) || (allowParry && target.defense.canParry) || target.defense.canDodge
    const { results: defenseResults, defended, castCanceledResults } =
      this.tryDefend(target, canDefend, () => judgeSpellDefense(target, aim, allowParry, extraMod))
    results.push(...defenseResults)
    if (defended) {
      results.push(...castCanceledResults) // ダメージ判定が発生しない場合はここで表示する
      return results // 防御成功時はここで処理を止める
    }

    const dmgJudge = rollSpellDmg(effect.dice, effect.dmgType, aim, target, isMetal)
    const dmgResults = this.resolveDamage(dmgJudge, aim, effect.dmgType, target, castCanceledResults)
    results.push(...dmgResults)

    // 燃え上がり (dmgType: 3 (炎) の直接ダメージ型呪文専用. 「火球」「炎の嵐」「火の鳥」「焼殺」用. DRを引いたダメージが4点以上で火だるま状態になる. 水舞のDRバフ (水の鎧) を纏っている間は免れる)
    if (effect.dmgType === 3) {
      const appliedDmg = dmgResults.find(result => result.type === 'dmg')?.judge.roll ?? 0
      const hasWaterArmor = target.statusBuff.dr > 0
      if (appliedDmg >= 4 && !hasWaterArmor) {
        target.health.burning = true
      }
    }

    return results
  }

  // 術の転倒効果の判定・効果適用 (「アースハンド」用. ダメージは無く, 防御失敗時に転倒判定のみを行う)
  private spellTripRoutine(target: Unit, effect: Extract<SpellEffect, { kind: 'trip' }>): ActionResult[] {
    const results: ActionResult[] = []
    const aim = effect.aim ?? 'body'
    const allowParry = effect.allowParry ?? true

    const canDefend = target.defense.getCanBlock(aim) || (allowParry && target.defense.canParry) || target.defense.canDodge
    const { results: defenseResults, defended, castCanceledResults } =
      this.tryDefend(target, canDefend, () => judgeSpellDefense(target, aim, allowParry))
    results.push(...defenseResults)
    if (defended) {
      results.push(...castCanceledResults) // ダメージ判定に相当する箇所が無いため, ここで表示する
      return results // 防御成功時はここで処理を止める
    }

    const tripJudge = judgeTrip(target, effect.mod ?? 0)
    results.push({ type: 'trip', judge: tripJudge })
    // 防御を試みたことによる維持判定の結果は, ダメージ判定に相当する箇所が無いため, 転倒判定の直後に表示する
    results.push(...castCanceledResults)
    if (!tripJudge.success) {
      target.posture = 'prone' // 姿勢変更
      results.push(...this.cancelCast(target)) // 維持判定を生き延びていても, 転倒時は無条件で解除する
    }

    return results
  }

  // 精神集中の強制解除 (判定を伴わず無条件で解除する. 継続中の系統がなければ何もしない)
  // 呼び出し元: 転倒 (攻撃/アースハンド由来を問わず, 維持判定を生き延びていても転倒時は無条件で解除する), 維持判定失敗時 (maintainCastOnDefense)
  private cancelCast(target: Unit): ActionResult[] {
    const castingElement = SPELL_ELEMENTS.find(element => target.spellCast[element] > 0)
    if (!castingElement) return []
    target.spellCast[castingElement] = 0
    return [{ type: 'castCanceled', judge: { target, element: castingElement } }]
  }

  //「集中」「法術」以外のコマンドを実行した場合, 継続中の精神集中を破棄する
  // (「法術」は集中を消費して発動する行動そのものであり,「集中」との切替は cast() 側で扱うためどちらも対象外とする)
  // プレイヤー自身の選択による中断のため, ログは出さない (無条件でリセットするのみ)
  cancelCastByOtherAction(): void {
    SPELL_ELEMENTS.forEach(element => { this.state.actor.spellCast[element] = 0 })
  }

  // 術の範囲デバフ効果の判定・効果適用 (「閃光」用. 範囲呪文の対象1体分. dmg/trip と同じ回避判定を経て, 失敗時のみ次ターンの終わりまで命中/回避ペナルティを課す)
  // 精神集中中の対象は, 維持判定を避けるため, 防御判定自体を試みない.
  // 同様に, 射撃武器を準備中 (ready > 0) の対象・「狙い」を定めている (snipe 由来の持ち越しがある) 対象も,
  // 回避を試みると resolveDefenseInterrupts で準備・狙いが無条件に破棄されてしまうため, 防御判定自体を試みない
  private spellFlashRoutine(target: Unit, effect: Extract<SpellEffect, { kind: 'flash' }>): ActionResult[] {
    const results: ActionResult[] = []
    const aim = 'body' // 「閃光」に部位狙いの概念は無いため, 常に通常の防御目標値を用いる
    const allowParry = effect.allowParry ?? true
    const isCasting = SPELL_ELEMENTS.some(element => target.spellCast[element] > 0)
    const isPreparingShot = (target.attack.ready > 0 && target.attack.model.isMissile) || target.attack.feint?.source === 'snipe'

    const canDefend = !isCasting && !isPreparingShot && (target.defense.getCanBlock(aim) || (allowParry && target.defense.canParry) || target.defense.canDodge)
    const { results: defenseResults, defended, castCanceledResults } =
      this.tryDefend(target, canDefend, () => judgeSpellDefense(target, aim, allowParry))
    results.push(...defenseResults)
    if (defended) {
      results.push(...castCanceledResults) // ダメージ判定に相当する箇所が無いため, ここで表示する
      return results // 回避に成功すれば効果を免れる
    }

    // そのターン中 (対象自身の次ターン終了時まで) の命中/回避ペナルティを付与する (StatusEffects.flashed の減衰は Attack/Defense の各目標値取得側で参照する)
    target.statusEffects.flashed = 1
    const flashResult: FlashResult = { roll: 0, success: false, critical: false, target }
    results.push({ type: 'flash', judge: flashResult })
    // 防御を試みたことによる維持判定の結果は, ダメージ判定に相当する箇所が無いため, ここで表示する
    results.push(...castCanceledResults)

    return results
  }

  // 回復呪文の効果適用 (「杯」「生命の雫」用. 判定・抵抗は伴わず, 使用回数上限のみ確認する)
  // 対象・術ごとの使用回数 (CombatUnit.healUses, キーは術名) が maxUses に達している場合, 発動はしたが効果を得られない
  private spellHealRoutine(target: Unit, spellLabel: string, effect: Extract<SpellEffect, { kind: 'heal' }>): ActionResult[] {
    const usedCount = target.healUses[spellLabel] ?? 0
    if (usedCount >= effect.maxUses) {
      const healResult: HealResult = { target, applied: false, healedAmount: 0, curedStun: false, curedLimbInjury: false }
      return [{ type: 'heal', judge: healResult }]
    }
    target.healUses[spellLabel] = usedCount + 1

    // 負傷の軽減 (実際の負傷分をキャップとする. 気絶 (unconscious) 状態からの復帰は行わない)
    const healedAmount = effect.fraction ? Math.min(target.health.injury, Math.floor(target.health.maxHp * effect.fraction)) : 0
    if (healedAmount > 0) target.health.injury -= healedAmount

    const curedStun = effect.cureStun === true && target.health.stunned
    if (curedStun) target.health.stunned = false

    const curedLimbInjury = effect.cureLimbInjury === true && (target.health.injuryOnArm || target.health.injuryOnLeg)
    if (effect.cureLimbInjury) {
      target.health.injuryOnArm = false
      target.health.injuryOnLeg = false
    }

    const healResult: HealResult = { target, applied: true, healedAmount, curedStun, curedLimbInjury }
    return [{ type: 'heal', judge: healResult }]
  }

  // 候補群からランダムに1体を選んで配列で返す (「瓦礫の雨」用. 候補が0体なら空配列を返す (何も起きない))
  private pickRandomTarget(candidates: Unit[]): Unit[] {
    if (candidates.length === 0) return []
    return [candidates[Math.floor(Math.random() * candidates.length)]]
  }

  // 術の範囲浄化効果の判定・効果適用 (「癒しの風」用. 範囲呪文の対象1体分. 判定を伴わず無条件で朦朧・幻惑・狂戦士・恐慌状態を解除する)
  // 何も治癒しなかった場合は結果を生成しない (対象が多数になりうるため, ログの無意味な水増しを避ける)
  private spellCleanseRoutine(target: Unit): ActionResult[] {
    const curedStun = target.health.stunned
    const curedDazed = target.statusEffects.dazed > 0
    const curedBerserk = target.statusEffects.berserk > 0
    const curedFear = target.statusEffects.fear > 0
    if (!curedStun && !curedDazed && !curedBerserk && !curedFear) return []

    target.health.stunned = false
    target.statusEffects.dazed = 0
    target.statusEffects.berserk = 0
    target.statusEffects.fear = 0

    const cleanseResult: CleanseResult = { target, curedStun, curedDazed, curedBerserk, curedFear }
    return [{ type: 'cleanse', judge: cleanseResult }]
  }

  // 術の範囲デバフ効果の判定・効果適用 (「サイレン」用. 範囲呪文の対象1体分. 術者から見て敵か味方かで異なる修正の抵抗判定 (MRE) を行い, 失敗時のみ状態異常を付与する)
  // 抵抗成功時は結果を生成しない (対象が多数になりうるため, ログの無意味な水増しを避ける. flash/cleanse と同様の扱い)
  private spellDebuffAllRoutine(target: Unit, actor: Unit, effect: Extract<SpellEffect, { kind: 'debuffAll' }>): ActionResult[] {
    const isAlly = target.side === actor.side
    const mod = (isAlly ? effect.allyResistMod : effect.enemyResistMod) ?? 0
    const resistJudge = judgeResist(target, mod)
    if (resistJudge.success) return []

    target.statusEffects[effect.target] = effect.duration === 'margin' ? -resistJudge.score : effect.duration

    const debuffResult: DebuffAllResult = { ...resistJudge, target, statusTarget: effect.target }
    return [{ type: 'debuffAll', judge: debuffResult }]
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

  // 火だるま状態からの「消火」実行 (burning な状態のターン開始時に自動実行される. 判定は無く, 行動を消費して無条件に鎮火する)
  extinguish(): ActionResult[] {
    this.state.actor.health.burning = false
    return []
  }
}
