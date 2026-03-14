import { type ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import List from './Edit/List'
import Modal from './Edit/Modal'
import { type CharacterData, Character } from '../lib/domains/Character'
import { createSamples } from '../lib/domains/SampleCharacter'

function Edit() {
  const [alertMessage, setAlertMessage] = useState<ReactNode>('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)

  const navigate = useNavigate()

  // LocalStorage を使用
  const storageKey = 'savedata';
  
  // LocalStorage のインデックス (uid配列を格納)
  const indexKey = `${storageKey}:index`
  const [index, setIndex] = useLocalStorage<string[]>(indexKey, [])

  // List, Detail に渡すパラメータ
  const [units, setUnits] = useState<Character[]>([])

  // LocalStorage が空の場合はサンプルキャラクターを生成する
  const initUnits = (size: number, idMod:number = 0): Character[] => {
    const mod = Math.floor(Math.random() * 15) // 乱数 0～15 を足してサンプル生成
    const samples = createSamples(10, 1, size, mod, idMod)
    const units = samples.map(sample => {
      const data = {
        ...sample.toData(),
        totalPoints: 10,
        gold: sample.getTactic() < 3 ? 200 : 100
      }
      return new Character(data)
    })
    return units
  }

  // 1人目のキャラクター作成後, サンプルキャラクターを4名追加する
  const addUnits = (size: number) => {
    const idMod = 5 - size
    // サンプル生成
    const units = initUnits(size, idMod)
    const uids = units.map((unit, i) => {
      const uid = `${i + 1 + idMod}`.padStart(2, '0') // ID文字列生成
      // シリアライズ用データ変換の上 LocalStorage にキャラクターを保存
      localStorage.setItem(`${storageKey}:${uid}`, JSON.stringify(unit.toData()))
      return uid
    })
    const newIndex = [...index, ...uids]
    setIndex(newIndex) // LocalStorage にインデックスを保存
  }

  // ゲームの期化確認
  const confirmReset = () => {
    setAlertMessage(
      <p>本当にセーブデータを初期化しますか？</p>
    )
    setAlertOpen(true)
  }

  // ゲームの初期化
  const reset = () => {
    setAlertOpen(false)
    localStorage.clear()
    sessionStorage.clear()
    navigate('/')
  }

  useEffect(() => {
    if (index.length === 1) {
      // 不足メンバーを補完
      addUnits(5 - index.length)
    } else {
      const next = index.sort().map(key => {
        const stored = localStorage.getItem(`${storageKey}:${key}`)
        const data = stored ? JSON.parse(stored) : {
          id: 0,
          name: '未設定',
          gender: '男性',
          points: [],
          totalPoints: 10,
          equipments: null,
          gold: 100
        } as CharacterData
        return new Character(data)
      })
      setUnits(next)
    }
  }, [index])

  return (
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
  )
}

export default Edit
