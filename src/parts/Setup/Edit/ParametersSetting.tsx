// Setup/Edit/ParametersSetting.tsx

import { type Dispatch } from 'react'
import { type ParamsState, type Action } from '../Edit'
import { PARAMETERS, type ParameterKey, Parameters } from '../../../domains/Parameters'

function ParametersSetting({ isFirstCreation, state, dispatch, calcPoints }: { isFirstCreation: boolean, state: ParamsState, dispatch: Dispatch<Action>, calcPoints: (state: ParamsState, isMax: boolean) => number }) {
  // 能力値, 技能一覧表
  const parameterGroups = [
    { label: '能力値', filter: (base: ParameterKey | 10) => base === 10 },
    { label: '筋力を基準とする技能', filter: (base: ParameterKey | 10) => base === '筋力' },
    { label: '生命力を基準とする技能', filter: (base: ParameterKey | 10) => base === '生命力' },
    { label: '敏捷力を基準とする技能', filter: (base: ParameterKey | 10) => base === '敏捷力' },
    { label: '知力を基準とする技能', filter: (base: ParameterKey | 10) => base === '知力' },
  ]

  // 増減ボタンの状態を取得 (true: 有効 / false: 無効)
  const getButtonDisable = (name: ParameterKey, size: number, i: number) => {
    if (!isFirstCreation && i === 0) return true
    const prevPoint = state.prevParams.get(name)
    const currentPoint = state.params.get(name)
    const nextParams = new Parameters(state.params.model)
    nextParams.step(name, size)
    const nextPoint = nextParams.get(name)
    // 下限を下回る場合, 合計を上回る場合は disable を true に 
    return ((prevPoint === nextPoint && currentPoint === 0) || prevPoint > nextPoint || nextParams.total > calcPoints(state, true))
  }
  
  // STEP_PARAM
  const onStepParam = (name: ParameterKey, size: number) => {
    // 発火
    dispatch({ type: 'STEP_PARAM', payload: { prevParams: state.params , name, size } }) 
  }

  return (
    <section>
      {isFirstCreation && (
        <>
          <h4>1. キャラクターポイントの振り分け</h4>
          <p>合計{calcPoints(state, true)}点のキャラクターポイントを振り分けてキャラクターを作成します。
            <br />能力値や技能値は、値が高くなるほどポイントを多く消耗します。
            <br />能力値は技能値の基準となるので、多めに振り分けましょう。
            <br />ポイントは最小0.5点単位で振り分けることができます。
          </p>
        </>
      )}
      <h5>残りCP: <span className={calcPoints(state, false) > 0 ? 'text-amber-400 font-bold' : 'font-bold'}>{calcPoints(state, false)} 点</span></h5>
      <div className="flex flex-nowrap lg:flex-wrap flex-col items-center gap-6 lg:h-[60em]">
        {parameterGroups.map((group, i) => (
          <div className="w-64" key={i}>
            <h6>{group.label}</h6>
            <table>
              <thead>
                <tr>
                  <th>{i === 0 ? '能力値' : '技能'}</th>
                  <th className="text-center">Lv</th>
                  <th className="text-center">CP</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PARAMETERS).filter(([, param]) => group.filter(param.base)).map(([k], j) => {
                  const key = k as ParameterKey
                  return (
                  <tr key={j}>
                    <td>{key}</td>
                    <td>
                      <button
                        className="w-6 h-6 my-0 mx-3 leading-1"
                        disabled={getButtonDisable(key, -1, i)}
                        onClick={() => onStepParam(key, -1)}
                      >-</button>
                      <span className="inline-block w-6 text-center">{state.params.getLevel(key)}</span>
                      <button
                        className="w-6 h-6 my-0 mx-3 leading-1"
                        disabled={getButtonDisable(key, 1, i)}
                        onClick={() => onStepParam(key, 1)}
                      >+</button>
                    </td>
                    <td className="w-6 text-center">{state.params.get(key)}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ParametersSetting
