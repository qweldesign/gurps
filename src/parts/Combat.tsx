import { useRef, useState, useEffect } from 'react'
import Formation from './Combat/Formation'
import Action from './Combat/Action'
import Summary from './Combat/Summary'
import Log from './Combat/Log'
import { CombatCore as Core } from '../combat/Core'
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

  // 状態管理
  const coreRef = useRef(new Core(initModels()))
  const [turnIndex, setTurnIndex] = useState(0)

  // 状態更新
  const nextTurn = () => {
    coreRef.current.nextTurn()
    setTurnIndex(coreRef.current.turnIndex)
  }

  // ターン毎にデバッグ
  useEffect(() => {
    coreRef.current.debug()
  }, [turnIndex])

  return (
    <>
      <div className="p-6">
        <p>In development...</p>
      </div>
      <div className="px-6">
        <div className="table-wrapper">
          <div className="row justify-center min-w-lg lg:min-w-5xl">
            <div id="formation" className="order-1 w-lg h-48 p-3 bg-white/15">
              <h3 className="m-0 border-0 text-sm">Formation</h3>
              <Formation store={coreRef.current.formationStore} />
            </div>
            <div id="summary" className="order-2 lg:order-3 w-lg h-96 p-3 bg-white/30">
              <h3 className="m-0 border-0 text-sm">Summary</h3>
              <Summary />
            </div>
            <div id="action" className="order-3 lg:order-2 w-lg h-48 p-3 bg-white/15 lg:bg-white/30">
              <h3 className="m-0 border-0 text-sm">Action</h3>
              <Action store={coreRef.current.actionStore} nextTurn={nextTurn} />
            </div>
            <div id="log" className="order-4 w-lg h-96 bg-white/30 p-3 lg:bg-white/15">
              <h3 className="m-0 border-0 text-sm">Log</h3>
              <Log />
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
