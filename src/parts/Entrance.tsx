import { Link } from 'react-router-dom';

function Entrance() {
  return (
    <nav>
      <Link to="/docs/">ドキュメント</Link>
      <Link to="/making/">キャラクター作成</Link>
      <Link to="/battle/">模擬戦闘</Link>
    </nav>
  )
}

export default Entrance
