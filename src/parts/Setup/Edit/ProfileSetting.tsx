// Setup/Edit/ProfileSetting.tsx

import { type Dispatch } from 'react'
import { type ParamsState, type Action } from '../Edit'

function ProfileSetting({ state, dispatch }: { state: ParamsState, dispatch: Dispatch<Action> }) {
  // SET_NAME
  const onSetName = (name: string) => {
    // 発火
    dispatch({ type: 'SET_NAME', payload: { name } })
  }

  // SET_GENDER
  const onSetGender = (gender: string) => {
    // 発火
    dispatch({ type: 'SET_GENDER', payload: { gender } })
  }

  // AUTO_NAME
  const autoName = () => {
    // 発火
    dispatch({ type: 'AUTO_NAME', payload: { gender: state.gender } })
  }

  return (
    <section>
      <h4>3. プロフィールの設定</h4>
      <div>
        <label className="inline-block w-24 sm:text-right">名前: </label>
        <input className="w-72 m-6 px-3 text-left" type="text" value={state.name} onChange={(e) => onSetName(e.target.value)} />
        <button className="block sm:inline-block w-24 h-6 m-auto text-sm/1" onClick={autoName}>自動決定</button>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">性別: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.gender} onChange={(e) => onSetGender(e.target.value)}>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
        </select>
      </div>
    </section>
  )
}

export default ProfileSetting
