import { useState } from 'react'
import { useParams } from 'react-router-dom'
import List from './Edit/List'
import Detail from './Edit/Detail'
import { type CharacterData, Character } from '../lib/domains/Character'
import { createSamples } from '../lib/domains/SampleCharacter'

function Edit() {
  // 作成したキャラクターID
  const { uid } = useParams()

  // LocalStorage を使用
  const storageKey = 'savedata';

  // LocalStrage が空の場合はサンプルキャラクターを生成する
  const initData = (): CharacterData[] => {
    const mod = Math.floor(Math.random() * 15) // 乱数 0～15 を足してサンプル生成
    const data = createSamples(10, 1, 4, mod).map(sample => sample.toData())
    localStorage.setItem(storageKey, JSON.stringify(data))
    return data
  }

  // LocalStrage の初期化
  const loadModels = (): Character[] => {
    const stored = localStorage.getItem(storageKey)
    const data:CharacterData[] = stored ? JSON.parse(stored) : initData()
    return data
      .sort((a, b) => a.id - b.id) // IDでソート
      .map(dt => new Character(dt))
  }

  // List, Detail に渡すパラメータ
  const [models, setModels] = useState<Character[]>(loadModels)

  // ゲームの初期化
  const reset = () => {
    localStorage.clear()
    const data: CharacterData[] = initData()
    setModels(data.map(dt => new Character(dt)))
  }

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
