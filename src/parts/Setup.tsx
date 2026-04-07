// Setup.tsx

import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import List from './common/List'
import Detail from './common/Detail'
import { Character } from '../domains/Character'
import { SampleCharacter } from '../domains/Sample/Character'
import { SaveData } from '../domains/SaveData'

function Setup() {
  // セーブデータの読み込み
  const saveData = useMemo(() => new SaveData(), [])
  const [points, setPoints] = useState(10)
  const [gold, setGold] = useState(100)

  // List, Detail に渡すパラメータ
  const [units, setUnits] = useState<Character[]>([])
  const [unit, setUnit] = useState<Character | null>(null)

  // navigate, uid を取得
  const navigate = useNavigate()
  const { uid } = useParams()

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

  // サンプル保存関数
  const saveUnits = (size: number) => {
    const mod = Math.floor(Math.random() * 15) // 乱数 0～15 を足してサンプル生成
    const samples = createSamples(10, 1, 5 - size, mod, size)
    samples.forEach(sample => {
      const unit = new Character(sample.model)
      const key = String(sample.id).padStart(2, '0')
      saveData.addKey(key) // インデックス登録
      unit.save() // キャラクター保存
    })
  }

  // ゲーム初期化
  const reset = () => {
    saveData.clear()
    navigate('/')
  }

  // 最初に1回だけ実行
  useEffect(() => {
    // セーブデータの内容読み込み
    setPoints(saveData.loadPoints())
    setGold(saveData.loadGold())
    const keys = saveData.loadKeys()
    // 不足メンバーを補完
    if (!keys.size) {
      saveUnits(5 - keys.size)
    }
    // モデル読み込みとユニット生成
    const models = saveData.loadModels()
    const next: Character[] = []
    models.forEach(model => {
      next.push(new Character(model))
    })
    setUnits(next)

    // uid があれば1人のサンプルを探す
    if (uid) setUnit(next.find(m => m.id === Number(uid)) || null)
    else setUnit(null)
  }, [uid])

  return (
    <div className="px-6">
      <div className="mt-12 mb-6 text-right">CP: {points} <span className="mx-3">|</span> 軍資金: {gold}金</div>
      {!unit
        ? 
          <>
            <List units={units} points={points} />
            <div className="text-center">
              <button className="w-48 h-12" onClick={reset}>リセット</button>
            </div>
          </>
        :
          <>
            <Detail unit={unit} />
          </>
      }
    </div>
  )
}

export default Setup
