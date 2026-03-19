import { type Dispatch } from 'react'
import { type ParamsState, type Action } from '../Edit'
import { type Parameter, PARAMETER_LIST, type ParameterName, Parameters } from '../../../domains/Parameters'

function ParametersSetting({ isFirstCreation, state, dispatch, calcPoints }: { isFirstCreation: boolean, state: ParamsState, dispatch: Dispatch<Action>, calcPoints: (state: ParamsState, isMax: boolean) => number }) {
  // 能力値, 技能一覧表
  const parameterGroups = [
    { label: '能力値', filter: (p: Parameter) => p.base === 10 },
    { label: '筋力を基準とする技能', filter: (p: Parameter) => p.base === '筋力' },
    { label: '生命力を基準とする技能', filter: (p: Parameter) => p.base === '生命力' },
    { label: '敏捷力を基準とする技能', filter: (p: Parameter) => p.base === '敏捷力' },
    { label: '知力を基準とする技能', filter: (p: Parameter) => p.base === '知力' },
  ]

  // 増減ボタンの状態を取得 (true: 有効 / false: 無効)
  const getButtonDisable = (name: ParameterName, size: number, i: number) => {
    if (!isFirstCreation && i === 0) return true
    const prevPoint = state.prevParams.get(name)
    const currentPoint = state.params.get(name)
    const nextParams = new Parameters(state.params.toModel())
    const nextPoint = nextParams.step(name, size)
    // 下限を下回る場合, 合計を上回る場合は disable を true に 
    return ((prevPoint === nextPoint && currentPoint === 0) || prevPoint > nextPoint || nextParams.total > calcPoints(state, true))
  }
  
  // STEP_PARAM
  const onStepParam = (name: ParameterName, size: number) => {
    // 発火
    dispatch({ type: 'STEP_PARAM', payload: { prevParams: state.params , name, size } }) 
  }

  return (
    <section>
      {isFirstCreation && (
        <>
          <h4>2. キャラクターポイントの振り分け</h4>
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
                {PARAMETER_LIST.filter(group.filter).map((p, j) =>  (
                  <tr key={j}>
                    <td>{p.name}</td>
                    <td>
                      <button
                        className="w-6 h-6 my-0 mx-3 leading-1"
                        disabled={getButtonDisable(p.name, -1, i)}
                        onClick={() => onStepParam(p.name, -1)}
                      >-</button>
                      <span className="inline-block w-6 text-center">{state.params.getLevel(p.name)}</span>
                      <button
                        className="w-6 h-6 my-0 mx-3 leading-1"
                        disabled={getButtonDisable(p.name, 1, i)}
                        onClick={() => onStepParam(p.name, 1)}
                      >+</button>
                    </td>
                    <td className="w-6 text-center">{state.params.get(p.name)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ParametersSetting
