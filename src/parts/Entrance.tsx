// Entrance.tsx

import { Link } from 'react-router-dom';

function Entrance() {
  return (
    <ul className='nav'>
      <li className='nav__item'>
        <Link to="/docs/">ドキュメント</Link>
      </li>
    </ul>
  )
}

export default Entrance
