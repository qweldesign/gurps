import { Link } from 'react-router-dom'
import { SaveData } from '../domains/SaveData'

function Entrance() {
  // セーブデータの読み込み
  const saveData = new SaveData()
  const keys = saveData.loadKeys()
  const edit = keys.size ? '/edit/' : '/edit/making/'

  return (
    <ul className='nav'>
      <li className='nav__item'>
        <Link to="/docs/">ドキュメント</Link>
      </li>
      <li className='nav__item'>
        <Link to={edit}>編成</Link>
      </li>
      <li className='nav__item'>
        <Link to="/battle/">模擬戦闘</Link>
      </li>
    </ul>
  )
}

export default Entrance
