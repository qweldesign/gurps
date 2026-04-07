// common/Detail.tsx

import { Fragment } from 'react'
import { type Weapon, type Armor, type WeaponSlotKey, type ArmorSlotKey } from '../../domains/Equipments'
import { type Character } from '../../domains/Character'

function Detail({ unit }: { unit: Character }) {
  return (
    <div className="row justify-around">
      <div className="w-1/1 max-w-sm">
        <h4 className="mt-12 mb-6 font-serif italic text-lg before:content-['-'] before:pe-3">Profile</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[45%_55%] w-sm my-6 border-t border-white">
            <div className="cell">{'Name (名前)'}</div><div className="cell">{unit.name}</div>
            <div className="cell">{'Gender (性別)'}</div><div className="cell">{unit.gender}</div>
          </div>
        </div>
        <h4 className="mt-12 mb-6 font-serif italic text-lg before:content-['-'] before:pe-3">Abilities</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[45%_10%_45%] w-sm my-6 border-t border-white">
            <div className="cell">{'ST (筋力)'}</div><div className="cell">{unit.getParamLevel('筋力')}</div><div className="cell">{unit.getParam('筋力')}CP</div>
            <div className="cell">{'DX (敏捷力)'}</div><div className="cell">{unit.getParamLevel('敏捷力')}</div><div className="cell">{unit.getParam('敏捷力')}CP</div>
            <div className="cell">{'IN (知力)'}</div><div className="cell">{unit.getParamLevel('知力')}</div><div className="cell">{unit.getParam('知力')}CP</div>
            <div className="cell">{'HT (生命力)'}</div><div className="cell">{unit.getParamLevel('生命力')}</div><div className="cell">{unit.getParam('生命力')}CP</div>
          </div>
        </div>
        <h4 className="mt-12 mb-6 font-serif italic text-lg before:content-['-'] before:pe-3">Battle Abilities</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[45%_10%_45%] w-sm my-6 border-t border-white">
            <div className="cell">{'Dmg (ダメージ)'}</div><div className="cell">{unit.dmgModifier}</div><div className="cell">{'{ 怪力 / 2 } - 5'}</div>
            <div className="cell">{'D-EV (よけ)'}</div><div className="cell">{unit.DEV}</div><div className="cell">{'{ 運動 / 2 } + 5'}</div>
            <div className="cell">{'HP (耐久点)'}</div><div className="cell">{unit.maxHp}</div><div className="cell">{'{ 鍛錬 * 2 } '}</div>
            <div className="cell">{'RE (抵抗力)'}</div><div className="cell">{unit.MRE}</div><div className="cell">{'{ 修養 }'}</div>
          </div>
        </div>
      </div>
      <div className="w-1/1 max-w-2xl">
        <h4 className="mt-12 mb-6 font-serif italic text-lg before:content-['-'] before:pe-3">Skills</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[50%_50%] w-2xl mt-6 mb-24 border-t border-white">
            {unit.skills.map((skill, i) => (
              <div className="grid grid-cols-[32%_16%_32%_20%]" key={i}>
                <div className="cell">{skill.name}</div><div className="cell">{skill.level}</div><div className="cell">{skill.point}CP</div><div className="cell">&nbsp;</div>
              </div>
            ))}
            {unit.skills.length % 2 === 1 && (
              <div className="grid grid-cols-4">
                <div className="cell">&nbsp;</div><div className="cell">&nbsp;</div><div className="cell">&nbsp;</div><div className="cell">&nbsp;</div>
              </div>
            )}
          </div>
        </div>
        <h4 className="mt-12 mb-6 font-serif italic text-lg before:content-['-'] before:pe-3">Equipments</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[30%_30%_20%_20%] w-2xl my-6 text-left">
            {(Object.entries(unit.weapons) as [WeaponSlotKey, Weapon][])
              .map(([key, weapon]) => (weapon.id !== 0 && (
                <Fragment key={key}>
                  <div className="cell">{weapon.name}</div>
                  <div className="cell">{`Dmg: ${unit.getDmgName(key)}`}</div>
                  <div className="cell">{`Lv: ${unit.getLevel(key)}`}</div>
                  <div className="cell">{`P-EV: ${weapon.ev}`}</div>
                </Fragment>
              )))
            }
            {(Object.entries(unit.armors) as [ArmorSlotKey, Armor][])
              .map(([key, armor], i) => (armor.id !== 0 && (
                <Fragment key={key}>
                  <div className="cell">{armor.name[i]}</div>
                  <div className="cell">{`DR: ${armor.dr}`}</div>
                  <div className="cell">{`WT: ${armor.wt}`}</div>
                  {key === 'body' ? (
                    <div className="cell">{`D-EV: ${unit.DEV}`}</div>
                  ) : (
                    <div className="cell">&nbsp;</div>
                  )}
                </Fragment>
              )))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Detail
