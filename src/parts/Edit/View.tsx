import { type ReactNode, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom'
import Detail from '../common/Detail'
import Modal from '../common/Modal'
import { Character } from '../../domains/Character'
import { SaveData } from '../../domains/SaveData'

function View() {
  // セーブデータの読み込み
  const saveData = new SaveData()

  // uid, navigate を取得
  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // LocalStorage からキャラクターデータを取得
  const model = saveData.loadModel(uid)

  // Detail に渡すパラメータ
  const unit = new Character(model)

  // Modal に渡すパラメータ
  const [alertMessage, setAlertMessage] = useState<ReactNode>('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)

  // 除名の確認
  const confirmRemove = () => {
    setAlertMessage(
      <p>本当に {unit.name} を除名しますか？</p>
    )
    setAlertOpen(true)
  }

  // 除名
  const remove = () => {
    setAlertOpen(false)
    saveData.removeModel(uid)
    navigate('/edit/')
  }

  return (
    <div className="px-6">
      <Detail unit={unit} />
      <div className="text-center">
        <button onClick={() => navigate('/edit/')}>一覧へ戻る</button>
        <button onClick={() => navigate(`/edit/setting/${uid}`)}>編集</button>
        <button onClick={confirmRemove}>除名</button>
      </div>
      {alertOpen && (
        <Modal message={alertMessage} onClose={() => setAlertOpen(false)} onContinue={remove} />
      )}
    </div>
  )
}

export default View
