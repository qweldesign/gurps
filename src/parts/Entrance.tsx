import { Link } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'

function Entrance() {
  // LocalStorage を使用
  const storageKey = 'savedata';
  
  // LocalStorage のインデックス (uid配列を格納)
  const indexKey = `${storageKey}:index`
  const [index] = useLocalStorage<string[]>(indexKey, [])
  const edit = index.length ? '/edit/' : '/edit/making/'

  return (
    <ul className='nav'>
      <li className='nav__item'>
        <Link to="/docs/">ドキュメント</Link>
      </li>
      <li className='nav__item'>
        <Link to="/sample/">サンプル</Link>
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
