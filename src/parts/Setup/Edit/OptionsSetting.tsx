import { type Dispatch } from 'react'
import { type Action } from '../Edit'

function OptionsSetting({ dispatch }: { dispatch: Dispatch<Action> }) {
  // SET_OPTIONS
  const onSetOptions = (value: string) => {
    // 発火
    dispatch({ type: 'SET_OPTIONS', payload: { value } })
  }

  return (
    <section>
      <h4>1. 基本設定</h4>
      <p>キャラクター作成の条件を設定します。
        <br />初期CPや所持金が大きいほど強いキャラクターを作成できますが、初めてのプレイヤーはロックされています。
        <br />模擬戦闘で勝利を重ねるとアンロックされます。
      </p>
      <div>
        <label>作成条件: </label>
        <select className="w-48 m-6 ps-3 text-center" onChange={(e) => onSetOptions(e.target.value)}>
          <option value="10/100">{'10CP / 100金'}</option>
        </select>
      </div>
    </section>
  )
}

export default OptionsSetting
