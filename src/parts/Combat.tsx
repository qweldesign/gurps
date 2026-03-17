import { useRef, useState, useEffect } from 'react'
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
      <div className="mt-24 px-6">
        <DevProgress progress={COMBAT_DEV_PROGRESS} />
      </div>
    </>
  )
}

export default Combat
