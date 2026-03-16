import DevProgress from './DevProgress'
import { COMBAT_DEV_PROGRESS } from '../devProgress/combat'

function Battle() {
  return (
    <>
      <div className="p-6">
        <p>In development...</p>
      </div>
      <div className="mt-24 px-6">
        <DevProgress progress={COMBAT_DEV_PROGRESS} />
      </div>
    </>
  )
}

export default Battle
