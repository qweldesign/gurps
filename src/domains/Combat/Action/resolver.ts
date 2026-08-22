// Combat/Action/resolver.ts

import { type CombatUnit as Unit } from '../Unit'
import { judge, roll, score, type Judge, type Score } from '../Dice'
import { AIM_OPTIONS, type Aim, type FullPower, type AttackResult, type DefenseResult, type DmgResult, type FeintResult, type SpellResult } from './types'
import { SPELL_LIST, type SpellElement } from '../Spells'

// 攻撃の判定結果を返す (武器の準備状態の更新は effects 側の責務とする. ここでは判定のみ行う)
// foggy: 「濃霧」発生中か否か (射撃武器の距離による修正が倍になる)
export function judgeAttack(actor: Unit, aim: Aim, fullPower: FullPower, target: Unit, foggy: boolean = false): Omit<AttackResult, 'ready'> {
  const attackTarget = actor.attack.getTarget(aim, fullPower, target, foggy)
  return { aim, fullPower, ...judge(attackTarget) }
}

// 防御の判定結果を配列で返す
// 「止め」「受け」「よけ」の優先順で防御を試みる. いずれかが成功すればそこで終了する
// 全力防御選択中は, 最初の防御に失敗しても, 残り試行回数の範囲で別の防御方法を続けて試みる
// actor が target に対して牽制を成功させている場合, 防御目標値から牽制の成功度分を減算する
// (この減算は getBlockTarget/getParryTarget/getDodgeTarget 側で行われる)
// (武器の準備状態の更新は effects 側の責務とする. ここでは判定のみ行う)
export function judgeDefense(actor: Unit, aim: Aim, target: Unit): Array<Omit<DefenseResult, 'ready'>> {
  const defense = target.defense
  const maxAttempts = defense.isFullDefense ? 2 : 1
  const results: Array<Omit<DefenseResult, 'ready'>> = []

  if (defense.getCanBlock(aim)) {
    const blockResult = { defenseType: 'block' as const, ...judge(defense.getBlockTarget(actor)) }
    results.push(blockResult)
    if (blockResult.success) return results
  }
  if (defense.canParry && results.length < maxAttempts) {
    const parryResult = { defenseType: 'parry' as const, ...judge(defense.getParryTarget(actor)) }
    results.push(parryResult)
    if (parryResult.success) return results
  }
  if (results.length < maxAttempts) {
    const dodgeResult = { defenseType: 'dodge' as const, ...judge(defense.getDodgeTarget(actor)) }
    results.push(dodgeResult)
  }
  return results
}

// ダメージの判定結果を返す
// 喉・肚狙いは急所への一撃となるため, 貫通ダメージの倍率がさらに上がる
export function rollDmg(actor: Unit, aim: Aim, fullPower: FullPower, target: Unit): DmgResult {
  const attack = actor.attack.model
  const dr = target.defense.getDR(AIM_OPTIONS[aim].group, attack.dmgType)
  let count = attack.dmgDice
  count -= fullPower === 'dmg' ? 1 : 0 // 全力攻撃オプション「ダメージ安定」
  let mod = attack.dmgMod - dr + actor.statusBuff.dmg // 攻撃UPバフ (ベルセルク)
  mod += fullPower === 'dmg' ? 6 : 0 // 全力攻撃オプション「ダメージ安定」
  const rate = aim === 'neck' || aim === 'stomach'
    ? (attack.dmgType === 0 ? 1.5 : attack.dmgType === 1 ? 2 : 3)
    : (attack.dmgType === 0 ? 1 : attack.dmgType === 1 ? 1.5 : 2)
  const rolled = Math.floor(roll(count, mod).roll * rate)
  return { roll: rolled, success: rolled > 0, critical: rolled >= 10 }
}

// 術 (直接ダメージ型/転倒効果) に対する防御判定を配列で返す
// 「射撃の解決のように」対象が「受け」-4/「止め」-2/「よけ」のいずれかで回避判定を行う (judgeDefense と同じ優先順で解決する)
// allowParry: false の場合,「受け」を選択肢から除外する (足首を狙う「茨の呪縛」「アースハンド」など)
// extraMod: いずれの防御方法にも一律で加算する追加修正 (例: 「召雷」の金属装備者に対する -2)
// 牽制の持ち越しは考慮しない (術者側の武器による牽制とは無関係のため)
export function judgeSpellDefense(target: Unit, aim: Aim, allowParry: boolean = true, extraMod: number = 0): Array<Omit<DefenseResult, 'ready'>> {
  const defense = target.defense
  const maxAttempts = defense.isFullDefense ? 2 : 1
  const results: Array<Omit<DefenseResult, 'ready'>> = []

  if (defense.getCanBlock(aim)) {
    const blockResult = { defenseType: 'block' as const, ...judge(defense.blockTarget - 2 + extraMod) }
    results.push(blockResult)
    if (blockResult.success) return results
  }
  if (allowParry && defense.canParry && results.length < maxAttempts) {
    const parryResult = { defenseType: 'parry' as const, ...judge(defense.parryTarget - 4 + extraMod) }
    results.push(parryResult)
    if (parryResult.success) return results
  }
  if (results.length < maxAttempts) {
    const dodgeResult = { defenseType: 'dodge' as const, ...judge(defense.dodgeTarget + extraMod) }
    results.push(dodgeResult)
  }
  return results
}

