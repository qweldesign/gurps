import { type Dispatch } from 'react'
import { type ParamsState, type Action } from '../Edit'

function EquipmentsSetting({ isFirstCreation, state, dispatch, calcGold }: { isFirstCreation: boolean, state: ParamsState, dispatch: Dispatch<Action>, calcGold: (state: ParamsState, isMax: boolean) => number }) {
  // CHANGE_EQUIP
  const onChangeEquip = (slot: 'weapon' | 'missile' | 'shield' | 'body' | 'head' | 'arm' | 'leg', name: string) => {
    // 発火
    dispatch({ type: 'CHANGE_EQUIP', payload: { slot, name } }) 
  }
  
  return (
    <section>
      {isFirstCreation && (
        <>
          <h4>3. 装備の購入</h4>
          <p>合計{calcGold(state, true)}金の所持金でキャラクターの装備を購入します。</p>
        </>
      )}
      <h5>残り所持金: <span className={calcGold(state, false) < 0 ? 'text-red-600 font-bold' : 'font-bold'}>{calcGold(state, false)} 金</span></h5>
      <div>
        <label className="inline-block w-24 sm:text-right">主用武器: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.weapon.name} onChange={(e) => onChangeEquip('weapon', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.weaponList.filter(item => (
            // 格闘, 射撃, 盾を除く
            item.weaponType !== 0 && item.weaponType !== 5 && item.weaponType !== 6
          )).map((item, i) => (
            <option key={i} value={item.name}>{`${item.name} | 性能:${item.baseDmg / 2} (${item.gold}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.weapon.name === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.weapon.name} を売却 (${Math.floor(state.saleEquips.weapon.gold / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">射撃武器: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.missile.name} onChange={(e) => onChangeEquip('missile', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.weaponList.filter(item => (
            // 射撃武器のみを取り出す
            item.weaponType === 5
          )).map((item, i) => (
            <option key={i} value={item.name}>{`${item.name} | 性能:${item.baseDmg / 2} (${item.gold}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.missile.name === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.missile.name} を売却 (${Math.floor(state.saleEquips.missile.gold / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">盾: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.shield.name} onChange={(e) => onChangeEquip('shield', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.weaponList.filter(item => (
            // 盾のみを取り出す
            item.weaponType === 6
          )).map((item, i) => (
            <option key={i} value={item.name}>{`${item.name} | 性能:${item.ev} (${item.gold}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.shield.name === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.shield.name} を売却 (${Math.floor(state.saleEquips.shield.gold / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">胴防具: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.body.name} onChange={(e) => onChangeEquip('body', e.target.value)}>
          {state.armorList.filter(item => item.id !== 0).map((item, i) => (
            <option key={i} value={item.name}>{`${item.name} | 性能:${item.sdr} (${item.gold * 0.5}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.body.name === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.body.name} を売却 (${Math.floor(state.saleEquips.body.gold * 0.5 / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">頭防具: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.head.parts[0]!} onChange={(e) => onChangeEquip('head', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.armorList.filter(item => (
            item.id !== 0 && item.parts[0]
          )).map((item, i) => (
            <option key={i} value={item.parts[0]!}>{`${item.parts[0]} | 性能:${item.sdr} (${item.gold * 0.25}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.head.parts[0] === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.head.parts[0]} を売却 (${Math.floor(state.saleEquips.head.gold * 0.25 / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">腕防具: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.arm.parts[1]!} onChange={(e) => onChangeEquip('arm', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.armorList.filter(item => (
            item.id !== 0 && item.parts[1]
          )).map((item, i) => (
            <option key={i} value={item.parts[1]!}>{`${item.parts[1]} | 性能:${item.sdr} (${item.gold * 0.1}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.arm.parts[1] === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.arm.parts[1]} を売却 (${Math.floor(state.saleEquips.arm.gold * 0.1 / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">脚防具: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.leg.parts[2]!} onChange={(e) => onChangeEquip('leg', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.armorList.filter(item => (
            item.id !== 0 && item.parts[2]
          )).map((item, i) => (
            <option key={i} value={item.parts[2]!}>{`${item.parts[2]} | 性能:${item.sdr} (${item.gold * 0.15}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.leg.parts[2] === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.leg.parts[2]} を売却 (${Math.floor(state.saleEquips.leg.gold * 0.15 / 2)}金)`}</span>
        </div>
      </div>
    </section>
  )
}

export default EquipmentsSetting
