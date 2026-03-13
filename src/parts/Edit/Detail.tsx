import { type Character } from '../../lib/domains/Character'

function Detail({ unit }: { unit: Character }) {
  return (
    <>
      <div className="row justify-around">
        <div className="summary">
          <h4 className="mt-12 mb-6 italic text-lg">Profile</h4>
          <div className="grid grid-cols-[40%_60%] w-90 my-6">
            <div className="text-left">{'Name (名前)'}</div><div>{unit.name}</div>
            <div className="text-left">{'Gender (性別)'}</div><div>{unit.gender}</div>
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Abilities</h4>
          <div className="grid grid-cols-[40%_15%_45%] w-90 my-6">
            <div className="text-left">{'ST (筋力)'}</div><div>{unit.getParamLevel('筋力')}</div><div>{unit.getParam('筋力')}CP</div>
            <div className="text-left">{'DX (敏捷力)'}</div><div>{unit.getParamLevel('敏捷力')}</div><div>{unit.getParam('敏捷力')}CP</div>
            <div className="text-left">{'IN (知力)'}</div><div>{unit.getParamLevel('知力')}</div><div>{unit.getParam('知力')}CP</div>
            <div className="text-left">{'HT (生命力)'}</div><div>{unit.getParamLevel('生命力')}</div><div>{unit.getParam('生命力')}CP</div>
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Battle Abilities</h4>
          <div className="grid grid-cols-[40%_15%_45%] w-90 my-6">
            <div className="text-left">{'Dmg (ダメージ)'}</div><div>{unit.getDmgModifier()}</div><div>{'{ 怪力 / 2 } - 5'}</div>
            <div className="text-left">{'D-EV (よけ)'}</div><div>{unit.getDEV()}</div><div>{'{ 運動 / 2 } + 5'}</div>
            <div className="text-left">{'HP (耐久点)'}</div><div>{unit.getMaxHP()}</div><div>{'{ 鍛錬 * 2 } '}</div>
            <div className="text-left">{'RE (抵抗力)'}</div><div>{unit.getRE()}</div><div>{'{ 修養 }'}</div>
          </div>
        </div>
        <div className='details'>
          <h4 className="mt-12 mb-6 italic text-lg">Skills</h4>
          <div className="grid grid-cols-[50%_50%] w-180 mt-6 mb-24">
            {Array.from(unit.getAllSkills()).map(([key, value]) => (
              <div className="grid grid-cols-[32%_16%_32%_20%]" key={key}>
                <div className="text-left">{key}</div><div>{unit.getParamLevel(key)}</div><div>{value.point}CP</div><div>&nbsp;</div>
              </div>
            ))}
            {Array.from(unit.getAllSkills()).length % 2 === 1 && (
              <div className="grid grid-cols-4">
                <div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div>
              </div>
            )}
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Equipments</h4>
          <div className="grid grid-cols-[30%_30%_20%_20%] my-6 text-left">
            {unit.getMainUsage().id !== 0 && (
              <>
                <div>{unit.getMainUsage().name}</div>
                <div>{`Dmg: ${unit.getDmgName()}`}</div>
                <div>{`Lv: ${unit.getLevel()}`}</div>
                <div>{`P-EV: ${unit.getMainUsage().ev}`}</div>
              </>
            )}
            {unit.getSubUsage().id !== 0 && (
              <>
                <div>{unit.getSubUsage().name}</div>
                <div>{`Dmg: ${unit.getDmgName('sub')}`}</div>
                <div>{`Lv: ${unit.getLevel('sub')}`}</div>
                <div>{`P-EV: ${unit.getSubUsage().ev}`}</div>
              </>
            )}
            {unit.getMissile().id !== 0 && (
              <>
                <div>{unit.getMissile().name}</div>
                <div>{`Dmg: ${unit.getDmgName('missile')}`}</div>
                <div>{`Lv: ${unit.getLevel('missile')}`}</div>
                <div>{`B-EV: ${unit.getMissile().ev}`}</div>
              </>
            )}
            {unit.getShield().id !== 0 && (
              <>
                <div>{unit.getShield().name}</div>
                <div>{`Dmg: ${unit.getDmgName('shield')}`}</div>
                <div>{`Lv: ${unit.getLevel('shield')}`}</div>
                <div>{`B-EV: ${unit.getShield().ev}`}</div>
              </>
            )}
            <div>{unit.getBodyArmor().name}</div>
            <div>{`DR: ${unit.getBodyArmor().dr}`}</div>
            <div>{`WT: ${unit.getBodyArmor().wt}`}</div>
            <div>{`D-EV: ${unit.getDEV()}`}</div>
            {unit.getHeadArmor().id !== 0 && (
              <>
                <div>{unit.getHeadArmor().parts[0]}</div>
                <div>{`DR: ${unit.getHeadArmor().dr}`}</div>
                <div>{`WT: ${unit.getHeadArmor().wt}`}</div>
                <div>-</div>
              </>
            )}
            {unit.getArmArmor().id !== 0 && (
              <>
                <div>{unit.getArmArmor().parts[1]}</div>
                <div>{`DR: ${unit.getArmArmor().dr}`}</div>
                <div>{`WT: ${unit.getArmArmor().wt}`}</div>
                <div>-</div>
              </>
            )}
            {unit.getLegArmor().id !== 0 && (
              <>
                <div>{unit.getLegArmor().parts[2]}</div>
                <div>{`DR: ${unit.getLegArmor().dr}`}</div>
                <div>{`WT: ${unit.getLegArmor().wt}`}</div>
                <div>-</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Detail
