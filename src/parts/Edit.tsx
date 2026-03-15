import { type ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import List from './Edit/List'
import Modal from './common/Modal'
import { Character } from '../domains/Character'
import { createSamples } from '../domains/SampleCharacter'
import { SaveData } from '../domains/SaveData'
import DevProgress from './DevProgress'
import {EDIT_DEV_PROGRESS } from '../devProgress/edit'

function Edit() {
  const [alertMessage, setAlertMessage] = useState<ReactNode>('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)

  const navigate = useNavigate()

  // セーブデータの読み込み
  const saveData = new SaveData()
  const keys = saveData.loadKeys()

  // List, Detail に渡すパラメータ
  const [units, setUnits] = useState<Character[]>([])

  // サンプルキャラクター生成・保存 (idModを指定して生成)
  const saveUnits = (size: number) => {
    const mod = Math.floor(Math.random() * 15) // 乱数 0～15 を足してサンプル生成
    const samples = createSamples(10, 1, size, mod, 5 - size)
    samples.forEach(sample => {
      const model = {
        ...sample.toData(),
        totalPoints: 10,
        gold: sample.getTactic() < 3 ? 200 : 100
      }
      const unit = new Character(model)
      saveData.addKey(unit.uid) // インデックス登録
      unit.save() // キャラクター保存
    })
  }

  // ゲームの初期化確認
  const confirmReset = () => {
    setAlertMessage(
      <p>本当にセーブデータを初期化しますか？</p>
    )
    setAlertOpen(true)
  }

  // ゲームの初期化
  const reset = () => {
    setAlertOpen(false)
    saveData.clear()
    navigate('/')
  }

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
    <>
      <div className="px-6">
        <List units={units} />
        <div className="text-center">
          <button onClick={() => navigate('./making/')}>新規作成</button>
          <button onClick={confirmReset}>リセット</button>
        </div>
        {alertOpen && (
          <Modal message={alertMessage} onClose={() => setAlertOpen(false)} onContinue={reset} />
        )} 
      </div>
      <div className="mt-24 px-6">
        <DevProgress progress={EDIT_DEV_PROGRESS} />
      </div>
    </>
  )
}

export default Edit
