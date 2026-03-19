import { CombatSummaryStore as Store } from "../../combat/SummaryStore"

function Summary({ store }: { store: Store }) {
  return (
    <div className="summary">
      <div className="summary__grid">
        <div className="summary__row">
          <div>名前</div><div>HP</div><div>状態</div><div>行動</div>
        </div>
        {store.summaries.map((summary, i) => (
          <div className={`summary__row ${summary.unit === store.actor ? 'is-current' : ''}`} key={i}>
            <div>{summary.name}</div>
            <div>{summary.HP} / {summary.maxHP}</div>
            <div>{summary.condition}</div>
            <div>{''}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Summary
