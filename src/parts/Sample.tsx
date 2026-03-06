import { useState } from 'react'
import { useParams } from 'react-router-dom'
import SampleList from './SampleList'
import SampleDetail from './SampleDetail'

function Sample({ size = 96 }: { size?: number }) {
  const [points, setPoints] = useState(10)
  const { sampleId } = useParams()

  return (
    <>
      <label>CP: </label>
      <select className="my-6" onChange={(e) => setPoints(Number(e.target.value))}>
        <option value="10">10</option>
        <option value="12">12</option>
        <option value="16">16</option>
        <option value="24">24</option>
        <option value="40">40</option>
      </select>
      {sampleId ? <SampleDetail id={Number(sampleId)} points={points} size={size} /> : <SampleList points={points} size={size} />}
    </>
  )
}

export default Sample
