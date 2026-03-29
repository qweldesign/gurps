import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Character } from '../domains/Character'
import { SampleCharacter } from '../domains/Sample/Character'
import { SaveData } from '../domains/SaveData'
import List from './Setup/List'

function Setup() {
  // セーブデータの読み込み
  const saveData = new SaveData()
  const points = saveData.loadPoints()
  const gold = saveData.loadGold()
  const keys = saveData.loadKeys()

  // List, Detail に渡すパラメータ
  const [units, setUnits] = useState<Character[]>([])

  // navigate を取得
  const navigate = useNavigate()

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
    if (!keys.size) {
      // 不足メンバーを補完
      saveUnits(5 - keys.size)
    }
    const models = saveData.loadModels()
    const next: Character[] = []
    models.forEach(model => {
      next.push(new Character(model))
    })
    setUnits(next)
  }, [])

  return (
    <div className="px-6">
      <div className="mt-12 mb-6 text-right">CP: {points} <span className="mx-3">|</span> 軍資金: {gold}金</div>
      <List units={units} />
      <div className="text-center">
        <button className="w-48 h-12" onClick={reset}>リセット</button>
      </div>
    </div>
  )
}

export default Setup
