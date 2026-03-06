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
            <div className="text-left">HP</div><div>{sample.getParamValue('鍛錬') * 2}</div><div>{sample.getParam('鍛錬')}CP</div>
            <div className="text-left">ST</div><div>{sample.getParamValue('筋力')}</div><div>{sample.getParam('筋力')}CP</div>
            <div className="text-left">DX</div><div>{sample.getParamValue('敏捷力')}</div><div>{sample.getParam('敏捷力')}CP</div>
            <div className="text-left">IN</div><div>{sample.getParamValue('知力')}</div><div>{sample.getParam('知力')}CP</div>
            <div className="text-left">HT</div><div>{sample.getParamValue('生命力')}</div><div>{sample.getParam('生命力')}CP</div>
          </div>
        </div>
        <div className='details'>
          <h4 className="mt-12 mb-6 italic text-lg">Skills</h4>
          <div className="grid grid-cols-[50%_50%] w-180 mt-6 mb-24">
            {Array.from(sample.getSkills()).map(([key, value]) => (
              <div className="grid grid-cols-[32%_16%_32%_20%]" key={key}>
                <div className="text-left">{key}</div><div>{sample.getParamValue(key)}</div><div>{value}CP</div><div>&nbsp;</div>
              </div>
            ))}
            {Array.from(sample.getSkills()).length % 2 === 1 && (
              <div className="grid grid-cols-4">
                <div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div><div>&nbsp;</div>
              </div>
            )}
          </div>
          <h4 className="mt-12 mb-6 italic text-lg">Equipments</h4>
          <div className="grid my-6"></div>
        </div>
      </div>
      <Link className="ms-12 italic" to="/sample/">&lt; Back to list</Link>
    </>
  )
}

export default SampleDetail
