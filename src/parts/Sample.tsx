// Sample.tsx

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import List from './Sample/List'
import Detail from './Sample/Detail'
import { SampleCharacter } from '../domains/Sample/Character'

function Sample() {
  // 状態管理
  const [points, setPoints] = useState(10)
  const [multiplier, setMultiplier] = useState(1)
  
  // サンプル生成関数
  const createSamples = (totalPoints = 10, multiplier = 1, size = 64) => {
    const step = 64 / size // 生成数に応じたステップ
    const samples = []
    for (let n = 0; n < size; n++) {
      const id = n + 1 // 1からカウント
      const generationKey = Math.floor(n * step)
      const sample = new SampleCharacter(id, generationKey, totalPoints, multiplier)
      samples.push(sample)
    }
    return samples
  }
  
  // サンプル生成
  const samples = createSamples(points, multiplier)

  // uid があれば1人のサンプルを探す
  const { uid } = useParams()
  const sample = samples.find(m => m.id === Number(uid))

  // 状態更新
  const updatePoints = (value: string) => {
    const [p, m] = value.split('/')
    setPoints(Number(p))
    setMultiplier(Number(m))
  }

  return (
    <div className="px-6">
      <label>CP: </label>
      <select className="w-48 h-9 m-6 ps-3 rounded-md bg-white text-black" onChange={(e) => updatePoints(e.target.value)}>
        <option value="10/1">{'10CP'}</option>
        <option value="12/1">{'12CP'}</option>
        <option value="16/1">{'16CP'}</option>
        <option value="24/1">{'24CP'}</option>
        <option value="40/1">{'40CP'}</option>
        <option value="64/1">{'64CP'}</option>
        <option value="20/2">{'20CP (初期20CP)'}</option>
        <option value="24/2">{'24CP (初期20CP)'}</option>
        <option value="32/2">{'32CP (初期20CP)'}</option>
        <option value="48/2">{'48CP (初期20CP)'}</option>
        <option value="64/2">{'64CP (初期20CP)'}</option>
        <option value="40/4">{'40CP (初期40CP)'}</option>
        <option value="48/4">{'48CP (初期40CP)'}</option>
        <option value="64/4">{'64CP (初期40CP)'}</option>
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
