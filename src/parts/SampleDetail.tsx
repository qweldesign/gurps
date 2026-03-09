import { Link } from 'react-router-dom'
import { createSample } from '../lib/sample/create-sample'

function SampleDetail({ id, points, size }: { id: number, points: number, size: number }) {
  const sample = createSample(id, points, size)

  return (
    <>
      <div className="row justify-around">
        <div className="summary">
          <h4 className="mt-12 mb-6 italic text-lg">Profile</h4>
          <div className="grid grid-cols-[50%_50%] w-60 my-6">
            <div className="text-left">Name</div><div>{sample.name}</div>
            <div className="text-left">Gender</div><div>{sample.gender}</div>
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Abilities</h4>
          <div className="grid grid-cols-[40%_20%_40%] w-60 my-6">
            <div className="text-left">HP</div><div>{sample.getMaxHP()}</div><div>{sample.getParam('鍛錬')}CP</div>
            <div className="text-left">ST</div><div>{sample.getParamLevel('筋力')}</div><div>{sample.getParam('筋力')}CP</div>
            <div className="text-left">DX</div><div>{sample.getParamLevel('敏捷力')}</div><div>{sample.getParam('敏捷力')}CP</div>
            <div className="text-left">IN</div><div>{sample.getParamLevel('知力')}</div><div>{sample.getParam('知力')}CP</div>
            <div className="text-left">HT</div><div>{sample.getParamLevel('生命力')}</div><div>{sample.getParam('生命力')}CP</div>
          </div>
        </div>
        <div className='details'>
          <h4 className="mt-12 mb-6 italic text-lg">Skills</h4>
          <div className="grid grid-cols-[50%_50%] w-180 mt-6 mb-24">
            {Array.from(sample.getAllSkills()).map(([key, value]) => (
              <div className="grid grid-cols-[32%_16%_32%_20%]" key={key}>
                <div className="text-left">{key}</div><div>{sample.getParamLevel(key)}</div><div>{value.point}CP</div><div>&nbsp;</div>
              </div>
            ))}
            {Array.from(sample.getAllSkills()).length % 2 === 1 && (
              <div className="grid grid-cols-4">
                <div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div>
              </div>
            )}
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Equipments</h4>
          <div className="grid grid-cols-[30%_30%_20%_20%] my-6 text-left">
            {sample.getMainUsage().id !== 0 && (
              <>
                <div>{sample.getMainUsage().name}</div>
                <div>{`Dmg: ${sample.getDmgName()}`}</div>
                <div>{`Lv: ${sample.getLevel()}`}</div>
                <div>{`P-EV: ${sample.getMainUsage().ev}`}</div>
              </>
            )}
            {sample.getSubUsage() && (
              <>
                <div>{sample.getSubUsage()!.name}</div>
                <div>{`Dmg: ${sample.getDmgName('sub')}`}</div>
                <div>{`Lv: ${sample.getLevel('sub')}`}</div>
                <div>{`P-EV: ${sample.getSubUsage()!.ev}`}</div>
              </>
            )}
            {sample.getMissile() && (
              <>
                <div>{sample.getMissile()!.name}</div>
                <div>{`Dmg: ${sample.getDmgName('missile')}`}</div>
                <div>{`Lv: ${sample.getLevel('missile')}`}</div>
                <div>{`B-EV: ${sample.getMissile()!.ev}`}</div>
              </>
            )}
            {sample.getShield() && (
              <>
                <div>{sample.getShield()!.name}</div>
                <div>{`Dmg: ${sample.getDmgName('shield')}`}</div>
                <div>{`Lv: ${sample.getLevel('shield')}`}</div>
                <div>{`B-EV: ${sample.getShield()!.ev}`}</div>
              </>
            )}
            <div>{sample.getBodyArmor().name}</div>
            <div>{`DR: ${sample.getBodyArmor().dr}`}</div>
            <div>{`WT: ${sample.getBodyArmor().wt}`}</div>
            <div>{`D-EV: ${sample.getDEV()}`}</div>
            {sample.getHeadArmor() && (
              <>
                <div>{sample.getHeadArmor()!.parts[0]}</div>
                <div>{`DR: ${sample.getHeadArmor()!.dr}`}</div>
                <div>{`WT: ${sample.getHeadArmor()!.wt}`}</div>
                <div>-</div>
              </>
            )}
            {sample.getArmArmor() && (
              <>
                <div>{sample.getArmArmor()!.parts[1]}</div>
                <div>{`DR: ${sample.getArmArmor()!.dr}`}</div>
                <div>{`WT: ${sample.getArmArmor()!.wt}`}</div>
                <div>-</div>
              </>
            )}
            {sample.getLegArmor() && (
              <>
                <div>{sample.getLegArmor()!.parts[2]}</div>
                <div>{`DR: ${sample.getLegArmor()!.dr}`}</div>
                <div>{`WT: ${sample.getLegArmor()!.wt}`}</div>
                <div>-</div>
              </>
            )}
          </div>
        </div>
      </div>
      <Link className="ms-12 italic" to="/sample/">&lt; Back to list</Link>
    </>
  )
}

export default SampleDetail
