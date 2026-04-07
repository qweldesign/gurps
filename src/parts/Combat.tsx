// Combat.tsx

import { useRef, useState, useEffect } from 'react'
import { CombatState as State } from '../domains/Combat/State'
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
      <p>In development...</p>
    </div>
  )
}

export default Combat
