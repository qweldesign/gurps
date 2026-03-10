import { useState } from 'react'
import { useParams } from 'react-router-dom'
import List from './Sample/List'
import Detail from './Sample/Detail'
import { createSamples } from '../lib/domains/SampleCharacter'

function Sample() {
  const [points, setPoints] = useState(10)
  const { sampleId } = useParams()

  const samples = createSamples(points)

  return (
    <>
      <label>CP: </label>
      <select className="my-6" onChange={(e) => setPoints(Number(e.target.value))}>
        <option value="10">10</option>
        <option value="12">12</option>
        <option value="16">16</option>
        <option value="24">24</option>
        <option value="40">40</option>
        <option value="64">64</option>
      </select>
      {!sampleId
        ? <List samples={samples} />
        : <Detail sample={samples.find(m => m.id === Number(sampleId))!} />
      }
    </>
  )
}

export default Sample
