// Setup/Confirm.tsx

import { useNavigate, useParams } from 'react-router-dom'
import Detail from '../common/Detail'
import { Character } from '../../domains/Character'
import { SaveData } from '../../domains/SaveData'

function Confirm() {
  // セーブデータの読み込み
  const saveData = new SaveData()
  const gold = saveData.loadGold(true)
  const keys = saveData.loadKeys()

  // navigate, uid を取得
  const navigate = useNavigate()
  const { uid = '00' } = useParams()

  // 新規作成かどうかを変数に格納
  const isFirstCreation = uid === '00' ? true : false

  // SessionStorage から作りかけのデータを取得
  const model = saveData.loadModel(uid, true)

  // 新規の場合, 新しい ID を発行
  if (isFirstCreation) model.id = keys.size + 1

  // Detail に渡すパラメータ
  const unit = new Character(model)

  // 保存
  const save = () => {
    if (isFirstCreation) {
      const uid = unit.id.toString().padStart(2, '0')
      saveData.addKey(uid) // 新規の場合, インデックス登録
    }
    saveData.saveGold(gold) // 所持金保存
    unit.save() // キャラクター保存
    sessionStorage.clear() // SessionStorage をクリア
    navigate(`/setup/`) // 戻る
  }

  // 戻る
  const back = () => {
    if (!isFirstCreation) {
      navigate(`/setup/edit/${uid}`)
    } else {
      navigate(`/setup/edit/`)
    }
  }

  return (
    <div className="px-6">
      <Detail unit={unit} />
      <section className="my-12 text-center">
        <p className="text-center">この内容で保存しますか？</p>
        <button className="w-48 h-12" onClick={save}>保存する</button>
        <button className="w-48 h-12" onClick={back}>作成画面へ戻る</button>
      </section>
    </div>
  )
}

export default Confirm
