import { type ReactNode, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage';
import Detail from './Detail'
import Modal from './Modal'
import { type CharacterData, Character } from '../../lib/domains/Character'

function View() {
  const [alertMessage, setAlertMessage] = useState<ReactNode>('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)

  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // LocalStorage を使用
  const storageKey = 'savedata';
  const uniqueKey = `${storageKey}:${uid}`

  // LocalStorage のインデックス (uid配列を格納)
  const indexKey = `${storageKey}:index`
  const [index, setIndex] = useLocalStorage<string[]>(indexKey, [])

  const [data] = useLocalStorage<CharacterData>(uniqueKey, {
    id: 0,
    name: '未設定',
    gender: '男性',
    points: [],
    totalPoints: 10,
    equipments: null,
    gold: 100
  })

  const unit = new Character(data)

  // 除名確認
  const confirmRemove = () => {
    setAlertMessage(
      <p>本当に {data.name} を除名しますか？</p>
    )
    setAlertOpen(true)
  }

  // 除名
  const remove = () => {
    setAlertOpen(false)
    const order = index.indexOf(uid)
    if (order !== -1) {
      // 配列を詰める
      index.forEach((uid, i) => { // 01, 02, 03, 04, 05 とすると、i = 2
        if (i > order) {
          // 旧キーからデータを取り出す uid='04', '05'
          const uniqueKey = `${storageKey}:${uid}`
          const stored = localStorage.getItem(uniqueKey) ?? 'null'
          const data = JSON.parse(stored)
          if (data) {
            data.id-- // ID を更新
            const newUid = String(data.id).padStart(2, '0')
            const newUniqueKey = `${storageKey}:${newUid}` // 03, 04
            const newData = JSON.stringify(data)
            localStorage.setItem(newUniqueKey, newData) // 新キーへデータを格納
            sessionStorage.setItem(newUniqueKey, newData)
          }
        }
      })
      // 末尾を削除
      const latestUid = index[index.length - 1]
      const latestUniqueKey = `${storageKey}:${latestUid}`
      localStorage.removeItem(latestUniqueKey)
      sessionStorage.removeItem(latestUniqueKey)
      // インデックスを更新
      const newIndex = index.filter(v => v !== latestUid)
      setIndex(newIndex)
      navigate('/edit/')
    }
  }

  return (
    <>
      <Detail unit={unit} />
      <div className="text-center">
        <button onClick={() => navigate('/edit/')}>一覧へ戻る</button>
        <button onClick={() => navigate(`/edit/setting/${uid}`)}>編集</button>
        <button onClick={confirmRemove}>除名</button>
      </div>
      {alertOpen && (
        <Modal message={alertMessage} onClose={() => setAlertOpen(false)} onContinue={remove} />
      )}
    </>
  )
}

export default View
