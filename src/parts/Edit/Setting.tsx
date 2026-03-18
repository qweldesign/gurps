import { type ReactNode, useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import Modal from '../common/Modal'
import { type Parameter, PARAMETER_LIST, type ParameterName, Parameters } from '../../domains/Parameters'
import { WEAPON_LIST, ARMOR_LIST, type WeaponName, type ArmorName, type HeadArmorName, type ArmArmorName, type LegArmorName, Equipments } from '../../domains/Equipments'
import { Character, type CharacterModel } from '../../domains/Character'
import { PC_LIST } from '../../domains/SampleCharacter'
import { SaveData } from '../../domains/SaveData'

function Setting() {
  // セーブデータの読み込み
  const saveData = new SaveData()
  const keys = saveData.loadKeys()

  // 状態管理 → ほとんど初回の useEffect で初期化し直す (セーブデータの読み込みを反映)
  const [points, setPoints] = useState(10)
  const [pointsState, setPointsState] = useState(false) // points を使い切ったら true にする
  const [initialGold, setInitialGold] = useState(0) // 所持金
  const [startGold, setStartGold] = useState(100) // 新規作成時のみ足される所持金
  const [startGoldRate, setStartGoldRate] = useState(1) // 新規作成時の所持金倍率
  const [initialEquipSet, setInitialEquipSet] = useState(false) // 装備を一度でも変更したかどうか
  const [prevParams, setPrevParams] = useState(() => new Parameters([]))
  const [params, setParams] = useState(() => new Parameters([]))
  const [prevEquips, setPrevEquips] = useState(() => new Equipments({}))
  const [equips, setEquips] = useState(() => new Equipments({}))
  const [saleEquips, setSaleEquips] = useState(() => new Equipments({ body: '装備無し' }))
  const [name, setName] = useState('')
  const [gender, setGender] = useState('男性')
  const [nameState, setNameState] = useState(false) // 名前を決定したら true にする
  const [weaponList, setWeaponList] = useState(WEAPON_LIST)
  const [armorList, setArmorList] = useState(ARMOR_LIST)
  
  // uid, navigate を取得
  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // 新規作成かどうかを変数に格納
  const isFirstCreation = uid === '00' ? true : false

  // LocalStorage からキャラクターデータを取得 → 状態に反映
  const prevModel = saveData.loadModel(uid)
  
  // SessionStorage から作りかけのデータを取得 → 状態に反映
  const model = saveData.loadModel(uid, true)

  // 作成 (編集) 中断時の戻り先
  const back = keys.size ? '/edit/' : '/'

  // Modal に渡すパラメータ
  const [alertMessage, setAlertMessage] = useState<ReactNode>('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)

  // 能力値, 技能一覧表
  const parameterGroups = [
    { label: '能力値', filter: (p: Parameter) => p.base === 10 },
    { label: '筋力を基準とする技能', filter: (p: Parameter) => p.base === '筋力' },
    { label: '生命力を基準とする技能', filter: (p: Parameter) => p.base === '生命力' },
    { label: '敏捷力を基準とする技能', filter: (p: Parameter) => p.base === '敏捷力' },
    { label: '知力を基準とする技能', filter: (p: Parameter) => p.base === '知力' },
  ]

  // パラメータをステップ
  const step = (name: ParameterName, size: number) => {
    const next = new Parameters(params.toModel())
    next.step(name as ParameterName, size)
    if (!params.isWarrior && next.isWarrior) {
      // 武術がセットされた場合
      if (isFirstCreation) setStartGoldRate(2) // 新規作成時は所持金を倍に
      setWeaponList(WEAPON_LIST) // リストを追加
      setArmorList(ARMOR_LIST)
      if (initialEquipSet) {
        // 一度でも装備を変更していた場合, アラート表示 (装備は全解除しない)
        const message = (
          <p className="text-center">「武術」がセットされたため、ユニットの所持金が2倍になりました。
            <br />装備可能な武器・防具が変わったため、装備の選択をやり直してください。</p>
        )
        setAlertMessage(message)
        setAlertOpen(true)
        setInitialEquipSet(false) // 繰り返しアラート表示されるのを防ぐ
      }
    } else if (params.isWarrior && !next.isWarrior) {
      // 武術がリセットされた場合
      if (isFirstCreation) setStartGoldRate(1) // 新規作成時は所持金を戻す
      setWeaponList(WEAPON_LIST.filter(item => item.skillType !== '武術'))
      setArmorList(ARMOR_LIST.filter(item => item.wt <= 2))
      resetEquips()
      // 装備を全解除しアラート表示 (initialEquipSet の値に関わらない)
      const message = (
        <p className="text-center">「武術」がリセットされたため、ユニットの所持金が半分になりました。
          <br />装備可能な武器・防具が変わったため、装備の選択をやり直してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
    }
    setParams(next)
  }

  // 増減ボタンの状態を取得 (true: 有効 / false: 無効)
  const getButtonDisable = (name: ParameterName, size: number, i: number) => {
    if (Number(uid) > 0 && i === 0) return true
    const prevPoint = prevParams.get(name)
    const currentPoint = params.get(name)
    const next = new Parameters(params.toModel())
    const nextPoint = next.step(name, size)
    // 下限を下回る場合, 合計を上回る場合は disable を true に 
    return ((prevPoint === nextPoint && currentPoint === 0) || prevPoint > nextPoint || next.total > points)
  }

  // 所持金を計算
  const calcGold = () => {
    let gold = initialGold
    if (isFirstCreation) gold += startGold * startGoldRate
    gold -= equips.gold - prevEquips.gold + Math.ceil(saleEquips.gold / 2)
    return gold
  }

  // CP/所持金設定の状態更新
  const updateOptions = (value: string) => {
    const [p, m] = value.split('/')
    setPoints(Number(p))
    setStartGold(Number(m))
  }

  // 装備の状態更新
  const changeEquip = <T,>({
    getPrevName, // 元の装備の名前を取得する関数
    set, // 装備を所定の位置にセットする関数
    isSame, // 元の装備と新しい装備の名前を比較する関数
    name
  }: {
    getPrevName: () => T
    set: (eq: Equipments, name: T | '装備無し') => void
    isSame: (a: T, b: T) => boolean
    name: T
  }) => {
    const prevName = getPrevName()
    const next = new Equipments(equips.toModel())
    set(next, name)

    const sale = new Equipments(saleEquips.toModel())
    if (!isSame(prevName, name)) {
      // 新しい装備を着用した場合, 元の装備を売却する  
      set(sale, prevName)
    } else {
      set(sale, '装備無し')
    }
    setSaleEquips(sale)

    setEquips(next)
    setInitialEquipSet(true)
  }

  // 主用武器の状態更新
  const changeWeapon = (name: WeaponName) => {
    changeEquip({
      getPrevName: () => prevEquips.weapon.name,
      set: (eq, name) => eq.weapon = name,
      isSame: (a, b) => a === b,
      name
    })
  }

  // 射撃武器の状態更新
  const changeMissile = (name: WeaponName) => {
    changeEquip({
      getPrevName: () => prevEquips.missile.name,
      set: (eq, name) => eq.missile = name,
      isSame: (a, b) => a === b,
      name
    })
  }

  // 盾の状態更新
  const changeShield = (name: WeaponName) => {
    changeEquip({
      getPrevName: () => prevEquips.shield.name,
      set: (eq, name) => eq.shield = name,
      isSame: (a, b) => a === b,
      name
    })
  }

  // 胴防具の状態更新
  const changeArmor = (name: ArmorName) => {
    changeEquip({
      getPrevName: () => prevEquips.body.name,
      set: (eq, name) => eq.body = name,
      isSame: (a, b) => a === b,
      name
    })
  }

  // 頭防具の状態更新
  const changeHeadArmor = (name: HeadArmorName) => {
    changeEquip({
      getPrevName: () => prevEquips.head.parts[0],
      set: (eq, name) => eq.head = name,
      isSame: (a, b) => a === b,
      name
    })
  }

  // 腕防具の状態更新
  const changeArmArmor = (name: ArmArmorName) => {
    changeEquip({
      getPrevName: () => prevEquips.arm.parts[1],
      set: (eq, name) => eq.arm = name,
      isSame: (a, b) => a === b,
      name
    })
  }

  // 脚防具の状態更新
  const changeLegArmor = (name: LegArmorName) => {
    changeEquip({
      getPrevName: () => prevEquips.leg.parts[2],
      set: (eq, name) => eq.leg = name,
      isSame: (a, b) => a === b,
      name
    })
  }

  // 装備を初期状態に戻す
  const resetEquips = () => {
    const next = new Equipments(prevEquips.toModel())
    const sale = new Equipments({ body: '装備無し' })
    setEquips(next)
    setSaleEquips(sale)
  }

  // 売却状態を更新
  const updateSale = () => {
    const sale = new Equipments(saleEquips.toModel())
    if (prevEquips.weapon.name !== equips.weapon.name) {
      sale.weapon = prevEquips.weapon.name
    }
    if (prevEquips.missile.name !== equips.missile.name) {
      sale.missile = prevEquips.missile.name
    }
    if (prevEquips.shield.name !== equips.shield.name) {
      sale.shield = prevEquips.shield.name
    }
    if (prevEquips.body.name !== equips.body.name) {
      sale.body = prevEquips.body.name
    }
    if (prevEquips.head.parts[0] !== equips.head.parts[0]) {
      sale.head = prevEquips.head.parts[0]
    }
    if (prevEquips.arm.parts[1] !== equips.arm.parts[1]) {
      sale.arm = prevEquips.arm.parts[1]
    }
    if (prevEquips.leg.parts[2] !== equips.leg.parts[2]) {
      sale.leg = prevEquips.leg.parts[2]
    }
    setSaleEquips(sale)
  }

  // 名前を自動決定
  const autoName = () => {
    const g = gender === '男性' ? 0 : 1
    const n = Math.floor((Math.random() + g) * PC_LIST.length / 2)
    setName(PC_LIST[n])
  }

  // 名前の状態更新
  const changeName = (name: string) => {
    setName(name)
  }

  // 性別の状態更新
  const changeGender = (gender: string) => {
    setGender(gender)    
  }

  // 確認
  const confirm = () => {
    // 新規作成時で points を使い切ってない場合のアラート
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
    if (calcGold() < 0) {
      const message = (
        <p className="text-center">装備の購入金額が所持金を超えています。
          <br />装備を変更してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      return
    }

    // 新規作成時で名前が未設定の場合のアラート
    if (isFirstCreation && !nameState) {
      const message = (
        <p className="text-center">名前を設定してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      return
    }

    // 確認用のモデルを作成
    const confirmModel: CharacterModel = {
      id: Number(uid),
      name, gender,
      totalPoints: points,
      points: params.toModel(),
      equipments: equips.toModel()
    }
    
    // キャラクターデータの一時保存 (SessionStorage を使用)
    const unit = new Character(confirmModel)
    unit.save(true)

    // 所持金の一時保存
    saveData.saveGold(calcGold(), true)

    // 確認画面へ進む
    if (!isFirstCreation) {
      navigate(`/edit/confirm/${uid}`)
    } else {
      navigate(`/edit/confirm/`)
    }
  }
 
  // 最初に1回だけ実行
  useEffect(() => {
    // 作成したキャラクターのデータを反映
    setPoints(prevModel.totalPoints)
    setName(model.name)
    setGender(model.gender)
    setPrevParams(() => new Parameters(prevModel.points))
    setParams(() => new Parameters(model.points))
    setPrevEquips(() => new Equipments(prevModel.equipments))
    setEquips(() => new Equipments(model.equipments))

    // セーブデータから所持金を読み込み
    setInitialGold(saveData.loadGold())

    // 武器・防具リストのフィルター更新, 所持金倍率の更新
    if (model.points.length === 0 || model.points[4] === 0) { //「武術」(params 経由で取得しても React で未反映なので)
      setWeaponList(WEAPON_LIST.filter(item => item.skillType !== '武術'))
      setArmorList(ARMOR_LIST.filter(item => item.wt <= 2))
    } else {
      if (isFirstCreation) setStartGoldRate(2)
      setWeaponList(WEAPON_LIST)
      setArmorList(ARMOR_LIST)
    }

    // 売却装備更新
    updateSale()
  }, [])

  // points を使い切ったかどうかの判定
  useEffect(() => {
    if (points === params.total) {
      setPointsState(true)
    } else {
      setPointsState(false)
    }
  }, [params])

  // 装備の購入金額が所持金を超えた場合のアラート
  useEffect(() => {
    if (calcGold() < 0) {
      const message = (
        <p className="text-center">装備の購入金額が所持金を超えています。
          <br />装備を変更してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
    }
  }, [startGold, startGoldRate, equips])

  // 名前を決定したかどうかの判定
  useEffect(() => {
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
              <br />模擬戦闘で勝利を重ねるとアンロックされます。
            </p>
            <div>
              <label>作成条件: </label>
              <select className="w-48 m-6 ps-3 text-center" onChange={(e) => updateOptions(e.target.value)}>
                <option value="10/100">{'10CP / 100金'}</option>
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
          <h5>残りCP: <span className={!pointsState ? 'text-amber-400 font-bold' : 'font-bold'}>{points - params.total} 点</span></h5>
          <div className="flex flex-nowrap lg:flex-wrap flex-col items-center gap-6 lg:h-[60em]">
            {parameterGroups.map((group, i) => (
              <div className="w-64" key={i}>
                <h6>{group.label}</h6>
                <table>
                  <thead>
                    <tr>
                      <th>{i === 0 ? '能力値' : '技能'}</th>
                      <th className="text-center">Lv</th>
                      <th className="text-center">CP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PARAMETER_LIST.filter(group.filter).map((p, j) =>  (
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
              <p>合計{initialGold + startGold * startGoldRate}金の所持金でキャラクターの装備を購入します。
                <br />「武術」の保有者はユニットの所持金が倍になります（戦いを職業としているため、優遇されます）。
              </p>
            </>
          )}
          <h5>残り所持金: <span className={calcGold() < 0 ? 'text-red-600 font-bold' : 'font-bold'}>{calcGold()} 金</span></h5>
          <div>
            <label className="inline-block w-24 sm:text-right">主用武器: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.weapon.name} onChange={(e) => changeWeapon(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {weaponList.filter(item => (
                // 格闘, 射撃, 盾を除く
                item.weaponType !== 0 && item.weaponType !== 5 && item.weaponType !== 6
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.baseDmg / 2} (${item.gold}金)`}</option>
              ))}
            </select>
            <div className={saleEquips.weapon.name === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${saleEquips.weapon.name} を売却 (${Math.floor(saleEquips.weapon.gold / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">射撃武器: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.missile.name} onChange={(e) => changeMissile(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {weaponList.filter(item => (
                // 射撃武器のみを取り出す
                item.weaponType === 5
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.baseDmg / 2} (${item.gold}金)`}</option>
              ))}
            </select>
            <div className={saleEquips.missile.name === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${saleEquips.missile.name} を売却 (${Math.floor(saleEquips.missile.gold / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">盾: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.shield.name} onChange={(e) => changeShield(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {weaponList.filter(item => (
                // 盾のみを取り出す
                item.weaponType === 6
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.ev} (${item.gold}金)`}</option>
              ))}
            </select>
            <div className={saleEquips.shield.name === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${saleEquips.shield.name} を売却 (${Math.floor(saleEquips.shield.gold / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">胴防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.body.name} onChange={(e) => changeArmor(e.target.value)}>
              {armorList.filter(item => item.id !== 0).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.sdr} (${item.gold * 0.5}金)`}</option>
              ))}
            </select>
            <div className={saleEquips.body.name === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${saleEquips.body.name} を売却 (${Math.floor(saleEquips.body.gold * 0.5 / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">頭防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.head.parts[0]!} onChange={(e) => changeHeadArmor(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {armorList.filter(item => (
                item.id !== 0 && item.parts[0]
              )).map((item, i) => (
                <option key={i} value={item.parts[0]!}>{`${item.parts[0]} | 性能:${item.sdr} (${item.gold * 0.25}金)`}</option>
              ))}
            </select>
            <div className={saleEquips.head.parts[0] === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${saleEquips.head.parts[0]} を売却 (${Math.floor(saleEquips.head.gold * 0.25 / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">腕防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.arm.parts[1]!} onChange={(e) => changeArmArmor(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {armorList.filter(item => (
                item.id !== 0 && item.parts[1]
              )).map((item, i) => (
                <option key={i} value={item.parts[1]!}>{`${item.parts[1]} | 性能:${item.sdr} (${item.gold * 0.1}金)`}</option>
              ))}
            </select>
            <div className={saleEquips.arm.parts[1] === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${saleEquips.arm.parts[1]} を売却 (${Math.floor(saleEquips.arm.gold * 0.1 / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">脚防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={equips.leg.parts[2]!} onChange={(e) => changeLegArmor(e.target.value)}>
              <option value="装備無し">装備無し</option>
              {armorList.filter(item => (
                item.id !== 0 && item.parts[2]
              )).map((item, i) => (
                <option key={i} value={item.parts[2]!}>{`${item.parts[2]} | 性能:${item.sdr} (${item.gold * 0.15}金)`}</option>
              ))}
            </select>
            <div className={saleEquips.leg.parts[2] === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${saleEquips.leg.parts[2]} を売却 (${Math.floor(saleEquips.leg.gold * 0.15 / 2)}金)`}</span>
            </div>
          </div>
        </section>
        {isFirstCreation && (
          <section>
            <h4>4. プロフィールの設定</h4>
            <div>
              <label className="inline-block w-24 sm:text-right">名前: </label>
              <input className="w-72 m-6 px-3 text-left" type="text" value={name} onChange={(e) => changeName(e.target.value)} />
              <button className="block sm:inline-block w-24 h-6 m-auto text-sm/1" onClick={autoName}>自動決定</button>
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
          <button onClick={() => navigate(back)}>{isFirstCreation ? '作成' : '編集'}中断</button>
        </section>
      </div>
      {alertOpen && (
        <Modal message={alertMessage} onClose={() => setAlertOpen(false)} onContinue={null} />
      )}
    </div>
  )
}

export default Setting
