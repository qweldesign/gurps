// Combat.tsx

import { type ReactNode, useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Formation from './Combat/Formation'
import Action from './Combat/Action'
import Summary from './Combat/Summary'
import Timeline from './Combat/Timeline'
import { SampleCharacter } from '../domains/Sample/Character'
import { Character } from '../domains/Character'
import { SaveData } from '../domains/SaveData'
import { CombatState as State } from '../domains/Combat/State'
import type { CombatUnitModel } from '../domains/Combat/Unit'
import type { BattleDifficultyTier } from '../domains/Combat/Difficulty'
import { getEnemyFormation, getRankFromCp } from '../domains/Combat/Enemy'
import DevProgress from './DevProgress'
import { SPELLS_DEV_PROGRESS } from '../devProgress/spells'

type QueueItem = {
  node: ReactNode
  resolve?: () => void
}

const SLOT_SIZE = 4 // プレイヤー側の出撃人数 (Setup/Select と共通)
const DEFAULT_CP = 10 // ランダム生成時のデフォルトCP (プレイヤー側フォールバック用)
const NORMAL_CP_MULTIPLIER_MIN = 1 // Normal難度: 敵の生成CPの倍率下限 (プレイヤーCP比)
const NORMAL_CP_MULTIPLIER_MAX = 1.25 // Normal難度: 敵の生成CPの倍率上限 (プレイヤーCP比)
const NORMAL_REWARD_CP = 2 // Normal (および現状Normal相当にフォールバックしているHard) 勝利時の固定CP報酬
const NORMAL_REWARD_GOLD = 200 // Normal (および現状Normal相当にフォールバックしているHard) 勝利時の固定Gold報酬

function Combat() {
  // Setup/BattleDifficulty から navigate の state で渡された選択難度
  // (SaveData には永続化しないため, リロード等で state が失われた場合は undefined になる → Normal 相当にフォールバック)
  const location = useLocation()
  const navigate = useNavigate()
  const difficulty = (location.state as { difficulty?: BattleDifficultyTier } | null)?.difficulty

  // サンプル生成関数
  const createSamples = (totalPoints = 10, multiplier = 1, idMod = 0, keyMod = 0,size = 64) => {
    const step = 64 / size // 生成数に応じたステップ
    const samples = []
    for (let n = 0; n < size; n++) {
      const id = n + idMod + 1 // 1からカウント
      const generationKey = Math.floor(n * step) + keyMod
      const sample = new SampleCharacter(id, generationKey, totalPoints, multiplier)
      samples.push(sample)
    }
    return samples
  }

  // プレイヤー4人のユニットを用意する関数
  // Setup で選出された出撃メンバー (4名) があればそれを使用し, 無ければ従来通りサンプルにフォールバックする
  // usedRoster: セーブデータ上の実在キャラクターを使用したかどうか (フォールバック時は false)
  const initPlayerModels = (): { models: CombatUnitModel[], usedRoster: boolean } => {
    const saveData = new SaveData()
    const memberIds = saveData.loadBattleMembers()
    if (memberIds.length === SLOT_SIZE) {
      const characters = memberIds.map(id => new Character(saveData.loadModel(String(id).padStart(2, '0'))))
      // 除名等で id 0 (未設定) が混ざっていなければ, 選出メンバーとして採用
      if (characters.every(character => character.id !== 0)) {
        return { models: characters.map(character => character.combatUnitModel), usedRoster: true }
      }
    }
    // フォールバック: 従来通りのランダムサンプル
    // CP倍率は選択された初期CP (10/20/40) にあわせたセーブデータの値を使用する
    const r1 = Math.floor(Math.random() * 16)
    const models = createSamples(DEFAULT_CP, saveData.loadMultiplier(), 0, r1, 4).map(unit => unit.combatUnitModel)
    return { models, usedRoster: false }
  }

  // 敵4人のユニット (難度に応じて生成) と, その勝利報酬を用意する関数
  const initEnemyModels = (): { models: CombatUnitModel[], reward: { cp: number, gold: number } | null } => {
    const saveData = new SaveData()

    // Easy または難度未指定 (state 消失時のフォールバック) の場合: 
    // ゴブリン編成 (Rank はプレイヤー保有CPから算出). 報酬は編成ごとに定義された値を使用する
    if (!difficulty || difficulty === 'easy') {
      const rank = getRankFromCp(saveData.loadPoints())
      const formation = getEnemyFormation(rank)
      return { models: formation.models, reward: { cp: formation.rewardCp, gold: formation.rewardGold } }
    }

    // Normal, および Hard (敵データ未実装につき暫定でNormal相当にフォールバック) の場合:
    // 従来通りサンプル (人間) を生成する.
    // 生成CPは, プレイヤーの実際のCPの1.0〜1.25倍 (戦闘開始のたびにランダムに再抽選) とする.
    // 報酬は, CPは固定値 (2), Goldは200 * CP倍率 とする.
    //
    // 初期仲間 (ゲーム開始時に自動生成される仲間セット) の生成に使った乱数と重複すると,
    // 同じ顔ぶれの NPC が敵として出現してしまうため, それを避けて抽選する
    const excludedMod = saveData.loadInitialMod()
    let r2 = Math.floor(Math.random() * 16)
    while (r2 === excludedMod) {
      r2 = Math.floor(Math.random() * 16)
    }
    const cpMultiplier = NORMAL_CP_MULTIPLIER_MIN + Math.random() * (NORMAL_CP_MULTIPLIER_MAX - NORMAL_CP_MULTIPLIER_MIN)
    const enemyCp = Math.round(saveData.loadPoints() * cpMultiplier)
    // 能力値のスケーリング (CP倍率) は選択された初期CP (10/20/40) にあわせたセーブデータの値を使用する
    const models = createSamples(enemyCp, saveData.loadMultiplier(), 4, r2, 4).map(unit => unit.combatUnitModel)
    return { models, reward: { cp: NORMAL_REWARD_CP, gold: NORMAL_REWARD_GOLD * cpMultiplier } }
  }

  // プレイヤー4人と敵4人のユニットを結合し, 勝利報酬とあわせて返す関数
  const initModels = (): { models: CombatUnitModel[], reward: { cp: number, gold: number } | null, usedRoster: boolean } => {
    const playerResult = initPlayerModels()
    const enemyResult = initEnemyModels()
    return { models: playerResult.models.concat(enemyResult.models), reward: enemyResult.reward, usedRoster: playerResult.usedRoster }
  }

  // ターン管理
  const stateRef = useRef<State | null>(null)
  const [result, setResult] = useState<State['result']>(null) // 勝敗結果 (UI表示用. stateRef の変化は自動で再レンダリングされないため, ここに反映する)

  // 勝利報酬 (「開幕」useEffect で initModels() の戻り値から一度だけ設定する)
  // rewardRef: 付与処理 (useEffect) 用. reward: UI表示用 (result と同じく, ref変化は再レンダリングされないため state にも反映する)
  const rewardRef = useRef<{ cp: number, gold: number } | null>(null)
  const [reward, setReward] = useState<{ cp: number, gold: number } | null>(null)
  const usedRosterRef = useRef(false) // セーブデータ上の実在キャラクターで出撃したか (「開幕」useEffectで一度だけ設定)
  const rewardGrantedRef = useRef(false) // 付与処理の重複実行を防ぐガード
  const deadExpelledRef = useRef(false) // 除名処理の重複実行を防ぐガード

  // ログ管理
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([]) // 未表示 (待機中)
  const [messages, setMessages] = useState<ReactNode[]>([]) // 表示済み

  // ログを積む関数
  const enqueueLog = (nodes: ReactNode[]): Promise<void> => {
    return new Promise(resolve => {
      setQueue(prev => {
        const items: QueueItem[] = nodes.map((node, i) => ({
          node,
          resolve: i === nodes.length - 1 ? resolve : undefined
        }))
        return [...prev, ...items]
      })
    })
  }

  // State 経由で Action に渡すログ再生関数
  const playLog = async (): Promise<void> => {
    if (!stateRef.current) return
    // ログの末尾を再生
    const log = stateRef.current.logs[0]
    const messages = log.messages[log.messages.length - 1]
    await enqueueLog(messages)
    // 勝敗が決していれば, UI 側 (Action 表示の切り替え) にも反映する
    if (stateRef.current.result) {
      setResult(stateRef.current.result)
    }
  }

  // ログ再生
  useEffect(() => {
    // queueに新しいメッセージが無ければ, 処理をスキップ
    if (queue.length === 0) return

    // スクロールアニメーションクラスを付与
    if (messages.length >= 10) {
      timelineRef.current?.classList.add('is-scrolling')
    }

    // ログを再生 (queue → messages に流す)
    const timer = setTimeout(() => {
      const [next, ...rest] = queue
      setMessages(prev => [...prev, next.node].slice(-10)) // 末尾10件のみ表示
      setQueue(rest)
      // 最後の要素で resolve
      if (next.resolve) {
        next.resolve()
      }
      // スクロールアニメーションクラスを奪取
      if (messages.length >= 10) {
        timelineRef.current?.classList.remove('is-scrolling')
        // 除去を即座にレイアウトへ反映させる (再フローの強制)
        // トランジションが正しく開始させるための処置
        void timelineRef.current?.offsetHeight
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [queue])

  // 開幕
  useEffect(() => {
    if (!stateRef.current) {
      const { models, reward: battleReward, usedRoster } = initModels()
      stateRef.current = new State(models, playLog, difficulty)
      stateRef.current.nextTurn()
      // 勝利報酬を記録 (rewardRef: 付与処理用, reward state: UI表示用)
      rewardRef.current = battleReward
      if (battleReward) {
        setReward(battleReward)
      }
      // 除名処理 (死亡した味方の除名) の対象可否を記録
      usedRosterRef.current = usedRoster
    }
  }, [])

  // 勝利報酬の付与 (勝敗が決した瞬間に一度だけ. 敗北時は何も付与しない)
  // (フォールバックのサンプルで戦闘した場合も何も付与しない)
  useEffect(() => {
    if (result === 'win' && !rewardGrantedRef.current && rewardRef.current && usedRosterRef.current) {
      rewardGrantedRef.current = true
      const saveData = new SaveData()
      saveData.savePoints(saveData.loadPoints() + rewardRef.current.cp)
      saveData.saveGold(saveData.loadGold() + rewardRef.current.gold)
    }
  }, [result])

  // 死亡した味方の除名 (勝利が決した瞬間に一度だけ. 敗北時は「やり直し」に相当するため何もしない.
  // セーブデータの出撃メンバーを使わなかった (フォールバックのサンプルで戦闘した) 場合は,
  // サンプルの id がセーブデータ上の実在キャラクターの id と偶然一致することがあるため, 除名処理自体を行わない)
  // id が大きい順に処理する (removeModel は除名対象より大きい id を1つずつ詰めるため, 小さい方から処理すると後続の除名対象の id がずれてしまう)
  useEffect(() => {
    if (result === 'win' && !deadExpelledRef.current && stateRef.current && usedRosterRef.current) {
      deadExpelledRef.current = true
      const saveData = new SaveData()
      const deadMemberIds = stateRef.current.units
        .filter(unit => unit.side === 'player' && unit.health.dead)
        .map(unit => unit.id)
        .sort((a, b) => b - a)
      deadMemberIds.forEach(id => {
        saveData.removeModel(String(id).padStart(2, '0'))
      })
    }
  }, [result])

  return (
    <>
      <div className="p-6">
        <div className="table-wrapper">
          {stateRef.current && (
            <div className="row justify-center min-w-lg lg:min-w-5xl">
              <div id="formation" className="relative order-1 w-lg h-48 p-3 bg-white/15">
                <h3 className="m-0 border-0 font-serif text-sm">Formation</h3>
                {stateRef.current.formation && (
                  <Formation store={stateRef.current.formation} />
                )}
              </div>
              <div id="summary" className="relative order-2 lg:order-3 w-lg h-96 p-3 bg-white/30">
                <h3 className="m-0 border-0 font-serif text-sm">Summary</h3>
                <Summary state={stateRef.current} />
              </div>
              <div id="action" className="relative order-3 lg:order-2 w-lg h-48 p-3 bg-white/15 lg:bg-white/30">
                <h3 className="m-0 border-0 font-serif text-sm">Action</h3>
                {result ? (
                  <div className="my-12 text-center">
                    <p className="font-serif text-2xl">{result === 'win' ? '勝利!!' : '敗北...'}</p>
                    {result === 'win' && reward && (
                      <p className="mt-3 text-sm">CP +{reward.cp} / 軍資金 +{reward.gold}金</p>
                    )}
                    <button className="mt-6 w-48 h-12" onClick={() => navigate('/setup/')}>編成に戻る</button>
                  </div>
                ) : (
                  // enemy (AI操作) のターン中はコマンドパレットを表示しない (誤操作防止)
                  // 「傀儡」中は, 対象が敵であっても術者 (player) 側が操作するため対象外とする
                  stateRef.current.action && (stateRef.current.puppetTarget || stateRef.current.actor.side === 'player') && (
                    <Action store={stateRef.current.action} />
                  )
                )}
              </div>
              <div id="log" className="relative order-4 w-lg h-96 bg-white/30 p-3 lg:bg-white/15">
                <h3 className="m-0 border-0 font-serif text-sm">Log</h3>
                <Timeline ref={timelineRef} messages={messages} />
              </div>
            </div> 
          )}
        </div>
      </div>
      <div className="mt-24 px-6">
        <DevProgress tasks={SPELLS_DEV_PROGRESS} />
      </div>
    </>
  )
}

export default Combat
