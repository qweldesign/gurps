import { Link } from 'react-router-dom'
import { type Character } from '../../lib/domains/Character'

function Detail({ model }: { model: Character }) {
  return (
    <>
      <div className="row justify-around">
        <div className="summary">
          <h4 className="mt-12 mb-6 italic text-lg">Profile</h4>
          <div className="grid grid-cols-[40%_60%] w-90 my-6">
            <div className="text-left">{'Name (名前)'}</div><div>{model.name}</div>
            <div className="text-left">{'Gender (性別)'}</div><div>{model.gender}</div>
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Abilities</h4>
          <div className="grid grid-cols-[40%_15%_45%] w-90 my-6">
            <div className="text-left">{'ST (筋力)'}</div><div>{model.getParamLevel('筋力')}</div><div>{model.getParam('筋力')}CP</div>
            <div className="text-left">{'DX (敏捷力)'}</div><div>{model.getParamLevel('敏捷力')}</div><div>{model.getParam('敏捷力')}CP</div>
            <div className="text-left">{'IN (知力)'}</div><div>{model.getParamLevel('知力')}</div><div>{model.getParam('知力')}CP</div>
            <div className="text-left">{'HT (生命力)'}</div><div>{model.getParamLevel('生命力')}</div><div>{model.getParam('生命力')}CP</div>
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Battle Abilities</h4>
          <div className="grid grid-cols-[40%_15%_45%] w-90 my-6">
            <div className="text-left">{'Dmg (ダメージ)'}</div><div>{model.getDmgModifier()}</div><div>{'{ 怪力 / 2 } - 5'}</div>
            <div className="text-left">{'D-EV (よけ)'}</div><div>{model.getDEV()}</div><div>{'{ 運動 / 2 } + 5'}</div>
            <div className="text-left">{'HP (耐久点)'}</div><div>{model.getMaxHP()}</div><div>{'{ 鍛錬 * 2 } '}</div>
            <div className="text-left">{'RE (抵抗力)'}</div><div>{model.getRE()}</div><div>{'{ 修養 }'}</div>
          </div>
        </div>
        <div className='details'>
          <h4 className="mt-12 mb-6 italic text-lg">Skills</h4>
          <div className="grid grid-cols-[50%_50%] w-180 mt-6 mb-24">
            {Array.from(model.getAllSkills()).map(([key, value]) => (
              <div className="grid grid-cols-[32%_16%_32%_20%]" key={key}>
                <div className="text-left">{key}</div><div>{model.getParamLevel(key)}</div><div>{value.point}CP</div><div>&nbsp;</div>
              </div>
            ))}
            {Array.from(model.getAllSkills()).length % 2 === 1 && (
              <div className="grid grid-cols-4">
                <div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div>
              </div>
            )}
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Equipments</h4>
          <div className="grid grid-cols-[30%_30%_20%_20%] my-6 text-left">
            {model.getMainUsage().id !== 0 && (
              <>
                <div>{model.getMainUsage().name}</div>
                <div>{`Dmg: ${model.getDmgName()}`}</div>
                <div>{`Lv: ${model.getLevel()}`}</div>
                <div>{`P-EV: ${model.getMainUsage().ev}`}</div>
              </>
            )}
            {model.getSubUsage().id !== 0 && (
              <>
                <div>{model.getSubUsage().name}</div>
                <div>{`Dmg: ${model.getDmgName('sub')}`}</div>
                <div>{`Lv: ${model.getLevel('sub')}`}</div>
                <div>{`P-EV: ${model.getSubUsage().ev}`}</div>
              </>
            )}
            {model.getMissile().id !== 0 && (
              <>
                <div>{model.getMissile().name}</div>
                <div>{`Dmg: ${model.getDmgName('missile')}`}</div>
                <div>{`Lv: ${model.getLevel('missile')}`}</div>
                <div>{`B-EV: ${model.getMissile().ev}`}</div>
              </>
            )}
            {model.getShield().id !== 0 && (
              <>
                <div>{model.getShield().name}</div>
                <div>{`Dmg: ${model.getDmgName('shield')}`}</div>
                <div>{`Lv: ${model.getLevel('shield')}`}</div>
                <div>{`B-EV: ${model.getShield().ev}`}</div>
              </>
            )}
            <div>{model.getBodyArmor().name}</div>
            <div>{`DR: ${model.getBodyArmor().dr}`}</div>
            <div>{`WT: ${model.getBodyArmor().wt}`}</div>
            <div>{`D-EV: ${model.getDEV()}`}</div>
            {model.getHeadArmor().id !== 0 && (
              <>
                <div>{model.getHeadArmor().parts[0]}</div>
                <div>{`DR: ${model.getHeadArmor().dr}`}</div>
                <div>{`WT: ${model.getHeadArmor().wt}`}</div>
                <div>-</div>
              </>
            )}
            {model.getArmArmor().id !== 0 && (
              <>
                <div>{model.getArmArmor().parts[1]}</div>
                <div>{`DR: ${model.getArmArmor().dr}`}</div>
                <div>{`WT: ${model.getArmArmor().wt}`}</div>
                <div>-</div>
              </>
            )}
            {model.getLegArmor().id !== 0 && (
              <>
                <div>{model.getLegArmor().parts[2]}</div>
                <div>{`DR: ${model.getLegArmor().dr}`}</div>
                <div>{`WT: ${model.getLegArmor().wt}`}</div>
                <div>-</div>
              </>
            )}
          </div>
        </div>
      </div>
      <Link className="ms-12 italic" to="/edit/">&lt; Back to list</Link>
    </>
  )
}

export default Detail