// 「盾」(金行術, spellType: 'defense') の発動判定を返す
// 通常の「止め」と異なり盾 (装備) を用いず, 術の技能値そのもので判定する (修正は一切かからない)
export function judgeShieldBlock(target: Unit): Judge {
  return judge(target.spells.metal)
}

// 「時間遡行」(水行術, spellType: 'defense') の発動判定を返す
// 盾と同様, 術の技能値そのもので判定する (修正は一切かからない)
export function judgeTimeRegression(caster: Unit): Judge {
  return judge(caster.spells.water)
}

// 術の直接ダメージ型 (射撃呪文) の判定結果を返す
// 武器ではなく術のダイス数・ダメージ型を用いる点のみ rollDmg と異なる (DR減算・部位狙いによる急所倍率は同様に考慮する)
// ignoreDR: true の場合, DRを無視する (例: 「召雷」の金属防具)
export function rollSpellDmg(dice: number, dmgType: number, aim: Aim, target: Unit, ignoreDR: boolean = false): DmgResult {
  const dr = ignoreDR ? 0 : target.defense.getDR(AIM_OPTIONS[aim].group, dmgType)
  const mod = -dr
  const rate = aim === 'neck' || aim === 'stomach'
    ? (dmgType === 0 ? 1.5 : dmgType === 1 ? 2 : 3)
    : (dmgType === 0 ? 1 : dmgType === 1 ? 1.5 : 2)
  const rolled = Math.floor(roll(dice, mod).roll * rate)
  return { roll: rolled, success: rolled > 0, critical: rolled >= 10 }
}

// 術による転倒判定を返す (「アースハンド」用. mod は術による追加修正 (HT(生命力)-2 なら -2). 成功: 転倒を免れる, 失敗: 転倒する)
export function judgeTrip(target: Unit, mod: number = 0): Judge {
  return judge(target.defense.pre + mod)
}

// 牽制・狙いの判定結果を返す (成功度がそのまま target の次の防御目標値へのペナルティになる)
// 射撃武器の場合, target の姿勢・距離による修正を含める (近接武器の場合は影響なし)
// foggy: 「濃霧」発生中か否か (射撃武器の距離による修正が倍になる)
export function judgeFeint(actor: Unit, target: Unit, foggy: boolean = false): FeintResult {
  return { target, ...score(actor.attack.getTarget('body', 'none', target, foggy)) }
}

// 「集中」の判定結果を返す (聾または沈黙状態の場合のみ判定を要する. それ以外は判定不要 (無条件で詠唱時間が進む) につき null を返す)
export function judgeCast(actor: Unit, element: SpellElement): Judge | null {
  if (!actor.health.deafened && !actor.statusEffects.silence) return null
  return judge(actor.spells[element] - 6)
}

// 「法術」の判定結果を返す (発動する術の名称を含む. 効果の適用結果は effects.ts 側で埋める)
export function judgeSpell(actor: Unit, element: SpellElement, spellId: number): Omit<SpellResult, 'effectResults'> {
  const spell = SPELL_LIST[element][spellId].label
  return { spell, ...judge(actor.spells[element]) }
}

// 術のデバフ効果に対する抵抗判定を返す (対象自身の精神抵抗値 (MRE) を用いる. 成功度がそのまま失敗度ターン数の元になる)
// mod: 術によっては抵抗判定に修正がかかる (例: 「痛覚鈍麻」「金貨」の -2. 未指定は 0)
export function judgeResist(target: Unit, mod: number = 0): Score {
  return score(target.defense.mre + mod)
}

// 朦朧状態からの回復判定を返す (成功: 回復, 失敗: 朦朧状態の継続)
export function judgeRecovery(actor: Unit): Judge {
  return judge(actor.defense.pre)
}

// 精神集中中に防御を試みた場合の維持判定を返す (成功: 精神集中を維持する, 失敗: 精神集中が途絶える)
// mre (精神抵抗値) -2 で判定
export function judgeMaintainCast(target: Unit): Judge {
  return judge(target.defense.mre - 2)
}

// 朦朧状態からの回復判定を返す (成功: 朦朧のみ, 失敗: 転倒)
export function judgeKnockedDown(target: Unit): Judge {
  return judge(target.defense.pre)
}

// 気絶からの生存判定を返す (成功: 気絶のみ, 失敗: 死亡)
export function judgeFatal(target: Unit): Judge {
  return judge(target.defense.pre)
}

// 気絶判定を返す (頭狙いで, ダメージが最大HPの半分以上の場合のみ行う. 失敗で気絶する)
// 攻撃型が「叩」の場合, さらに気絶しやすくなる
export function judgeUnconscious(target: Unit, dmgType: number): Judge {
  const mod = dmgType === 0 ? -2 : 0
  return judge(target.defense.pre + mod)
}

// 即死判定を返す (喉狙いで, ダメージが最大HPの半分以上の場合のみ行う. 失敗で即死する)
// 攻撃型が「切」「刺」の場合, さらに即死しやすくなる
export function judgeDead(target: Unit, dmgType: number): Judge {
  const mod = dmgType > 0 ? -2 : 0
  return judge(target.defense.pre + mod)
}
