import { useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useSessionStorage } from '../../hooks/useSessionStorage'
import Modal from './Modal'
import { PARAMETER_LIST, type ParameterName, Parameters } from '../../lib/domains/Parameters'
import { WEAPON_LIST, ARMOR_LIST, type WeaponName, type ArmorName, type HeadArmorName, type ArmArmorName, type LegArmorName, Equipments } from '../../lib/domains/Equipments'
import { PC_LIST } from '../../lib/domains/SampleCharacter'
import type { CharacterData } from '../../lib/domains/Character'

function Making() {
  const [alertMessage] = useState('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)
  const [points, setPoints] = useState(10)
  const [gold, setGold] = useState(100)
  const [goldRate, setGoldRate] = useState(1)
  const [prevParams, setPrevParams] = useState(() => new Parameters([]))
  const [params, setParams] = useState(() => new Parameters([]))
  const [equips, setEquips] = useState(() => new Equipments(null))
  const [name, setName] = useState('')
  const [gender, setGender] = useState('男性')
  const [weaponList, setWeaponList] = useState(WEAPON_LIST.filter(item => item.skillType !== '武術'))
  const [armorList, setArmorList] = useState(ARMOR_LIST.filter(item => item.wt <= 2))
  
  // 作成したキャラクターID
  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // 能力値, 技能一覧表
  const lists = []
  lists[0] = PARAMETER_LIST.filter(param => param.base === 10)
  lists[1] = PARAMETER_LIST.filter(param => param.base === '筋力')
  lists[2] = PARAMETER_LIST.filter(param => param.base === '生命力')
  lists[3] = PARAMETER_LIST.filter(param => param.base === '敏捷力')
  lists[4] = PARAMETER_LIST.filter(param => param.base === '知力')

  // LocalStorage / SessionStorage を使用
  const storageKey = 'savedata';
  const uniqueKey = `${storageKey}:${uid}`
  
  // LocalStorage のインデックス (uid配列を格納)
  const indexKey = `${storageKey}:index`
  const [index] = useLocalStorage<string[]>(indexKey, [])
  
  // LocalStorage からキャラクターデータを取得
  const [prevData] = useLocalStorage(uniqueKey, {
    id: 0,
    name: '未設定',
    gender: '男性',
    points: [],
    totalPoints: 10,
    equipments: null,
    gold: 100
  })
  // SessionStorage から作りかけのデータを取得
  const [nextData] = useSessionStorage(uniqueKey, prevData)

  const updateOptions = (value: string) => {
    const [p, m] = value.split('/')
    setPoints(Number(p))
    setGold(Number(m))
  }

  // 増減ボタンの状態を取得 (true: 有効 / false: 無効)
  const getButtonDisable = (name: ParameterName, size: number, i: number) => {
    if (Number(uid) > 0 && i === 0) return true
    const prevPoint = prevParams.get(name)
    const currentPoint = params.get(name)
    const next = new Parameters(params.toData())
    const nextPoint = next.step(name, size)
    // 下限を下回る場合, 合計を上回る場合は disable を true に 
    return ((prevPoint === nextPoint && currentPoint === 0) || prevPoint > nextPoint || next.getTotal() > points)
  }

  // パラメータをステップ
  const step = (name: ParameterName, size: number) => {
    const next = new Parameters(params.toData())
    next.step(name as ParameterName, size)
    if (params.get('武術') === 0 && next.get('武術') > 0) {
      // 武術がセットされた場合
      setGoldRate(2) // 所持金を倍に
      setWeaponList(WEAPON_LIST) // リストを追加
      setArmorList(ARMOR_LIST)
    } else if (params.get('武術') > 0 && next.get('武術') === 0) {
      setGoldRate(1)
      setWeaponList(WEAPON_LIST.filter(item => item.skillType !== '武術'))
      setArmorList(ARMOR_LIST.filter(item => item.wt <= 2))
    }
    setParams(next)
  }

  const changeWeapon = (name: WeaponName) => {
    const next = new Equipments(equips.toData())
    next.setWeapon(name, false)
    setEquips(next)
  }

  const changeMissile = (name: WeaponName) => {
    const next = new Equipments(equips.toData())
    next.setMissile(name)
    setEquips(next)
  }

  const changeShield = (name: WeaponName) => {
    const next = new Equipments(equips.toData())
    next.setShield(name)
    setEquips(next)
  }

  const changeArmor = (name: ArmorName) => {
    const next = new Equipments(equips.toData())
    next.setBody(name, false)
    setEquips(next)
  }

  const changeHeadArmor = (name: HeadArmorName) => {
    const next = new Equipments(equips.toData())
    next.setHead(name)
    setEquips(next)
  }

  const changeArmArmor = (name: ArmArmorName) => {
    const next = new Equipments(equips.toData())
    next.setArm(name)
    setEquips(next)
  }

  const changeLegArmor = (name: LegArmorName) => {
    const next = new Equipments(equips.toData())
    next.setLeg(name)
    setEquips(next)
  }

  const changeName = (name: string) => {
    setName(name)
  }

  const changeGender = (gender: string) => {
    setGender(gender)    
  }

  const autoProfile = () => {
    const g = gender === '男性' ? 0 : 1
    const n = Math.floor((Math.random() + g) * PC_LIST.length / 2)
    setName(PC_LIST[n])
  }

  const back = index.length ? '/edit/' : '/'

  // 確認 (SessionStorage を使用)
  const confirm = () => {
    const confirmData: CharacterData = {
      id: Number(uid),
      name, gender,
      points: params.toData(),
      totalPoints: points,
      equipments: equips.toData(),
      gold
    }
    sessionStorage.setItem(uniqueKey, JSON.stringify(confirmData))
    if (Number(uid)) {
      navigate(`/edit/confirm/${uid}`)
    } else {
      navigate(`/edit/confirm/`)
    }
  }
 
  useEffect(() => {
    // 作成したキャラクターのデータを反映
    setName(nextData.name)
    setGender(nextData.gender)
    setPrevParams(() => new Parameters(prevData.points))
    setParams(() => new Parameters(nextData.points))
    setEquips(() => new Equipments(nextData.equipments))
  }, [])

  return (
    <>
      <div className="w-[48em] mx-auto">
        <h3>キャラクター作成</h3>
        <section>
          <h4>1. 基本設定</h4>
          <p>キャラクター作成の条件を設定します。
            <br />初期CPや所持金が大きいほど強いキャラクターを作成できますが、初めてのプレイヤーはロックされています。
            <br />模擬戦闘で勝利を重ねるとアンロックされます（開発中は全ての条件がアンロックされています）。
          </p>
          <div>
            <label>作成条件: </label>
            <select className="w-48 m-6 ps-3 text-center" onChange={(e) => updateOptions(e.target.value)}>
              <option value="10/100">{'10CP / 100金'}</option>
              <option value="20/200">{'20CP / 200金'}</option>
              <option value="40/400">{'40CP / 400金'}</option>
            </select>
          </div>
        </section>
        <section>
          <h4>2. キャラクターポイントの振り分け</h4>
          <p>合計{points}点のキャラクターポイントを振り分けてキャラクターを作成します。
            <br />能力値や技能値は、値が高くなるほどポイントを多く消耗します。
            <br />能力値は技能値の基準となるので、多めに振り分けましょう。
            <br />ポイントは最小0.5点単位で振り分けることができます。
          </p>
          <h5>残りCP: {points - params.getTotal()} 点</h5>
          <div className="flex flex-wrap flex-col items-center gap-6 h-[60em]">
            {lists.map((list, i) => (
              <div className="w-64" key={i}>
                <h6>
                  {i === 0 ? '能力値' :
                    i === 1 ? '筋力を基準とする技能' :
                    i === 2 ? '生命力を基準とする技能' :
                    i === 3 ? '敏捷力を基準とする技能' : '知力を基準とする技能'
                  }
                </h6>
                <table>
                  <thead>
                    <tr>
                      <th>{i === 0 ? '能力値' : '技能'}</th>
                      <th className="text-center">Lv</th>
                      <th className="text-center">CP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((p, j) =>  (
                      <tr key={j}>
                        <td>{p.name}</td>
                        <td>
                          <button
                            className="w-6 h-6 my-0 mx-3 leading-1"
                            disabled={getButtonDisable(p.name, -1, i)}
                            onClick={() => step(p.name, -1)}
                          >-</button>
                          <span className="inline-block w-6 text-center">{params.getLevel(p.name)}</span>
                          <button
                            className="w-6 h-6 my-0 mx-3 leading-1"
                            disabled={getButtonDisable(p.name, 1, i)}
                            onClick={() => step(p.name, 1)}
                          >+</button>
                        </td>
                        <td className="w-6 text-center">{params.get(p.name)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h4>3. 装備の購入</h4>
          <p>合計{gold}金の所持金でキャラクターの装備を購入します。
            <br />「武術」の保有者は所持金が倍になります（戦いを職業としているため、優遇されます）。
          </p>
          <h5>残り所持金: {gold * goldRate - equips.getGold()} 金</h5>
          <div>
            <label className="inline-block w-24 text-right">主用武器: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.getWeapon().name} onChange={(e) => changeWeapon(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {weaponList.filter(item => (
                // 格闘, 射撃, 盾を除く
                item.weaponType !== 0 && item.weaponType !== 5 && item.weaponType !== 6
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.baseDmg / 2} (${item.gold}金)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="inline-block w-24 text-right">射撃武器: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.getMissile().name} onChange={(e) => changeMissile(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {weaponList.filter(item => (
                // 射撃武器のみを取り出す
                item.weaponType === 5
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.baseDmg / 2} (${item.gold}金)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="inline-block w-24 text-right">盾: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.getShield().name} onChange={(e) => changeShield(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {weaponList.filter(item => (
                // 盾のみを取り出す
                item.weaponType === 6
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.ev} (${item.gold}金)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="inline-block w-24 text-right">胴防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.getBodyArmor().name} onChange={(e) => changeArmor(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {armorList.filter(item => item.id !== 0).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.sdr} (${item.gold * 0.5}金)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="inline-block w-24 text-right">頭防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.getHeadArmor().parts[0]!} onChange={(e) => changeHeadArmor(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {armorList.filter(item => (
                item.id !== 0 && item.parts[0]
              )).map((item, i) => (
                <option key={i} value={item.parts[0]!}>{`${item.parts[0]} | 性能:${item.sdr} (${item.gold * 0.25}金)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="inline-block w-24 text-right">腕防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.getArmArmor().parts[1]!} onChange={(e) => changeArmArmor(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {armorList.filter(item => (
                item.id !== 0 && item.parts[1]
              )).map((item, i) => (
                <option key={i} value={item.parts[1]!}>{`${item.parts[1]} | 性能:${item.sdr} (${item.gold * 0.1}金)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="inline-block w-24 text-right">脚防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.getLegArmor().parts[2]!} onChange={(e) => changeLegArmor(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {armorList.filter(item => (
                item.id !== 0 && item.parts[2]
              )).map((item, i) => (
                <option key={i} value={item.parts[2]!}>{`${item.parts[2]} | 性能:${item.sdr} (${item.gold * 0.15}金)`}</option>
              ))}
            </select>
          </div>
        </section>
        <section>
          <h4>4. プロフィールの設定</h4>
          <div>
            <label className="inline-block w-24 text-right">名前: </label>
            <input className="w-72 m-6 px-3 text-left" type="text" value={name} onChange={(e) => changeName(e.target.value)} />
            <button className="w-24 h-6 text-sm/1" onClick={autoProfile}>自動入力</button>
          </div>
          <div>
            <label className="inline-block w-24 text-right">性別: </label>
            <select className="w-72 m-6 px-3 text-left" value={gender} onChange={(e) => changeGender(e.target.value)}>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
            </select>
          </div>
        </section>
        <section className="my-12 text-center">
          <p className="text-center">お疲れ様でした。もうすぐキャラクター作成は完了です。
            <br />この内容でよろしければ、確認へ進んでください。
          </p>
          <button onClick={confirm}>確認する</button>
          <button onClick={() => navigate(back)}>作成中止</button>
        </section>
      </div>
      {alertOpen && (
        <Modal message={alertMessage} onClose={() => setAlertOpen(false)} />
      )}
    </>
  )
}

export default Making
