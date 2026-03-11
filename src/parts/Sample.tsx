import { useState } from 'react'
import { useParams } from 'react-router-dom'
import List from './Sample/List'
import Detail from './Sample/Detail'
import { type Multiplier, createSamples } from '../lib/domains/SampleCharacter'

function Sample() {
  const [points, setPoints] = useState(10)
  const [multiplier, setMultiplier] = useState<Multiplier>(1)
  const { sampleId } = useParams()

  const updatePoints = (value: string) => {
    const [p, m] = value.split('/')
    setPoints(Number(p))
    setMultiplier(Number(m) as Multiplier)
  }

  const samples = createSamples(points, multiplier)

  return (
    <>
      <label>CP: </label>
      <select className="w-48 m-6 ps-3 text-left" onChange={(e) => updatePoints(e.target.value)}>
        <option value="10/1">{'10CP'}</option>
        <option value="12/1">{'12CP'}</option>
        <option value="16/1">{'16CP'}</option>
        <option value="24/1">{'24CP'}</option>
        <option value="40/1">{'40CP'}</option>
        <option value="64/1">{'64CP'}</option>
        <option value="20/2">{'20CP (初期20CP)'}</option>
        <option value="24/2">{'24CP (初期20CP)'}</option>
        <option value="32/2">{'32CP (初期20CP)'}</option>
        <option value="48/2">{'48CP (初期20CP)'}</option>
        <option value="64/2">{'64CP (初期20CP)'}</option>
        <option value="40/4">{'40CP (初期40CP)'}</option>
        <option value="48/4">{'48CP (初期40CP)'}</option>
        <option value="64/4">{'64CP (初期40CP)'}</option>
      </select>
      {!sampleId
        ? <List samples={samples} />
        : <Detail sample={samples.find(m => m.id === Number(sampleId))!} />
      }
    </>
  )
}

export default Sample
