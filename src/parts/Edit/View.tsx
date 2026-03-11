import { useLoaderData, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage';
import Detail from './Detail'
import { type CharacterData, Character } from '../../lib/domains/Character'

function View() {
  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // LocalStorage を使用
  const storageKey = 'savedata';

  const [data] = useLocalStorage<CharacterData>(`${storageKey}:${uid}`, {
    id: 0,
    name: '未設定',
    gender: '男性',
    points: [],
    equipments: null
  })

  const model = new Character(data)

  return (
    <>
      <Detail model={model} />
      <div className="text-center">
        <button onClick={() => navigate('/edit/')}>一覧へ戻る</button>
        <button onClick={() => navigate(`/edit/making/${uid}`)}>編集</button>
      </div>
    </>
  )
}

export default View
