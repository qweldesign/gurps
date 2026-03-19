import { type ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import List from './Setup/List'
import Modal from './common/Modal'
import { Character } from '../domains/Character'
import { createSamples } from '../domains/SampleCharacter'
import { SaveData } from '../domains/SaveData'

function Setup() {
  // セーブデータの読み込み
  const saveData = new SaveData()
  const gold = saveData.loadGold()
  const keys = saveData.loadKeys()

  // List, Detail に渡すパラメータ
  const [units, setUnits] = useState<Character[]>([])

  // Modal に渡すパラメータ
  const [alertMessage, setAlertMessage] = useState<ReactNode>('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)

  // navigate を取得
  const navigate = useNavigate()

  // サンプル初期化・保存 (idModを指定して生成)
  const saveUnits = (size: number) => {
    const mod = Math.floor(Math.random() * 15) // 乱数 0～15 を足してサンプル生成
    const samples = createSamples(10, 1, size, mod, 5 - size)
    samples.forEach(sample => {
      const model = {
        ...sample.toModel(),
        totalPoints: 10
      }
      const unit = new Character(model)
      saveData.addKey(unit.uid) // インデックス登録
      unit.save() // キャラクター保存
    })
  }

  // ゲーム初期化の確認
  const confirmReset = () => {
    setAlertMessage(
      <p>本当にセーブデータを初期化しますか？</p>
    )
    setAlertOpen(true)
  }

  // ゲーム初期化
  const reset = () => {
    setAlertOpen(false)
    saveData.clear()
    navigate('/')
  }

  // 最初に1回だけ実行
  useEffect(() => {
    if (keys.size === 1) {
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
      <div className="mt-12 mb-6 text-right">軍資金: {gold}金</div>
      <List units={units} />
      <div className="text-center">
        <button onClick={() => navigate('./edit/')}>新規作成</button>
        <button onClick={confirmReset}>リセット</button>
      </div>
      {alertOpen && (
        <Modal message={alertMessage} onClose={() => setAlertOpen(false)} onContinue={reset} />
      )}
    </div>
  )
}

export default Setup
