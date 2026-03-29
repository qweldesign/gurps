// Sample/List.tsx

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ParameterKey } from '../../domains/Parameters'
import { type SampleCharacter } from '../../domains/Sample/Character'

type SortKey = 'id' | 'tactic' | '筋力' | '敏捷力' | '知力' | '生命力'

function List({ units }: { units: SampleCharacter[] }) {
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
      return units.sort((a, b) => {
        return (a.id - b.id) * (sortDir.id ? -1 : 1)
      })
    } else if (sortKey === 'tactic') {
      return units.sort((a, b) => {
        return (a.tactic - b.tactic) * (sortDir.tactic ?  -1 : 1)
      })
    } else {
      return units.sort((a, b) => {
        return (a.getParam(sortKey as ParameterKey) - b.getParam(sortKey as ParameterKey)) * (sortDir[sortKey] ?  -1 : 1)
      })
    }
  }, [units, sortKey, sortDir])

  return (
    <div className="table-wrapper">
      <table className="w-276">
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
          {sorted.map((unit) => (
            <tr className="cursor-pointer" key={unit.id} onClick={() => navigate(`/sample/${String(unit.id).padStart(2, '0')}`)}>
              <td>{unit.id}</td>
              <td>{unit.name}</td>
              <td>{unit.gender}</td>
              <td>{unit.getTacticName()}</td>
              <td>{`${unit.getParamLevel('筋力')} (${unit.getParam('筋力')}CP)`}</td>
              <td>{`${unit.getParamLevel('敏捷力')} (${unit.getParam('敏捷力')}CP)`}</td>
              <td>{`${unit.getParamLevel('知力')} (${unit.getParam('知力')}CP)`}</td>
              <td>{`${unit.getParamLevel('生命力')} (${unit.getParam('生命力')}CP)`}</td>
              <td>{`${unit.getSkillByPriority().name}: ${unit.getSkillByPriority().level}`}</td>
              {unit.getSkillByPriority(1).point ? (
                <td>{`${unit.getSkillByPriority(1).name}: ${unit.getSkillByPriority(1).level}`}</td>
              ) : (
                <td>-</td>
              )}
              <td>{`${unit.weapon.name} / ${unit.body.name[0]}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default List
