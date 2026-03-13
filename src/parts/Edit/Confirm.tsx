import { useLoaderData, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useSessionStorage } from '../../hooks/useSessionStorage'
import Detail from './Detail'
import { type CharacterData, Character } from '../../lib/domains/Character'

function Confirm() {
  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // LocakStorage / SessionStorage を使用
  const storageKey = 'savedata';
  let uniqueKey = `${storageKey}:${uid}`

  // LocalStorage のインデックス (uid配列を格納)
  const indexKey = `${storageKey}:index`
  const [index, setIndex] = useLocalStorage<string[]>(indexKey, [])

  // SessionStorage からデータを取り出す
  // この初期データが使われることは恐らく無い (デバッグ用)
  const [data] = useSessionStorage<CharacterData>(uniqueKey, {
    id: 0,
    name: '未設定',
    gender: '男性',
    points: [],
    totalPoints: 10,
    equipments: null,
    gold: 100
  })

  // Detail に渡すパラメータ
  const unit = new Character(data)

  // 戻る
  const back = () => {
    if (data.id) {
      navigate(`/edit/making/${uid}`)
    } else {
      navigate(`/edit/making/`)
    }
  }

  // 保存
  const save = () => {
    if (!data.id) {
      // 新規の場合
      // id から uid を作成 (インデックスの長さから生成)
      const uid = String(index.length + 1).padStart(2, '0')
      // 忘れずに StorageKey を更新
      uniqueKey = `${storageKey}:${uid}`
      // 忘れずにキャラクターのIDを更新
      data.id = Number(uid)
      // インデックスを更新
      const newIndex = [...index, uid]
      setIndex(newIndex)
    }
    // キャラクターデータを保存
    localStorage.setItem(uniqueKey, JSON.stringify(data))
    // SessionStorage を削除
    sessionStorage.removeItem(`${storageKey}:00`)
    sessionStorage.removeItem(storageKey)
    navigate(`/edit/`) // 戻る
  }

  return (
    <>
      <Detail unit={unit} />
      <section className="my-12 text-center">
        <p className="text-center">この内容で保存しますか？</p>
        <button onClick={save}>保存する</button>
        <button onClick={back}>作成画面へ戻る</button>
      </section>
    </>
  )
}

export default Confirm
