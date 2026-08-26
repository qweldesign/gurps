// Combat.tsx

import { useLocation, useNavigate } from 'react-router-dom'
import Formation from './Combat/Formation'
import Action from './Combat/Action'
import Summary from './Combat/Summary'
import Timeline from './Combat/Timeline'
import { useCombat } from './Combat/useCombat'
import type { BattleDifficultyTier } from '../domains/Combat/Difficulty'
import DevProgress from './DevProgress'
import { SPELLS_DEV_PROGRESS } from '../devProgress/spells'

function Combat() {
  // Setup/BattleDifficulty から navigate の state で渡された選択難度
  // (SaveData には永続化しないため, リロード等で state が失われた場合は undefined になる → Normal 相当にフォールバック)
  const location = useLocation()
  const navigate = useNavigate()
  const difficulty = (location.state as { difficulty?: BattleDifficultyTier } | null)?.difficulty

  // ターン進行・ログ再生 (タイムライン表示) の状態管理は useCombat に集約する
  // (出撃ユニットの選出は domains/Combat/Player.ts, domains/Combat/Enemy.ts を参照.
  //  Combat.tsx はそれらの結果を受け取って表示するだけの, 表示専任のコンポーネントとする)
  const { state, result, reward, usedRoster, messages, timelineRef } = useCombat(difficulty)

  return (
    <>
      <div className="p-6">
        <div className="table-wrapper">
          {state && (
            <div className="row justify-center min-w-lg lg:min-w-5xl">
              <div id="formation" className="relative order-1 w-lg h-48 p-3 bg-white/15">
                <h3 className="m-0 border-0 font-serif text-sm">Formation</h3>
                {state.formation && (
                  <Formation store={state.formation} />
                )}
              </div>
              <div id="summary" className="relative order-2 lg:order-3 w-lg h-96 p-3 bg-white/30">
                <h3 className="m-0 border-0 font-serif text-sm">Summary</h3>
                <Summary state={state} />
              </div>
              <div id="action" className="relative order-3 lg:order-2 w-lg h-48 p-3 bg-white/15 lg:bg-white/30">
                <h3 className="m-0 border-0 font-serif text-sm">Action</h3>
                {result ? (
                  <div className="my-1 text-center">
                    <p className="font-serif text-2xl">{result === 'win' ? '勝利!!' : '敗北...'}</p>
                    {result === 'win' && reward && (
                      <p className="mt-3 text-sm">CP +{reward.cp} / 軍資金 +{reward.gold}金</p>
                    )}
                    {usedRoster && (
                      <button className="mt-6 w-48 h-12" onClick={() => navigate('/setup/')}>編成に戻る</button>
                    )}
                  </div>
                ) : (
                  // enemy (AI操作) のターン中はコマンドパレットを表示しない (誤操作防止)
                  // 「傀儡」中は, 対象が敵であっても術者 (player) 側が操作するため対象外とする
                  state.action && (state.puppetTarget || state.actor.side === 'player') && (
                    <Action store={state.action} />
                  )
                )}
              </div>
              <div id="log" className="relative order-4 w-lg h-96 bg-white/30 p-3 lg:bg-white/15">
                <h3 className="m-0 border-0 font-serif text-sm">Log</h3>
                <Timeline ref={timelineRef} messages={messages} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-24 px-6">
        <DevProgress tasks={SPELLS_DEV_PROGRESS} />
      </div>
    </>
  )
}

export default Combat
