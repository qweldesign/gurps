import { useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { PARAMETER_LIST, type ParameterName, Parameters } from '../../lib/domains/Parameters'

function Making() {
  const [points] = useState(10)
  const [params, setParams] = useState(() => new Parameters([]))
  
  // 作成したキャラクターID
  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // 能力値, 技能一覧表
  const lists = []
  lists[0] = PARAMETER_LIST.filter(param => param.base === 10)
  lists[1] = PARAMETER_LIST.filter(param => param.base === '筋力')
  lists[2] = PARAMETER_LIST.filter(param => param.base === '生命力')
  lists[3] = PARAMETER_LIST.filter(param => param.base === '敏捷力')
  lists[4] = PARAMETER_LIST.filter(param => param.base === '知力')

  // LocalStorage を使用
  const storageKey = 'savedata';
  // LocalStorage からキャラクターデータを取得
  const [data] = useLocalStorage(`${storageKey}:${String(uid).padStart(2, '0')}`, {
    id: 0,
    name: '未設定',
    gender: '男性',
    points: [],
    equipments: null
  })

  // パラメータをステップ
  const step = (name: ParameterName, size: number) => {
    const next = new Parameters(params.toData())
    next.step(name as ParameterName, size)
    setParams(next)
  }
 
  useEffect(() => {
    // 作成したキャラクターのデータを反映
    setParams(() => new Parameters(data.points))
  }, [])

  return (
    <>
      <div className="w-[48em] mx-auto">
        <h3>キャラクター作成</h3>
        <h4>キャラクターポイントの振り分け</h4>
        <p>合計{points}点のキャラクターポイントを振り分けてキャラクターを作成します。
          <br />能力値や技能値は、値が高くなるほどポイントを多く消耗します。
          <br />能力値は技能値の基準となるので、多めに振り分けましょう。
          <br />ポイントは最小0.5点単位で振り分けることができます。
        </p>
        <h5>残りCP: {points - params.getTotal()} 点</h5>
        <div className="flex flex-wrap flex-col items-center gap-6 h-[60em]">
          {lists.map((list, i) => (
            <div className="w-64" key={i}>
              <h6>
                {i === 0 ? '能力値' :
                  i === 1 ? '筋力を基準とする技能' :
                  i === 2 ? '生命力を基準とする技能' :
                  i === 3 ? '敏捷力を基準とする技能' : '知力を基準とする技能'
                }
              </h6>
              <table>
                <thead>
                  <tr>
                    <th>{i === 0 ? '能力値' : '技能'}</th>
                    <th className="text-center">Lv</th>
                    <th className="text-center">CP</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p, j) =>  (
                    <tr key={j}>
                      <td>{p.name}</td>
                      <td>
                        <button
                          className="w-6 h-6 my-0 mx-3 leading-1"
                          onClick={() => step(p.name, -1)}
                        >-</button>
                        <span className="inline-block w-6 text-center">{params.getLevel(p.name)}</span>
                        <button
                          className="w-6 h-6 my-0 mx-3 leading-1"
                          onClick={() => step(p.name, 1)}
                        >+</button>
                      </td>
                      <td className="w-6 text-center">{params.get(p.name)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <button onClick={() => navigate('/edit/')}>作成中止</button>
      </div>
    </>
  )
}

export default Making
