import { type ReactNode, useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import Modal from './Modal'
import { PARAMETER_LIST, type ParameterName, Parameters } from '../../lib/domains/Parameters'
import { WEAPON_LIST, ARMOR_LIST, type WeaponName, type ArmorName, type HeadArmorName, type ArmArmorName, type LegArmorName, Equipments } from '../../lib/domains/Equipments'
import { Character, type CharacterData } from '../../lib/domains/Character'
import { PC_LIST } from '../../lib/domains/SampleCharacter'
import { SaveData } from '../../lib/domains/SaveData'

function Setting() {
  const [alertMessage, setAlertMessage] = useState<ReactNode>('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)
  const [points, setPoints] = useState(10)
  const [pointsState, setPointsState] = useState(false) // points を使い切ったら true にする
  const [gold, setGold] = useState(100)
  const [goldState, setGoldState] = useState(true) // 購入金額が所持金を超えた場合に false にする
  const [initialEquipSet, setInitialEquipSet] = useState(false) // 装備を一度でも変更したかどうか
  const [prevParams, setPrevParams] = useState(() => new Parameters([]))
  const [params, setParams] = useState(() => new Parameters([]))
  const [prevEquips, setPrevEquips] = useState(() => new Equipments(null))
  const [equips, setEquips] = useState(() => new Equipments(null))
  const [name, setName] = useState('')
  const [gender, setGender] = useState('男性')
  const [nameState, setNameState] = useState(false) // 名前を決定したら true にする
  const [weaponList, setWeaponList] = useState(WEAPON_LIST)
  const [armorList, setArmorList] = useState(ARMOR_LIST)
  
  // 作成したキャラクターID
  const { uid } = useLoaderData()
  const navigate = useNavigate()
  const isFirstCreation = uid === '00' ? true : false

  // セーブデータの読み込み
  const saveData = new SaveData()
  const keys = saveData.loadKeys()

  // LocalStorage からキャラクターデータを取得
  const prevModel = saveData.loadModel(uid)
  
  // SessionStorage から作りかけのデータを取得
  const model = saveData.loadModel(uid, true)

  // 能力値, 技能一覧表
  const lists = []
  lists[0] = PARAMETER_LIST.filter(param => param.base === 10)
  lists[1] = PARAMETER_LIST.filter(param => param.base === '筋力')
  lists[2] = PARAMETER_LIST.filter(param => param.base === '生命力')
  lists[3] = PARAMETER_LIST.filter(param => param.base === '敏捷力')
  lists[4] = PARAMETER_LIST.filter(param => param.base === '知力')

  // CP/所持金設定の更新
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
      if (isFirstCreation) setGold(gold * 2) // 初回作成時は所持金を倍に
      setWeaponList(WEAPON_LIST) // リストを追加
      setArmorList(ARMOR_LIST)
      if (initialEquipSet) {
        // 一度でも装備を変更していた場合, アラート表示 (装備は全解除しない)
        const message = (
          <p className="text-center">「武術」がセットされたため、所持金が2倍になりました。
            <br />装備可能な武器・防具が変わったため、装備の選択をやり直してください。</p>
        )
        setAlertMessage(message)
        setAlertOpen(true)
        setInitialEquipSet(false) // 繰り返しアラート表示されるのを防ぐ
      }
    } else if (params.get('武術') > 0 && next.get('武術') === 0) {
      // 武術がリセットされた場合
      if (isFirstCreation) setGold(gold / 2)
      setWeaponList(WEAPON_LIST.filter(item => item.skillType !== '武術'))
      setArmorList(ARMOR_LIST.filter(item => item.wt <= 2))
      resetEquips()
      // 装備を全解除しアラート表示 (initialEquipSet の値に関わらない)
      const message = (
        <p className="text-center">「武術」がリセットされたため、所持金が半分になりました。
          <br />装備可能な武器・防具が変わったため、装備の選択をやり直してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
    }
    setParams(next)
  }

  const changeWeapon = (name: WeaponName) => {
    const next = new Equipments(equips.toData())
    next.setWeapon(name, false)
    setEquips(next)
    setInitialEquipSet(true)
  }

  const changeMissile = (name: WeaponName) => {
    const next = new Equipments(equips.toData())
    next.setMissile(name)
    setEquips(next)
    setInitialEquipSet(true)
  }

  const changeShield = (name: WeaponName) => {
    const next = new Equipments(equips.toData())
    next.setShield(name)
    setEquips(next)
    setInitialEquipSet(true)
  }

  const changeArmor = (name: ArmorName) => {
    const next = new Equipments(equips.toData())
    next.setBody(name, false)
    setEquips(next)
    setInitialEquipSet(true)
  }

  const changeHeadArmor = (name: HeadArmorName) => {
    const next = new Equipments(equips.toData())
    next.setHead(name)
    setEquips(next)
    setInitialEquipSet(true)
  }

  const changeArmArmor = (name: ArmArmorName) => {
    const next = new Equipments(equips.toData())
    next.setArm(name)
    setEquips(next)
    setInitialEquipSet(true)
  }

  const changeLegArmor = (name: LegArmorName) => {
    const next = new Equipments(equips.toData())
    next.setLeg(name)
    setEquips(next)
    setInitialEquipSet(true)
  }

  const resetEquips = () => {
    const next = new Equipments(prevEquips.toData())
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

  const back = keys.size ? '/edit/' : '/'

  // 確認 (SessionStorage を使用)
  const confirm = () => {
    // 初回作成時で points を使い切ってない場合のアラート
    if (isFirstCreation && !pointsState) {
      const message = (
        <p className="text-center">キャラクターポイントを使い切っていません。
          <br />ポイントを使い切ってください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      return
    }

    // 装備の購入金額が所持金を超えている場合のアラート
    if (!goldState) {
      const message = (
        <p className="text-center">装備の購入金額が所持金を超えています。
          <br />装備を変更してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      return
    }

    // 初回作成時で名前が未設定の場合のアラート
    if (isFirstCreation && !nameState) {
      const message = (
        <p className="text-center">名前を設定してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      return
    }

    const confirmData: CharacterData = {
      id: Number(uid),
      name, gender,
      points: params.toData(),
      totalPoints: points,
      equipments: equips.toData(),
      gold
    }
    
    const unit = new Character(confirmData)
    unit.saveTemp() // 一時保存

    if (Number(uid)) {
      navigate(`/edit/confirm/${uid}`)
    } else {
      navigate(`/edit/confirm/`)
    }
  }
 
  useEffect(() => {
    // 作成したキャラクターのデータを反映
    setPoints(prevModel.totalPoints)
    setGold(prevModel.gold) // 旧データを使用
    setName(model.name)
    setGender(model.gender)
    setPrevParams(() => new Parameters(prevModel.points))
    setParams(() => new Parameters(model.points))
    setPrevEquips(() => new Equipments(prevModel.equipments))
    setEquips(() => new Equipments(model.equipments))

    // 武器・防具リストのフィルター更新
    if (model.points.length === 0 || model.points[4] === 0) { //「武術」(params 経由で取得しても React で未反映なので)
      setWeaponList(WEAPON_LIST.filter(item => item.skillType !== '武術'))
      setArmorList(ARMOR_LIST.filter(item => item.wt <= 2))
    } else {
      setGold(gold * 2)
      setWeaponList(WEAPON_LIST)
      setArmorList(ARMOR_LIST)
    }
  }, [])

  useEffect(() => {
    // points を使い切ったかどうかの判定
    if (points === params.getTotal()) {
      setPointsState(true)
    } else {
      setPointsState(false)
    }
  }, [params])

  useEffect(() => {
    // 装備の購入金額が所持金を超えた場合のアラート
    if (gold < equips.getGold()) {
      const message = (
        <p className="text-center">装備の購入金額が所持金を超えています。
          <br />装備を変更してください。</p>
      )
      setGoldState(false) // 所持金のスタイルを赤字に変更
      setAlertMessage(message)
      setAlertOpen(true)
    } else {
      setGoldState(true) // 所持金のスタイルを元に戻す
    }
  }, [gold, equips])

  useEffect(() => {
    // 名前を決定したら true にする
    if (name === '未設定' || name === '') {
      setNameState(false)
    } else {
      setNameState(true)
    }
  }, [name])

  return (
    <div className="px-6">
      <div className="max-w-[48em] mx-auto">
        <h3>キャラクター{isFirstCreation ? '作成' : '編集'}</h3>
        {isFirstCreation && (
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
        )}
        <section>
          {isFirstCreation && (
            <>
              <h4>2. キャラクターポイントの振り分け</h4>
              <p>合計{points}点のキャラクターポイントを振り分けてキャラクターを作成します。
                <br />能力値や技能値は、値が高くなるほどポイントを多く消耗します。
                <br />能力値は技能値の基準となるので、多めに振り分けましょう。
                <br />ポイントは最小0.5点単位で振り分けることができます。
              </p>
            </>
          )}
          <h5>残りCP: <span className={!pointsState ? 'text-amber-400 font-bold' : 'font-bold'}>{points - params.getTotal()} 点</span></h5>
          <div className="flex flex-nowrap lg:flex-wrap flex-col items-center gap-6 lg:h-[60em]">
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
          {isFirstCreation && (
            <>
              <h4>3. 装備の購入</h4>
              <p>合計{gold}金の所持金でキャラクターの装備を購入します。
                <br />「武術」の保有者は所持金が倍になります（戦いを職業としているため、優遇されます）。
              </p>
            </>
          )}
          <h5>残り所持金: <span className={!goldState ? 'text-red-600 font-bold' : 'font-bold'}>{gold - equips.getGold()} 金</span></h5>
          <div>
            <label className="inline-block w-24 sm:text-right">主用武器: </label>
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
            <label className="inline-block w-24 sm:text-right">射撃武器: </label>
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
            <label className="inline-block w-24 sm:text-right">盾: </label>
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
            <label className="inline-block w-24 sm:text-right">胴防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.getBodyArmor().name} onChange={(e) => changeArmor(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {armorList.filter(item => item.id !== 0).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.sdr} (${item.gold * 0.5}金)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">頭防具: </label>
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
            <label className="inline-block w-24 sm:text-right">腕防具: </label>
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
            <label className="inline-block w-24 sm:text-right">脚防具: </label>
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
        {isFirstCreation && (
          <section>
            <h4>4. プロフィールの設定</h4>
            <div>
              <label className="inline-block w-24 sm:text-right">名前: </label>
              <input className="w-72 m-6 px-3 text-left" type="text" value={name} onChange={(e) => changeName(e.target.value)} />
              <button className="block sm:inline-block w-24 h-6 m-auto text-sm/1" onClick={autoProfile}>自動入力</button>
            </div>
            <div>
              <label className="inline-block w-24 sm:text-right">性別: </label>
              <select className="w-72 m-6 px-3 text-left" value={gender} onChange={(e) => changeGender(e.target.value)}>
                <option value="男性">男性</option>
                <option value="女性">女性</option>
              </select>
            </div>
          </section>
        )}
        <section className="my-12 text-center">
          {isFirstCreation && (
            <p className="text-center">お疲れ様でした。もうすぐキャラクター作成は完了です。
              <br />この内容でよろしければ、確認へ進んでください。
            </p>
          )}
          <button onClick={confirm}>確認する</button>
          <button onClick={() => navigate(back)}>{isFirstCreation ? '作成' : '編集'}中止</button>
        </section>
      </div>
      {alertOpen && (
        <Modal message={alertMessage} onClose={() => setAlertOpen(false)} onContinue={null} />
      )}
    </div>
  )
}

export default Setting
