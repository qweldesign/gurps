import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ParameterName } from '../../lib/domains/Parameters'
import { type Character } from '../../lib/domains/Character'

type SortKey = 'id' | 'skill' | '筋力' | '敏捷力' | '知力' | '生命力'

function List({ models }: { models: Character[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState({
    id: false, // false: asc▲, true:desc▼
    skill: false,
    '筋力': false,
    '敏捷力': false,
    '知力': false,
    '生命力': false
  })

  const navigate = useNavigate()

  const handleSort = (key: SortKey) => {
    setSortKey(key)
    setSortDir(prev => ({
      ...prev,
      [key]: !sortDir[key]
    }))
  }

  const sorted = useMemo((): Character[] => {
    if (sortKey === 'id') {
      return models.sort((a, b) => {
        return (a.id - b.id) * (sortDir.id ? -1 : 1)
      })
    } else if (sortKey === 'skill') {
      return models.sort((a, b) => {
        const skillA = a.getMainSkill()
        const skillB = b.getMainSkill()
        return (skillA.id! - skillB.id!) * (sortDir.skill ?  -1 : 1)
      })
    } else {
      return models.sort((a, b) => {
        return (a.getParam(sortKey as ParameterName) - b.getParam(sortKey as ParameterName)) * (sortDir[sortKey] ?  -1 : 1)
      })
    }
  }, [models, sortKey, sortDir])

  return (
    <>
      <div className="table-wrapper">
        <table className="w-1/1">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID <span className="text-xs cursor-pointer">{sortDir.id ? '▼' : '▲'}</span></th>
              <th>名前</th>
              <th>性別</th>
              <th onClick={() => handleSort('筋力')}>筋力 <span className="text-xs cursor-pointer">{sortDir['筋力'] ? '▼' : '▲'}</span></th>
              <th onClick={() => handleSort('敏捷力')}>敏捷力 <span className="text-xs cursor-pointer">{sortDir['敏捷力'] ? '▼' : '▲'}</span></th>
              <th onClick={() => handleSort('知力')}>知力 <span className="text-xs cursor-pointer">{sortDir['知力'] ? '▼' : '▲'}</span></th>
              <th onClick={() => handleSort('生命力')}>生命力 <span className="text-xs cursor-pointer">{sortDir['生命力'] ? '▼' : '▲'}</span></th>
              <th onClick={() => handleSort('skill')}>主技能 <span className="text-xs cursor-pointer">{sortDir.skill ? '▼' : '▲'}</span></th>
              <th>装備</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((model) => (
              <tr className="cursor-pointer" key={model.id} onClick={() => navigate(`/edit/${String(model.id).padStart(2, '0')}`)}>
                <td>{model.id}</td>
                <td>{model.name}</td>
                <td>{model.gender}</td>
                <td>{`${model.getParamLevel('筋力')} (${model.getParam('筋力')}CP)`}</td>
                <td>{`${model.getParamLevel('敏捷力')} (${model.getParam('敏捷力')}CP)`}</td>
                <td>{`${model.getParamLevel('知力')} (${model.getParam('知力')}CP)`}</td>
                <td>{`${model.getParamLevel('生命力')} (${model.getParam('生命力')}CP)`}</td>
                <td>{`${model.getMainSkill().name}: ${model.getMainSkillLevel()}`}</td>
                <td>{`${model.getWeapon().id !== 0 ? model.getWeapon().name : model.getMissile()!.name} / ${model.getBodyArmor().name}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default List
