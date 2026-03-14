import { useLoaderData, useNavigate } from 'react-router-dom'
import Detail from '../Detail'
import { Character } from '../../lib/domains/Character'
import { SaveData } from '../../lib/domains/SaveData'

function Confirm() {
  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // セーブデータの読み込み
  const saveData = new SaveData()
  const keys = saveData.loadKeys()

  // SessionStorage から作りかけのデータを取得
  const model = saveData.loadModel(uid, true)

  // 新規作成かどうかを変数に格納
  const isFirstCreation = !model.id

  // 新規の場合, 新しい ID を発行
  if (isFirstCreation) model.id = keys.size + 1

  // Detail に渡すパラメータ
  const unit = new Character(model)

  // 戻る
  const back = () => {
    if (!isFirstCreation) {
      navigate(`/edit/setting/${uid}`)
    } else {
      navigate(`/edit/making/`)
    }
  }

  // 保存
  const save = () => {
    if (isFirstCreation) {
      saveData.addKey(unit.uid) // 新規の場合, インデックス登録
    }
    unit.save() // キャラクター保存
    sessionStorage.clear() // SessionStorage をクリア
    navigate(`/edit/`) // 戻る
  }

  return (
    <div className="px-6">
      <Detail unit={unit} />
      <section className="my-12 text-center">
        <p className="text-center">この内容で保存しますか？</p>
        <button onClick={save}>保存する</button>
        <button onClick={back}>作成画面へ戻る</button>
      </section>
    </div>
  )
}

export default Confirm
