import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import List from './Edit/List'
import Detail from './Edit/Detail'
import { type CharacterData, Character } from '../lib/domains/Character'
import { createSamples } from '../lib/domains/SampleCharacter'

function Edit() {
  // 作成したキャラクターID
  const { uid } = useParams()

  // LocalStorage を使用
  const storageKey = 'savedata';
  
  // LocalStorage のインデックス (uid配列を格納)
  const [list, setList] = useLocalStorage<string[]>(`${storageKey}:index`, [])

  // List, Detail に渡すパラメータ
  const [models, setModels] = useState<Character[]>([])

  // LocalStorage が空の場合はサンプルキャラクターを生成する
  const initModels = (): Character[] => {
    const mod = Math.floor(Math.random() * 15) // 乱数 0～15 を足してサンプル生成
    const models = createSamples(10, 1, 4, mod)
    return models
  }

  // ゲームの初期化 (初期表示)
  const reset = () => {
    localStorage.clear()
    // サンプル生成
    const samples = initModels()
    const uids = samples.map((sample, i) => {
      const uid = `${i + 1}`.padStart(2, '0') // ID文字列生成
      // シリアライズ用データ変換の上 LocalStorage にキャラクターを保存
      localStorage.setItem(`${storageKey}:${uid}`, JSON.stringify(sample.toData()))
      return uid
    })
    setList(uids) // LocalStorage にインデックスを保存
  }

  useEffect(() => {
    if (list.length === 0) {
      reset() // インデックスが見つからない場合はリセット
    } else {
      const next = list.sort().map(key => {
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
  }, [list])

  return (
    <>
      {!uid
        ? <List models={models} />
        : <Detail model={models.find(m => m.id === Number(uid))!} />
      }
      <div className="text-center">
        <button onClick={reset}>リセット</button>
      </div>
    </>
  )
}

export default Edit
