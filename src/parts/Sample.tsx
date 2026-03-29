// Sample.tsx

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import List from './Sample/List'
import Detail from './Sample/Detail'
import { SampleCharacter } from '../domains/Sample/Character'

function Sample() {
  // 状態管理
  const [points, setPoints] = useState(10)
  
  // サンプル生成関数
  const createSamples = (totalPoints = 10, size = 64) => {
    const step = 64 / size // 生成数に応じたステップ
    const samples = []
    for (let n = 0; n < size; n++) {
      const id = n + 1 // 1からカウント
      const generationKey = Math.floor(n * step)
      const sample = new SampleCharacter(id, generationKey, totalPoints)
      samples.push(sample)
    }
    return samples
  }
  
  // サンプル生成
  const samples = createSamples(points)

  // uid があれば1人のサンプルを探す
  const { uid } = useParams()
  const sample = samples.find(m => m.id === Number(uid))

  // 状態更新
  const updatePoints = (p: string) => {
    setPoints(Number(p))
  }

  return (
    <div className="px-6">
      <label>CP: </label>
      <select className="w-24 h-9 m-6 ps-3 rounded-md bg-white text-black text-center" onChange={(e) => updatePoints(e.target.value)}>
        <option value="10">{'10CP'}</option>
        <option value="12">{'12CP'}</option>
        <option value="16">{'16CP'}</option>
        <option value="24">{'24CP'}</option>
        <option value="40">{'40CP'}</option>
        <option value="64">{'64CP'}</option>
      </select>
      {!sample
        ? <List units={samples} />
        : (
          <>
            <Detail unit={sample} />
            <Link className="ms-12 italic" to="/sample/">&lt; Back to list</Link>
          </>
        )
      }
    </div>
  )
}

export default Sample
