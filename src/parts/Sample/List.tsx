import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ParameterName } from '../../lib/domains/Parameters'
import { type SampleCharacter } from '../../lib/domains/SampleCharacter'

type SortKey = 'id' | 'tactic' | '筋力' | '敏捷力' | '知力' | '生命力'

function SampleList({ samples }: { samples: SampleCharacter[] }) {
  const navigate = useNavigate()
  
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState({
    id: false, // false: asc▲, true:desc▼
    tactic: false,
    '筋力': false,
    '敏捷力': false,
    '知力': false,
    '生命力': false
  })

  const handleSort = (key: SortKey) => {
    setSortKey(key)
    setSortDir(prev => ({
      ...prev,
      [key]: !sortDir[key]
    }))
  }

  const sorted = useMemo((): SampleCharacter[] => {
    if (sortKey === 'id') {
      return samples.sort((a, b) => {
        return (a.id - b.id) * (sortDir.id ? -1 : 1)
      })
    } else if (sortKey === 'tactic') {
      return samples.sort((a, b) => {
        return (a.tactic - b.tactic) * (sortDir.tactic ?  -1 : 1)
      })
    } else {
      return samples.sort((a, b) => {
        return (a.getParam(sortKey as ParameterName) - b.getParam(sortKey as ParameterName)) * (sortDir[sortKey] ?  -1 : 1)
      })
    }
  }, [samples, sortKey, sortDir])

  return (
    <>
      <div className="table-wrapper">
        <table className="w-1/1">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID <span className="text-xs cursor-pointer">{sortDir.id ? '▼' : '▲'}</span></th>
              <th>名前</th>
              <th>性別</th>
              <th onClick={() => handleSort('tactic')}>タイプ <span className="text-xs cursor-pointer">{sortDir.tactic ? '▼' : '▲'}</span></th>
              <th onClick={() => handleSort('筋力')}>筋力 <span className="text-xs cursor-pointer">{sortDir['筋力'] ? '▼' : '▲'}</span></th>
              <th onClick={() => handleSort('敏捷力')}>敏捷力 <span className="text-xs cursor-pointer">{sortDir['敏捷力'] ? '▼' : '▲'}</span></th>
              <th onClick={() => handleSort('知力')}>知力 <span className="text-xs cursor-pointer">{sortDir['知力'] ? '▼' : '▲'}</span></th>
              <th onClick={() => handleSort('生命力')}>生命力 <span className="text-xs cursor-pointer">{sortDir['生命力'] ? '▼' : '▲'}</span></th>
              <th>主技能</th>
              <th>副技能</th>
              <th>装備</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((sample) => (
              <tr className="cursor-pointer" key={sample.id} onClick={() => navigate(`/sample/${sample.id}`)}>
                <td>{sample.id}</td>
                <td>{sample.name}</td>
                <td>{sample.gender}</td>
                <td>{sample.getTacticName()}</td>
                <td>{`${sample.getParamLevel('筋力')} (${sample.getParam('筋力')}CP)`}</td>
                <td>{`${sample.getParamLevel('敏捷力')} (${sample.getParam('敏捷力')}CP)`}</td>
                <td>{`${sample.getParamLevel('知力')} (${sample.getParam('知力')}CP)`}</td>
                <td>{`${sample.getParamLevel('生命力')} (${sample.getParam('生命力')}CP)`}</td>
                <td>{`${sample.getSkillByPriority().name}: ${sample.getSkillByPriority().level}`}</td>
                {sample.getSkillByPriority(1).point ? (
                  <td>{`${sample.getSkillByPriority(1).name}: ${sample.getSkillByPriority(1).level}`}</td>
                ) : (
                  <td>-</td>
                )}
                <td>{`${sample.getWeapon().id !== 0 ? sample.getWeapon().name : sample.getMissile()!.name} / ${sample.getBodyArmor().name}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default SampleList
