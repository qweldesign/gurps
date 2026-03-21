import { type ReactNode, useRef, useState, useEffect } from 'react'
import Formation from './Combat/Formation'
import Action from './Combat/Action'
import Summary from './Combat/Summary'
import Timeline from './Combat/Timeline'
import { CombatState as State } from '../combat/State'
import { CombatLog as Log } from '../combat/Log'
import { createSamples } from '../domains/SampleCharacter'
import DevProgress from './DevProgress'
import { COMBAT_DEV_PROGRESS } from '../devProgress/combat'

function Combat() {
  // 仮の戦闘ユニットを用意
  const initModels = () => {
    const r1 = Math.floor(Math.random() * 16)
    const r2 = Math.floor(Math.random() * 15)
    const pcs = createSamples(10, 1, 4, r1)
    const npcs = createSamples(10, 1, 4, (r1 + r2) % 16, 4)
    const units = pcs.concat(npcs)
    return units.map(unit => unit.toCombatUnitModel(unit.id - 1)) // combatId は 0～7
  }

  // ターン管理
  const stateRef = useRef(new State(initModels()))
  const [turnIndex, setTurnIndex] = useState(0)
  
  // ログ管理
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const resolveQueue = useRef<(() => void)[]>([]) // ログ再生完了待ちを登録
  const [log, setLog] = useState<Log>(new Log(stateRef.current.actor))
  const [queue, setQueue] = useState<ReactNode[]>([]) // 未表示 (待機中)
  const [messages, setMessages] = useState<ReactNode[]>([]) // 表示済み

  // Action に渡すログ・ターン更新のための関数 
  const nextTurn = async (log: Log): Promise<void> => {
    // Promiseでログ再生完了を待つ
    return new Promise<void>(resolve => {
      // queueの配列末尾にログを積む
      setQueue(prev => [...prev, ...log.resultMessages])
      // resolveを登録
      resolveQueue.current.push(resolve)
    }).then(() => {
      // ログ再生完了後にターン進行
      stateRef.current.nextTurn(log)
      setTurnIndex(stateRef.current.turnIndex)
      // 新しいログを作成
      const newLog = new Log(stateRef.current.actor)
      setLog(newLog)
      setQueue(prev => [...prev, ...newLog.startMessages])
    })
  }

  // ログ再生 (queue → messages に流す)
  useEffect(() => {
    // 完了検知
    if (queue.length === 0) {
      const resolve = resolveQueue.current.shift()
      resolve?.()
      return
    }
    // ログ再生
    // 上方向にスクロール
    if (messages.length >= 10){
      timelineRef.current?.classList.add('is-scrolling')
    }
    const timer = setTimeout(() => {
      // queueの配列先頭をmessagesの配列末尾に移動 → 再生
      const [next, ...rest] = queue
      setMessages(prev => [...prev, next].slice(-10)) // 末尾10件のみ表示
      setQueue(rest)
      if (messages.length >= 10){
        timelineRef.current?.classList.remove('is-scrolling')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [queue])

  // ターン毎にデバッグ
  useEffect(() => {
    stateRef.current.debug()
  }, [turnIndex])

  // 開幕
  useEffect(() => {
    setQueue(prev => [...prev, ...log.startMessages])
  }, [])

  return (
    <>
      <div className="p-6">
        <p>In development...</p>
      </div>
      <div className="px-6">
        <div className="table-wrapper">
          <div className="row justify-center min-w-lg lg:min-w-5xl">
            <div id="formation" className="relative order-1 w-lg h-48 p-3 bg-white/15">
              <h3 className="m-0 border-0 text-sm">Formation</h3>
              <Formation store={stateRef.current.formationStore} />
            </div>
            <div id="summary" className="relative order-2 lg:order-3 w-lg h-96 p-3 bg-white/30">
              <h3 className="m-0 border-0 text-sm">Summary</h3>
              <Summary store={stateRef.current.summaryStore} />
            </div>
            <div id="action" className="relative order-3 lg:order-2 w-lg h-48 p-3 bg-white/15 lg:bg-white/30">
              <h3 className="m-0 border-0 text-sm">Action</h3>
              <Action store={stateRef.current.actionStore} log={log} nextTurn={nextTurn} />
            </div>
            <div id="log" className="relative order-4 w-lg h-96 bg-white/30 p-3 lg:bg-white/15">
              <h3 className="m-0 border-0 text-sm">Log</h3>
              <Timeline ref={timelineRef} messages={messages} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-24 px-6">
        <DevProgress progress={COMBAT_DEV_PROGRESS} />
      </div>
    </>
  )
}

export default Combat
