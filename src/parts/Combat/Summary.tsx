// Combat/Summary.tsx

import { CombatState as State } from "../../domains/Combat/State"

function Summary({ state }: { state: State }) {
  return (
    <div className="summary">
      <div className="summary__grid">
        <div className="summary__row">
          <div>名前</div><div>HP</div><div>状態</div><div>行動</div>
        </div>
        {state.units.map((unit, i) => (
          <div className={`summary__row ${unit === state.actor ? 'is-current' : ''}`} key={i}>
            <div>{unit.name}</div>
            <div>{unit.health.Hp} / {unit.health.maxHp}</div>
            <div className={`is-${unit.health.condition}`}>{unit.health.condition}</div>
            <div>&nbsp;</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Summary
