// Setup/Edit/EquipmentsSetting.tsx

import { type Dispatch } from 'react'
import { type ParamsState, type Action } from '../Edit'

function EquipmentsSetting({ isFirstCreation, state, dispatch, calcGold }: { isFirstCreation: boolean, state: ParamsState, dispatch: Dispatch<Action>, calcGold: (state: ParamsState, isMax: boolean) => number }) {
  // CHANGE_EQUIP
  const onChangeEquip = (slot: 'weapon' | 'spare' | 'shield' | 'body' | 'head' | 'arm' | 'leg', name: string) => {
    // 発火
    dispatch({ type: 'CHANGE_EQUIP', payload: { slot, name } }) 
  }
  
  return (
    <section>
      {isFirstCreation && (
        <>
          <h4>2. 装備の購入</h4>
          <p>合計{calcGold(state, true)}金の所持金でキャラクターの装備を購入します。</p>
        </>
      )}
      <h5>残り所持金: <span className={calcGold(state, false) < 0 ? 'text-red-600 font-bold' : 'font-bold'}>{calcGold(state, false)} 金</span></h5>
      <div>
        <label className="inline-block w-24 sm:text-right">主用武器: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.weapon.name} onChange={(e) => onChangeEquip('weapon', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.weaponList.filter(([, weapon]) => (
            // 格闘, 盾を除く
            weapon.weaponType !== 0 && weapon.weaponType !== 6
          )).map(([, weapon], i) => (
            <option key={i} value={weapon.name}>{`${weapon.name} | 性能:${weapon.baseDmg / 2} (${weapon.gold}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.weapon.name === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.weapon.name} を売却 (${Math.floor(state.saleEquips.weapon.gold / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">予備武器: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.spare.name} onChange={(e) => onChangeEquip('spare', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.weaponList.filter(([, weapon]) => (
            // 予備武器のみを取り出す
            weapon.skill === '剣術'
          )).map(([, weapon], i) => (
            <option key={i} value={weapon.name}>{`${weapon.name} | 性能:${weapon.baseDmg / 2} (${weapon.gold}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.spare.name === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.spare.name} を売却 (${Math.floor(state.saleEquips.spare.gold / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">盾: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.shield.name} onChange={(e) => onChangeEquip('shield', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.weaponList.filter(([, weapon]) => (
            // 盾のみを取り出す
            weapon.weaponType === 6
          )).map(([, weapon], i) => (
            <option key={i} value={weapon.name}>{`${weapon.name} | 性能:${weapon.ev} (${weapon.gold}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.shield.name === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.shield.name} を売却 (${Math.floor(state.saleEquips.shield.gold / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">胴防具: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.body.name[0]} onChange={(e) => onChangeEquip('body', e.target.value)}>
          {state.armorList.filter(([, armor]) => armor.id !== 0).map(([, armor], i) => (
            <option key={i} value={armor.name[0]}>{`${armor.name[0]} | 性能:${armor.sdr} (${armor.gold * 0.5}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.body.name[0] === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.body.name[0]} を売却 (${Math.floor(state.saleEquips.body.gold * 0.5 / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">頭防具: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.head.name[1]!} onChange={(e) => onChangeEquip('head', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.armorList.filter(([, armor]) => armor.id !== 0 && armor.name[1] !== null).map(([, armor], i) => (
            <option key={i} value={armor.name[1]!}>{`${armor.name[1]} | 性能:${armor.sdr} (${armor.gold * 0.25}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.head.name[1] === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.head.name[1]} を売却 (${Math.floor(state.saleEquips.head.gold * 0.25 / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">腕防具: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.arm.name[2]!} onChange={(e) => onChangeEquip('arm', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.armorList.filter(([, armor]) => armor.id !== 0 && armor.name[2] !== null).map(([, armor], i) => (
            <option key={i} value={armor.name[2]!}>{`${armor.name[2]} | 性能:${armor.sdr} (${armor.gold * 0.1}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.arm.name[2] === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.arm.name[2]} を売却 (${Math.floor(state.saleEquips.arm.gold * 0.1 / 2)}金)`}</span>
        </div>
      </div>
      <div>
        <label className="inline-block w-24 sm:text-right">脚防具: </label>
        <select className="w-72 m-6 px-3 text-left" value={state.equips.leg.name[3]!} onChange={(e) => onChangeEquip('leg', e.target.value)}>
          <option value="装備無し">装備無し</option>
          {state.armorList.filter(([, armor]) => armor.id !== 0 && armor.name[3] !== null).map(([, armor], i) => (
            <option key={i} value={armor.name[3]!}>{`${armor.name[3]} | 性能:${armor.sdr} (${armor.gold * 0.15}金)`}</option>
          ))}
        </select>
        <div className={state.saleEquips.leg.name[3] === '装備無し' ? 'hidden' : 'inline-block'}>
          <span>{`${state.saleEquips.leg.name[3]} を売却 (${Math.floor(state.saleEquips.leg.gold * 0.15 / 2)}金)`}</span>
        </div>
      </div>
    </section>
  )
}

export default EquipmentsSetting
