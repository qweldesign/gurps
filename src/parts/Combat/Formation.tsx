import { CombatFormationStore as Store } from '../../combat/FormationStore'

function Formation({ store }: { store: Store }) {
  const PLAYER_BACK_VALUES = [0, 1, 2, 3]
  const PLAYER_FRONT_VALUES = ['left', 'center', 'right']
  const ENEMY_BACK_VALUES = [4, 5, 6, 7]
  const ENEMY_FRONT_VALUES = ['right', 'center', 'left']

  return (
    <div className="formation">
      <div className="formation__col is-player is-back">
        {PLAYER_BACK_VALUES.map(v => (
          <div
            className={`formation__cell ${store.actor.name === store.back.get(v) ? 'is-current' : ''}`}
            key={v}
          >{store.back.get(v)}</div>
        ))}
      </div>
      <div className="formation__col is-player is-front">
        {PLAYER_FRONT_VALUES.map(v => (
          <div
            className={`formation__cell ${store.actor.name === store.front.get(`player-${v}`) ? 'is-current' : ''}`}
            key={v}
          >{store.front.get(`player-${v}`)}</div>
        ))}
      </div>
      <div className="formation__col is-enemy is-front">
        {ENEMY_FRONT_VALUES.map(v => (
          <div
            className={`formation__cell ${store.actor.name === store.front.get(`enemy-${v}`) ? 'is-current' : ''}`}
            key={v}
          >{store.front.get(`enemy-${v}`)}</div>
        ))}
      </div>
      <div className="formation__col is-enemy is-back">
        {ENEMY_BACK_VALUES.map(v => (
          <div
            key={v}
            className={`formation__cell ${store.actor.name === store.back.get(v) ? 'is-current' : ''}`}
          >{store.back.get(v)}</div>
        ))}
      </div>
    </div>
  )
}

export default Formation
