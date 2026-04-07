// Setup/Edit.tsx

import { type Reducer, useReducer, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ParametersSetting from './Edit/ParametersSetting'
import { type ParameterKey, Parameters } from '../../domains/Parameters'
import { type CharacterModel as Model } from '../../domains/Character'
import { SaveData } from '../../domains/SaveData'

export type ParamsState = {
  // CP
  initialPoints: number // CP: 初期値 0

  // パラメータ
  prevParams: Parameters // 元のパラメータ
  params: Parameters // 現在のパラメータ
}

export type Action =
  | { type: 'INIT', payload: { prevModel: Model,  model: Model } }
  | { type: 'STEP_PARAM', payload: { prevParams: Parameters, name: ParameterKey, size: number } }

function Edit() {
  // セーブデータの読み込み
  const saveData = new SaveData()
  
  // navigate, uid を取得
  let { uid = '00' } = useParams()

  // 新規作成かどうかを変数に格納
  const isFirstCreation: boolean = uid === '00' ? true : false

  // 状態初期値 → ほとんど最初の useEffect で初期値を再代入
  const initialState: ParamsState = {
    initialPoints: 0,
    prevParams: new Parameters([]),
    params: new Parameters([]),
  }

  // 状態更新 (設定内容)
  const reducer: Reducer<ParamsState, Action> = (state, action) => {
    switch (action.type) {
      case 'INIT':
        // 元のCPを取得
        const initialPoints = saveData.loadPoints()

        // 元と現在のパラメータを取得
        const prevParams = new Parameters(action.payload.prevModel.points)
        const params = new Parameters(action.payload.model.points)

        return {
          ...state,
          initialPoints,
          prevParams, params
        }

      case 'STEP_PARAM': {
        const nextParams = new Parameters(state.params.model)
        nextParams.step(action.payload.name, action.payload.size)

        return {
          ...state,
          params: nextParams,
        }
      }

      default:
        return state
    }
  }

  // 状態管理 (設定内容)
  const [state, dispatch] = useReducer(reducer, initialState)

  // INIT
  const onInit = () => {
    // LocalStorage からキャラクターデータを取得
    const prevModel: Model = saveData.loadModel(uid)
    // SessionStorage から作りかけのデータを取得
    const model: Model = saveData.loadModel(uid, true)
    // 発火
    dispatch({ type: 'INIT', payload: { prevModel, model } })
  }

  // 残りCPを計算 isMax: true で持ち点を返す
  const calcPoints = (state: ParamsState, isMax: boolean = false): number => {
    let points = state.initialPoints
    if (!isMax) points -= state.params.total
    return points
  }

  // 最初に一度だけ実行
  useEffect(() => {    
    onInit() // 初期化
  }, [])

  return (
    <div className="edit px-6">
      <div className="max-w-[48em] mx-auto">
        <h3>キャラクター{isFirstCreation ? '作成' : '編集'}</h3>
        <ParametersSetting isFirstCreation={isFirstCreation} state={state} dispatch={dispatch} calcPoints={calcPoints} />
      </div>
    </div>
  )
}

export default Edit
