// Combat.tsx

import { type ReactNode, useRef, useState, useEffect } from 'react'
import Formation from './Combat/Formation'
import Action from './Combat/Action'
import Summary from './Combat/Summary'
import Timeline from './Combat/Timeline'
import { SampleCharacter } from '../domains/Sample/Character'
import { Character } from '../domains/Character'
import { SaveData } from '../domains/SaveData'
import { CombatState as State } from '../domains/Combat/State'
import DevProgress from './DevProgress'
import { SPELLS_DEV_PROGRESS } from '../devProgress/spells'

type QueueItem = {
  node: ReactNode
  resolve?: () => void
}

const SLOT_SIZE = 4 // プレイヤー側の出撃人数 (Setup/Select と共通)

function Combat() {
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
  const initPlayerModels = () => {
    const saveData = new SaveData()
    const memberIds = saveData.loadBattleMembers()
    if (memberIds.length === SLOT_SIZE) {
      const characters = memberIds.map(id => new Character(saveData.loadModel(String(id).padStart(2, '0'))))
      // 除名等で id 0 (未設定) が混ざっていなければ, 選出メンバーとして採用
      if (characters.every(character => character.id !== 0)) {
        return characters.map(character => character.combatUnitModel)
      }
    }
    // フォールバック: 従来通りのランダムサンプル
    const r1 = Math.floor(Math.random() * 16)
    return createSamples(24, 1, 0, r1, 4).map(unit => unit.combatUnitModel)
  }

  // 仮の戦闘ユニットを用意する関数 (敵側は引き続きランダム生成)
  const initModels = () => {
    const r2 = Math.floor(Math.random() * 16)
    const npcs = createSamples(24, 1, 4, r2, 4)
    return initPlayerModels().concat(npcs.map(unit => unit.combatUnitModel))
  }

  // ターン管理
  const stateRef = useRef<State | null>(null)
  const [result, setResult] = useState<State['result']>(null) // 勝敗結果 (UI表示用. stateRef の変化は自動で再レンダリングされないため, ここに反映する)

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
      stateRef.current = new State(initModels(), playLog)
      stateRef.current.nextTurn()
    }
  }, [])

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
                  <p className="my-12 text-center font-serif text-2xl">{result === 'win' ? '勝利!!' : '敗北...'}</p>
                ) : (
                  stateRef.current.action && (
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
