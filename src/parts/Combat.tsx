// Combat.tsx

import { useRef, useState, useEffect } from 'react'
import { CombatState as State } from '../domains/Combat/State'
import Formation from './Combat/Formation'
import Action from './Combat/Action'
import Summary from './Combat/Summary'
import Timeline from './Combat/Timeline'
import { SampleCharacter } from '../domains/Sample/Character'

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
  const [turnIndex, setTurnIndex] = useState(0)

  // ターン更新
  const nextTurn = () => {
    if (!stateRef.current) return
    stateRef.current.nextTurn()
    setTurnIndex(stateRef.current.turnIndex)
  }

  // 開幕
  useEffect(() => {
    if (!stateRef.current) {
      stateRef.current = new State(initModels())
      nextTurn()
    }
  }, [])
  
  // ターン毎にデバッグ
  useEffect(() => {
    if (!stateRef.current) return
    stateRef.current.debug()
  }, [turnIndex])

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
              <Action />
            </div>
            <div id="log" className="relative order-4 w-lg h-96 bg-white/30 p-3 lg:bg-white/15">
              <h3 className="m-0 border-0 font-serif text-sm">Log</h3>
              <Timeline />
            </div>
          </div> 
        )}
      </div>
    </div>
  )
}

export default Combat
