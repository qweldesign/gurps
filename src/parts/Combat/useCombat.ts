// Combat/useCombat.ts

import { type ReactNode, useRef, useState, useEffect } from 'react'
import { CombatState as State } from '../../domains/Combat/State'
import type { CombatUnitModel } from '../../domains/Combat/Unit'
import type { BattleDifficultyTier } from '../../domains/Combat/Difficulty'
import { getPlayerBattleSetup } from '../../domains/Combat/Player'
import { getEnemyBattleSetup } from '../../domains/Combat/Enemy'
import { SaveData } from '../../domains/SaveData'

type QueueItem = {
  node: ReactNode
  resolve?: () => void
}

// プレイヤー4人と敵4人のユニットを結合し, 勝利報酬とあわせて返す関数
function initModels(difficulty: BattleDifficultyTier | undefined): { models: CombatUnitModel[], reward: { cp: number, gold: number } | null, usedRoster: boolean } {
  const saveData = new SaveData()
  const playerResult = getPlayerBattleSetup(saveData)
  const enemyResult = getEnemyBattleSetup(difficulty, saveData)
  return { models: playerResult.models.concat(enemyResult.models), reward: enemyResult.reward, usedRoster: playerResult.usedRoster }
}

// ターン進行・ログ再生 (タイムライン表示) の状態管理を司るフック
// Combat.tsx から抽出したもので, JSX の描画には関与しない (Combat.tsx 側は表示に専念する)
export function useCombat(difficulty: BattleDifficultyTier | undefined) {
  // ターン管理
  const stateRef = useRef<State | null>(null)
  const [result, setResult] = useState<State['result']>(null) // 勝敗結果 (UI表示用. stateRef の変化は自動で再レンダリングされないため, ここに反映する)

  // 勝利報酬 (「開幕」useEffect で initModels() の戻り値から一度だけ設定する)
  // rewardRef: 付与処理 (useEffect) 用. reward: UI表示用 (result と同じく, ref変化は再レンダリングされないため state にも反映する)
  const rewardRef = useRef<{ cp: number, gold: number } | null>(null)
  const [reward, setReward] = useState<{ cp: number, gold: number } | null>(null)
  // セーブデータ上の実在キャラクターで出撃したか (「開幕」useEffectで一度だけ設定)
  // usedRosterRef: 除名・報酬付与処理 (useEffect) 用. usedRoster: UI表示用 (ref変化は再レンダリングされないため state にも反映する)
  const usedRosterRef = useRef(false)
  const [usedRoster, setUsedRoster] = useState(false)
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
    const logMessages = log.messages[log.messages.length - 1]
    await enqueueLog(logMessages)
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
      const { models, reward: battleReward, usedRoster: battleUsedRoster } = initModels(difficulty)
      stateRef.current = new State(models, playLog, difficulty)
      stateRef.current.nextTurn()
      // 勝利報酬を記録 (rewardRef: 付与処理用, reward state: UI表示用)
      rewardRef.current = battleReward
      if (battleReward) {
        setReward(battleReward)
      }
      // 除名処理 (死亡した味方の除名) の対象可否を記録 (usedRosterRef: 除名・報酬付与処理用, usedRoster state: UI表示用)
      usedRosterRef.current = battleUsedRoster
      setUsedRoster(battleUsedRoster)
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

  return { state: stateRef.current, result, reward, usedRoster, messages, timelineRef }
}
