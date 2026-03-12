import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import List from './Edit/List'
import { type CharacterData, Character } from '../lib/domains/Character'
import { createSamples } from '../lib/domains/SampleCharacter'

function Edit() {
  const navigate = useNavigate()

  // LocalStorage を使用
  const storageKey = 'savedata';
  
  // LocalStorage のインデックス (uid配列を格納)
  const indexKey = `${storageKey}:index`
  const [index, setIndex] = useLocalStorage<string[]>(indexKey, [])

  // List, Detail に渡すパラメータ
  const [models, setModels] = useState<Character[]>([])

  // LocalStorage が空の場合はサンプルキャラクターを生成する
  const initModels = (size: number, idMod:number = 0): Character[] => {
    const mod = Math.floor(Math.random() * 15) // 乱数 0～15 を足してサンプル生成
    const models = createSamples(10, 1, size, mod, idMod)
    return models
  }

  // 1人目のキャラクター作成後, サンプルキャラクターを4名追加する
  const addSamples = (size: number) => {
    const idMod = 5 - size
    // サンプル生成
    const samples = initModels(size, idMod)
    const uids = samples.map((sample, i) => {
      const uid = `${i + 1 + idMod}`.padStart(2, '0') // ID文字列生成
      // シリアライズ用データ変換の上 LocalStorage にキャラクターを保存
      localStorage.setItem(`${storageKey}:${uid}`, JSON.stringify(sample.toData()))
      return uid
    })
    const newIndex = [...index, ...uids]
    setIndex(newIndex) // LocalStorage にインデックスを保存
  }

  // ゲームの初期化
  const reset = () => {
    localStorage.clear()
    sessionStorage.clear()
    navigate('/')
  }

  useEffect(() => {
    if (index.length === 1) {
      // 不足メンバーを補完
      addSamples(5 - index.length)
    } else {
      const next = index.sort().map(key => {
        const stored = localStorage.getItem(`${storageKey}:${key}`)
        const data = stored ? JSON.parse(stored) : {
          id: 0,
          name: '未設定',
          gender: '男性',
          points: [],
          equipments: null
        } as CharacterData
        return new Character(data)
      })
      setModels(next)
    }
  }, [index])

  return (
    <>
      <List models={models} />
      <div className="text-center">
        <button onClick={() => navigate('./making/')}>新規作成</button>
        <button onClick={reset}>リセット</button>
      </div>
    </>
  )
}

export default Edit
