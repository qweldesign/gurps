import { type Character } from '../../domains/Character'

function Detail({ unit }: { unit: Character }) {
  return (
    <div className="row justify-around">
      <div className="w-1/1 max-w-sm">
        <h4 className="mt-12 mb-6 italic text-lg">Profile</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[45%_55%] w-sm my-6">
            <div className="text-left">{'Name (名前)'}</div><div>{unit.name}</div>
            <div className="text-left">{'Gender (性別)'}</div><div>{unit.gender}</div>
          </div>
        </div>
        <h4 className="mt-12 mb-6 italic text-lg">Abilities</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[45%_10%_45%] w-sm my-6">
            <div className="text-left">{'ST (筋力)'}</div><div>{unit.getParamLevel('筋力')}</div><div>{unit.getParam('筋力')}CP</div>
            <div className="text-left">{'DX (敏捷力)'}</div><div>{unit.getParamLevel('敏捷力')}</div><div>{unit.getParam('敏捷力')}CP</div>
            <div className="text-left">{'IN (知力)'}</div><div>{unit.getParamLevel('知力')}</div><div>{unit.getParam('知力')}CP</div>
            <div className="text-left">{'HT (生命力)'}</div><div>{unit.getParamLevel('生命力')}</div><div>{unit.getParam('生命力')}CP</div>
          </div>
        </div>
        <h4 className="mt-12 mb-6 italic text-lg">Battle Abilities</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[45%_10%_45%] w-sm my-6">
            <div className="text-left">{'Dmg (ダメージ)'}</div><div>{unit.dmgModifier}</div><div>{'{ 怪力 / 2 } - 5'}</div>
            <div className="text-left">{'D-EV (よけ)'}</div><div>{unit.DEV}</div><div>{'{ 運動 / 2 } + 5'}</div>
            <div className="text-left">{'HP (耐久点)'}</div><div>{unit.maxHP}</div><div>{'{ 鍛錬 * 2 } '}</div>
            <div className="text-left">{'RE (抵抗力)'}</div><div>{unit.MRE}</div><div>{'{ 修養 }'}</div>
          </div>
        </div>
      </div>
      <div className="w-1/1 max-w-2xl">
        <h4 className="mt-12 mb-6 italic text-lg">Skills</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[50%_50%] w-2xl mt-6 mb-24">
            {unit.skills.map(([key, value]) => (
              <div className="grid grid-cols-[32%_16%_32%_20%]" key={key}>
                <div className="text-left">{key}</div><div>{unit.getParamLevel(key)}</div><div>{value.point}CP</div><div>&nbsp;</div>
              </div>
            ))}
            {unit.skills.length % 2 === 1 && (
              <div className="grid grid-cols-4">
                <div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div>
              </div>
            )}
          </div>
        </div>
        <h4 className="mt-12 mb-6 italic text-lg">Equipments</h4>
        <div className="table-wrapper">
          <div className="grid grid-cols-[30%_30%_20%_20%] w-2xl my-6 text-left">
            {unit.mainUsage.id !== 0 && (
              <>
                <div>{unit.mainUsage.name}</div>
                <div>{`Dmg: ${unit.getDmgName()}`}</div>
                <div>{`Lv: ${unit.getLevel()}`}</div>
                <div>{`P-EV: ${unit.mainUsage.ev}`}</div>
              </>
            )}
            {unit.subUsage.id !== 0 && (
              <>
                <div>{unit.subUsage.name}</div>
                <div>{`Dmg: ${unit.getDmgName('sub')}`}</div>
                <div>{`Lv: ${unit.getLevel('sub')}`}</div>
                <div>{`P-EV: ${unit.subUsage.ev}`}</div>
              </>
            )}
            {unit.spare.id !== 0 && (
              <>
                <div>{unit.spare.name}</div>
                <div>{`Dmg: ${unit.getDmgName('spare')}`}</div>
                <div>{`Lv: ${unit.getLevel('spare')}`}</div>
                <div>{`B-EV: ${unit.spare.ev}`}</div>
              </>
            )}
            {unit.shield.id !== 0 && (
              <>
                <div>{unit.shield.name}</div>
                <div>{`Dmg: ${unit.getDmgName('shield')}`}</div>
                <div>{`Lv: ${unit.getLevel('shield')}`}</div>
                <div>{`B-EV: ${unit.shield.ev}`}</div>
              </>
            )}
            <div>{unit.body.name}</div>
            <div>{`DR: ${unit.body.dr}`}</div>
            <div>{`WT: ${unit.body.wt}`}</div>
            <div>{`D-EV: ${unit.DEV}`}</div>
            {unit.head.id !== 0 && (
              <>
                <div>{unit.head.parts[0]}</div>
                <div>{`DR: ${unit.head.dr}`}</div>
                <div>{`WT: ${unit.head.wt}`}</div>
                <div>-</div>
              </>
            )}
            {unit.arm.id !== 0 && (
              <>
                <div>{unit.arm.parts[1]}</div>
                <div>{`DR: ${unit.arm.dr}`}</div>
                <div>{`WT: ${unit.arm.wt}`}</div>
                <div>-</div>
              </>
            )}
            {unit.leg.id !== 0 && (
              <>
                <div>{unit.leg.parts[2]}</div>
                <div>{`DR: ${unit.leg.dr}`}</div>
                <div>{`WT: ${unit.leg.wt}`}</div>
                <div>-</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Detail
