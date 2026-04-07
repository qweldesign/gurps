// Combat.tsx

import { type ReactNode, useRef, useState, useEffect } from 'react'
import Formation from './Combat/Formation'
import Action from './Combat/Action'
import Summary from './Combat/Summary'
import Timeline from './Combat/Timeline'
import { SampleCharacter } from '../domains/Sample/Character'
import { CombatState as State } from '../domains/Combat/State'

type QueueItem = {
  node: ReactNode
  resolve?: () => void
}

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

  // 仮の戦闘ユニットを用意する関数
  const initModels = () => {
    const r1 = Math.floor(Math.random() * 16)
    const r2 = Math.ceil(Math.random() * 15)
    const pcs = createSamples(10, 1, 0, r1, 4)
    const npcs = createSamples(10, 1, 4, (r1 + r2) % 16, 4)
    const units = pcs.concat(npcs)
    return units.map(unit => unit.combatUnitModel)
  }

  // ターン管理
  const stateRef = useRef<State | null>(null)

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

  // State 経由で ActionStore に渡すログ再生関数
  const playLog = async (): Promise<void> => {
    if (!stateRef.current) return
    // ログの末尾を再生
    const log = stateRef.current.logs[0]
    const messages = log.messages[log.messages.length - 1]
    await enqueueLog(messages)
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
    <div className="p-6">
      <div className="table-wrapper">
        {stateRef.current && (
          <div className="row justify-center min-w-lg lg:min-w-5xl">
            <div id="formation" className="relative order-1 w-lg h-48 p-3 bg-white/15">
              <h3 className="m-0 border-0 font-serif text-sm">Formation</h3>
              {stateRef.current.formationStore && (
                <Formation store={stateRef.current.formationStore} />
              )}
            </div>
            <div id="summary" className="relative order-2 lg:order-3 w-lg h-96 p-3 bg-white/30">
              <h3 className="m-0 border-0 font-serif text-sm">Summary</h3>
              <Summary state={stateRef.current} />
            </div>
            <div id="action" className="relative order-3 lg:order-2 w-lg h-48 p-3 bg-white/15 lg:bg-white/30">
              <h3 className="m-0 border-0 font-serif text-sm">Action</h3>
              {stateRef.current.actionStore && (
                <Action store={stateRef.current.actionStore} />
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
  )
}

export default Combat
