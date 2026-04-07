// Combat/Formation.tsx

import { BACK_VALUES, FRONT_VALUES, CombatFormationStore as Store } from '../../domains/Combat/Stores/FormationStore'

function Formation({ store }: { store: Store }) {
  const PLAYER_BACK_VALUES = BACK_VALUES.player
  const PLAYER_FRONT_VALUES = FRONT_VALUES
  const ENEMY_BACK_VALUES = BACK_VALUES.enemy
  const ENEMY_FRONT_VALUES = [...FRONT_VALUES].reverse()

  return (
    <div className="formation">
      <div className="formation__col is-player is-back">
        {PLAYER_BACK_VALUES.map(v => (
          <div
            className={`formation__cell ${store.actor === store.player.back[v] ? 'is-current' : ''}`}
            key={v}
          >{store.player.back[v]?.name}</div>
        ))}
      </div>
      <div className="formation__col is-player is-front">
        {PLAYER_FRONT_VALUES.map(v => (
          <div
            className={`formation__cell ${store.actor === store.player.front[v] ? 'is-current' : ''}`}
            key={v}
          >{store.player.front[v]?.name}</div>
        ))}
      </div>
      <div className="formation__col is-enemy is-front">
        {ENEMY_FRONT_VALUES.map(v => (
          <div
            className={`formation__cell ${store.actor === store.enemy.front[v] ? 'is-current' : ''}`}
            key={v}
          >{store.enemy.front[v]?.name}</div>
        ))}
      </div>
      <div className="formation__col is-enemy is-back">
        {ENEMY_BACK_VALUES.map(v => (
          <div
            key={v}
            className={`formation__cell ${store.actor === store.enemy.back[v] ? 'is-current' : ''}`}
          >{store.enemy.back[v]?.name}</div>
        ))}
      </div>
    </div>
  )
}

export default Formation
