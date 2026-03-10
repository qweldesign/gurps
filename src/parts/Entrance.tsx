import { Link } from 'react-router-dom';

function Entrance() {
  return (
    <ul className='nav'>
      <li className='nav__item'>
        <Link to="/docs/">ドキュメント</Link>
      </li>
      <li className='nav__item'>
        <Link to="/sample/">サンプル</Link>
      </li>
      <li className='nav__item'>
        <Link to="/edit/">編成</Link>
      </li>
      <li className='nav__item'>
        <Link to="/battle/">模擬戦闘</Link>
      </li>
    </ul>
  )
}

export default Entrance
