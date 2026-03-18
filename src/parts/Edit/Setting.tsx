import { type ReactNode, type Reducer, useState, useReducer, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import Modal from '../common/Modal'
import { type Parameter, PARAMETER_LIST, type ParameterName, Parameters } from '../../domains/Parameters'
import { WEAPON_LIST, ARMOR_LIST, type Weapon, type Armor, Equipments } from '../../domains/Equipments'
import { Character, type CharacterModel as Model } from '../../domains/Character'
import { PC_LIST } from '../../domains/SampleCharacter'
import { SaveData } from '../../domains/SaveData'

type ParamsState = {
  // CP
  initialPoints: number // CP: 初期値 0
  startPoints: number // 新規作成時のみ足されるCP

  // 所持金
  initialGold: number // 所持金: 初期値 0
  startGold: number // 新規作成時のみ足されるユニットの所持金

  // パラメータ
  prevParams: Parameters // 元のパラメータ
  params: Parameters // 現在のパラメータ

  //装備
  isEquipChanged: boolean // 装備を一度でも変更したかどうか
  prevEquips: Equipments // 元の装備
  equips: Equipments // 現在の装備
  saleEquips: Equipments // 外して売却する装備 (売却装備)
  weaponList: Weapon[] // 装備可能な武器一覧
  armorList: Armor[] // 装備可能な防具一覧

  // プロフィール
  name: string // 名前設定
  gender: string // 性別設定

  // 状態遷移トリガー
  transitions: {
    becameWarrior: boolean
    lostWarrior: boolean
  }
}

type Action =
  | { type: 'INIT', payload: { prevModel: Model,  model: Model } }
  | { type: 'SET_OPTIONS', payload: { value: string } }
  | { type: 'STEP_PARAM', payload: { prevParams: Parameters, name: ParameterName, size: number } }
  | { type: 'RESET_EQUIPS', payload: { prevModel: Model } }
  | { type: 'CHANGE_EQUIP', payload: { slot: 'weapon' | 'missile' | 'shield' | 'body' | 'head' | 'arm' | 'leg', name: string } }
  | { type: 'SET_NAME', payload: { name: string } }
  | { type: 'SET_GENDER', payload: { gender: string } }
  | { type: 'AUTO_NAME', payload: { gender: string } }
  | { type: 'CLEAR_TRANSITION' }

function Setting() {
  // セーブデータの読み込み
  const saveData = new SaveData()
  const keys = saveData.loadKeys()
  
  // uid, navigate を取得
  const { uid } = useLoaderData()
  const navigate = useNavigate()

  // 新規作成かどうかを変数に格納
  const isFirstCreation: boolean = uid === '00' ? true : false

  // 状態初期値 → ほとんど最初の useEffect で初期値を再代入
  const initialState: ParamsState = {
    initialPoints: 0,
    startPoints: 10,
    initialGold: 0,
    startGold: 100,
    prevParams: new Parameters([]),
    params: new Parameters([]),
    isEquipChanged: false,
    prevEquips: new Equipments({}),
    equips: new Equipments({}),
    saleEquips: new Equipments({}),
    name: '未設定',
    gender: '男性',
    weaponList: WEAPON_LIST,
    armorList: ARMOR_LIST,
    transitions: {
      becameWarrior: false,
      lostWarrior: false
    }
  }

  // 状態更新 (設定内容)
  const reducer: Reducer<ParamsState, Action> = (state, action) => {
    switch (action.type) {
      case 'INIT':
        // 名前, 性別, 元のCP, 所持金を取得
        const name = action.payload.model.name // 一時保存データがあれば優先
        const gender = action.payload.model.gender // 同様
        const initialPoints = action.payload.prevModel.totalPoints
        const initialGold = saveData.loadGold()

        // 元のパラメータ, 装備と現在のパラメータ, 装備を取得
        const prevParams = new Parameters(action.payload.prevModel.points)
        const params = new Parameters(action.payload.model.points)
        const prevEquips = new Equipments(action.payload.prevModel.equipments)
        const equips = new Equipments(action.payload.model.equipments)

        // 武器・防具一覧を更新 (派生状態)
        const weaponList = params.isWarrior ? WEAPON_LIST
          : WEAPON_LIST.filter(item => item.skillType !== '武術')
        const armorList = params.isWarrior ? ARMOR_LIST
          : ARMOR_LIST.filter(item => item.wt <= 2)

        // 元と現在の装備を比較し, 異なる場合は元の装備を売却装備に指定
        const saleEquips = new Equipments({ body: '装備無し' })
        if (prevEquips.weapon.name !== equips.weapon.name) {
          saleEquips.weapon = prevEquips.weapon.name
        }
        if (prevEquips.missile.name !== equips.missile.name) {
          saleEquips.missile = prevEquips.missile.name
        }
        if (prevEquips.shield.name !== equips.shield.name) {
          saleEquips.shield = prevEquips.shield.name
        }
        if (prevEquips.body.name !== equips.body.name) {
          saleEquips.body = prevEquips.body.name
        }
        if (prevEquips.head.parts[0] !== equips.head.parts[0]) {
          saleEquips.head = prevEquips.head.parts[0]
        }
        if (prevEquips.arm.parts[1] !== equips.arm.parts[1]) {
          saleEquips.arm = prevEquips.arm.parts[1]
        }
        if (prevEquips.leg.parts[2] !== equips.leg.parts[2]) {
          saleEquips.leg = prevEquips.leg.parts[2]
        }

        return {
          ...initialState,
          name, gender,
          initialPoints, initialGold,
          prevParams, params,
          prevEquips, equips, saleEquips,
          weaponList, armorList
        }

      case 'SET_OPTIONS':
        // input からの値を CP/所持金 に変換
        const [p, m] = action.payload.value.split('/')
        const startPoints = Number(p)
        const startGold = Number(m)
        return {
          ...state,
          startPoints, startGold
        }

      case 'STEP_PARAM': {
        const prevParams = action.payload.prevParams
        const nextParams = new Parameters(state.params.toModel())
        nextParams.step(action.payload.name, action.payload.size)

        // 武器・防具一覧を更新 (派生状態)
        const weaponList = nextParams.isWarrior ? WEAPON_LIST
          : WEAPON_LIST.filter(item => item.skillType !== '武術')
        const armorList = nextParams.isWarrior ? ARMOR_LIST
          : ARMOR_LIST.filter(item => item.wt <= 2)

        // 状態遷移トリガー
        const becameWarrior = !prevParams.isWarrior && nextParams.isWarrior
        const lostWarrior = prevParams.isWarrior && !nextParams.isWarrior

        return {
          ...state,
          params: nextParams,
          weaponList, armorList,
          transitions: {
            becameWarrior, lostWarrior
          }
        }
      }

      case 'RESET_EQUIPS':
        return {
          ...state,
          isEquipChanged: false,
          equips: new Equipments(action.payload.prevModel.equipments),
          saleEquips: new Equipments({ body: '装備無し' })
        }

      case 'CHANGE_EQUIP':
        const changeEquip = <T,>({
          getter, // 元の装備の名前を取得する関数
          setter, // 装備を所定の位置にセットする関数
          isSame, // 元の装備と新しい装備の名前を比較する関数
          name
        }: {
          getter: () => T
          setter: (eq: Equipments, name: T | '装備無し') => void
          isSame: (a: T, b: T) => boolean
          name: T
        }) => {
          const prevName = getter()
          const equips = new Equipments(state.equips.toModel())
          setter(equips, name)

          const saleEquips = new Equipments(state.saleEquips.toModel())
          if (!isSame(prevName, name)) {
            // 新しい装備を着用した場合, 元の装備を売却する  
            setter(saleEquips, prevName)
          } else {
            // 元の装備に戻した場合, 売却装備に「装備無し」を指定する
            setter(saleEquips, '装備無し')
          }

          return {
            ...state,
            isEquipChanged: true,
            equips,
            saleEquips
          }
        }

        switch (action.payload.slot) {
          case 'weapon':
            return changeEquip({
              getter: () => state.prevEquips.weapon.name,
              setter: (eq, name) => eq.weapon = name,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'missile':
            return changeEquip({
              getter: () => state.prevEquips.missile.name,
              setter: (eq, name) => eq.missile = name,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'shield':
            return changeEquip({
              getter: () => state.prevEquips.shield.name,
              setter: (eq, name) => eq.shield = name,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'body':
            return changeEquip({
              getter: () => state.prevEquips.body.name,
              setter: (eq, name) => eq.body = name,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'head':
            return changeEquip({
              getter: () => state.prevEquips.head.parts[0],
              setter: (eq, name) => eq.head = name,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'arm':
            return changeEquip({
              getter: () => state.prevEquips.arm.parts[1],
              setter: (eq, name) => eq.arm = name,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          default: //case 'leg':
            return changeEquip({
              getter: () => state.prevEquips.leg.parts[2],
              setter: (eq, name) => eq.leg = name,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
        }
      
      case 'SET_NAME':
        return {
          ...state,
          name: action.payload.name
        }
      
      case 'SET_GENDER':
        return {
          ...state,
          gender: action.payload.gender
        }

      case 'AUTO_NAME':
        const g = action.payload.gender === '男性' ? 0 : 1
        const n = Math.floor((Math.random() + g) * PC_LIST.length / 2)
        
        return {
          ...state,
          name: PC_LIST[n]
        }

      case 'CLEAR_TRANSITION':
        return {
          ...state,
          transitions: {
            becameWarrior: false,
            lostWarrior: false
          }
        }

      default:
        return state
    }
  }

  // 状態管理 (設定内容)
  const [state, dispatch] = useReducer(reducer, initialState)

  // INIT
  const onInit = () => {
    // LocalStorage からキャラクターデータを取得
    const prevModel: Model = saveData.loadModel(uid)
    // SessionStorage から作りかけのデータを取得
    const model: Model = saveData.loadModel(uid, true)
    // 発火
    dispatch({ type: 'INIT', payload: { prevModel, model } })
  }

  // SET_OPTIONS
  const onSetOptions = (value: string) => {
    // 発火
    dispatch({ type: 'SET_OPTIONS', payload: { value } })
  }

  // STEP_PARAM
  const onStepParam = (name: ParameterName, size: number) => {
    // 発火
    dispatch({ type: 'STEP_PARAM', payload: { prevParams: state.params , name, size } }) 
  }

  // RESET_EQUIPS
  const onResetEquip = (prevModel: Model) => {
    // 発火
    dispatch({ type: 'RESET_EQUIPS', payload: { prevModel } }) 
  }

  // CHANGE_EQUIP
  const onChangeEquip = (slot: 'weapon' | 'missile' | 'shield' | 'body' | 'head' | 'arm' | 'leg', name: string) => {
    // 発火
    dispatch({ type: 'CHANGE_EQUIP', payload: { slot, name } }) 
  }

  // SET_NAME
  const onSetName = (name: string) => {
    // 発火
    dispatch({ type: 'SET_NAME', payload: { name } })
  }

  // SET_GENDER
  const onSetGender = (gender: string) => {
    // 発火
    dispatch({ type: 'SET_GENDER', payload: { gender } })
  }

  // AUTO_NAME
  const autoName = () => {
    // 発火
    dispatch({ type: 'AUTO_NAME', payload: { gender: state.gender } })
  }

  // CLEAR_TRANSITION
  const clearTransition = () => {
    // 発火
    dispatch({ type: 'CLEAR_TRANSITION' })
  }

  // 残りCPを計算 isMax: true で持ち点を返す
  const calcPoints = (state: ParamsState, isMax: boolean = false): number => {
    let points = state.initialPoints
    if (isFirstCreation) points += state.startPoints
    if (!isMax) points -= state.params.total
    return points
  }

  // 能力値, 技能一覧表
  const parameterGroups = [
    { label: '能力値', filter: (p: Parameter) => p.base === 10 },
    { label: '筋力を基準とする技能', filter: (p: Parameter) => p.base === '筋力' },
    { label: '生命力を基準とする技能', filter: (p: Parameter) => p.base === '生命力' },
    { label: '敏捷力を基準とする技能', filter: (p: Parameter) => p.base === '敏捷力' },
    { label: '知力を基準とする技能', filter: (p: Parameter) => p.base === '知力' },
  ]

  // 増減ボタンの状態を取得 (true: 有効 / false: 無効)
  const getButtonDisable = (name: ParameterName, size: number, i: number) => {
    if (Number(uid) > 0 && i === 0) return true
    const prevPoint = state.prevParams.get(name)
    const currentPoint = state.params.get(name)
    const nextParams = new Parameters(state.params.toModel())
    const nextPoint = nextParams.step(name, size)
    // 下限を下回る場合, 合計を上回る場合は disable を true に 
    return ((prevPoint === nextPoint && currentPoint === 0) || prevPoint > nextPoint || nextParams.total > calcPoints(state, true))
  }

  // 所持金を計算 isMax: true で持ち金を返す
  const calcGold = (state: ParamsState, isMax: boolean = false): number => {
    let gold = state.initialGold
    //「武術」保有の有無で新規作成時のユニットの所持金倍率が変化
    const startGoldRate = state.params.isWarrior ? 2 : 1
    if (isFirstCreation) gold += state.startGold * startGoldRate
    // 現在と元の装備の差分 (購入分 - 売却分) を算出
    if (!isMax) gold -= state.equips.gold - state.prevEquips.gold + Math.ceil(state.saleEquips.gold / 2)
    // 算出結果を返す
    return gold
  }

  // 名前が設定されているか判定
  const checkName = (state: ParamsState): boolean => {
    return state.name !== '未設定' && state.name !== '' 
  }

  // 状態管理 (Modal に渡すパラメータ)
  const [alertMessage, setAlertMessage] = useState<ReactNode>('Test Alert.')
  const [alertOpen, setAlertOpen] = useState(false)

  // 最初に一度だけ実行
  useEffect(() => {    
    onInit() // 初期化
  }, [])

  // 「武術」セット/リセットを監視
  useEffect(() => {
    if (state.transitions.becameWarrior && state.isEquipChanged) {
      //「武術」セット時 & 一度でも装備を変更していた場合
      // アラート表示 (装備解除はしない)
      const message = (
        <p className="text-center">「武術」がセットされたため、ユニットの所持金が2倍になりました。
          <br />装備可能な武器・防具が変わったため、装備の選択をやり直してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      clearTransition()
    } else if (state.transitions.lostWarrior) {
      //「武術」リセット時
      // アラート表示 & 装備解除
      const message = (
        <p className="text-center">「武術」がリセットされたため、ユニットの所持金が半分になりました。
          <br />装備可能な武器・防具が変わったため、装備の選択をやり直してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      // LocalStorage からキャラクターデータを取得
      const prevModel: Model = saveData.loadModel(uid)
      onResetEquip(prevModel)
      clearTransition()
    }
  }, [state.transitions.becameWarrior, state.transitions.lostWarrior])

  // 所持金・装備変更を監視
  useEffect(() => {
    if (calcGold(state) < 0) {
      // 所持金が赤字になった場合のアラート
      const message = (
        <p className="text-center">装備の購入金額が所持金を超えています。
          <br />装備を変更してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
    }
  }, [state.transitions?.becameWarrior, state.transitions?.lostWarrior, state.startGold, state.equips])

  // 確認
  const confirm = () => {
    // 新規作成時で points を使い切ってない場合のアラート
    if (isFirstCreation && calcPoints(state)) {
      const message = (
        <p className="text-center">キャラクターポイントを使い切っていません。
          <br />ポイントを使い切ってください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      return
    }

    // 装備の購入金額が所持金を超えている場合のアラート
    if (calcGold(state) < 0) {
      const message = (
        <p className="text-center">装備の購入金額が所持金を超えています。
          <br />装備を変更してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      return
    }

    // 新規作成時で名前が未設定の場合のアラート
    if (isFirstCreation && !checkName(state)) {
      const message = (
        <p className="text-center">名前を設定してください。</p>
      )
      setAlertMessage(message)
      setAlertOpen(true)
      return
    }

    // 確認用モデルの作成
    const { name, gender, initialPoints, startPoints, params, equips } = state
    const confirmModel: Model = {
      id: Number(uid),
      name, gender,
      totalPoints: initialPoints || startPoints,
      points: params.toModel(),
      equipments: equips.toModel()
    }
    
    // キャラクターデータの一時保存 (SessionStorage を使用)
    const unit = new Character(confirmModel)
    unit.save(true)

    // 所持金の一時保存
    saveData.saveGold(calcGold(state), true)

    // 確認画面へ進む
    if (!isFirstCreation) {
      navigate(`/edit/confirm/${uid}`)
    } else {
      navigate(`/edit/confirm/`)
    }
  }

  // 作成 (編集) 中断
  const back = () => navigate(keys.size ? '/edit/' : '/')

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
              <select className="w-48 m-6 ps-3 text-center" onChange={(e) => onSetOptions(e.target.value)}>
                <option value="10/100">{'10CP / 100金'}</option>
              </select>
            </div>
          </section>
        )}
        <section>
          {isFirstCreation && (
            <>
              <h4>2. キャラクターポイントの振り分け</h4>
              <p>合計{calcPoints(state, true)}点のキャラクターポイントを振り分けてキャラクターを作成します。
                <br />能力値や技能値は、値が高くなるほどポイントを多く消耗します。
                <br />能力値は技能値の基準となるので、多めに振り分けましょう。
                <br />ポイントは最小0.5点単位で振り分けることができます。
              </p>
            </>
          )}
          <h5>残りCP: <span className={calcPoints(state) > 0 ? 'text-amber-400 font-bold' : 'font-bold'}>{calcPoints(state)} 点</span></h5>
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
                            onClick={() => onStepParam(p.name, -1)}
                          >-</button>
                          <span className="inline-block w-6 text-center">{state.params.getLevel(p.name)}</span>
                          <button
                            className="w-6 h-6 my-0 mx-3 leading-1"
                            disabled={getButtonDisable(p.name, 1, i)}
                            onClick={() => onStepParam(p.name, 1)}
                          >+</button>
                        </td>
                        <td className="w-6 text-center">{state.params.get(p.name)}</td>
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
              <p>合計{calcGold(state, true)}金の所持金でキャラクターの装備を購入します。
                <br />「武術」の保有者はユニットの所持金が倍になります（戦いを職業としているため、優遇されます）。
              </p>
            </>
          )}
          <h5>残り所持金: <span className={calcGold(state) < 0 ? 'text-red-600 font-bold' : 'font-bold'}>{calcGold(state)} 金</span></h5>
          <div>
            <label className="inline-block w-24 sm:text-right">主用武器: </label>
            <select className="w-72 m-6 px-3 text-left" value={state.equips.weapon.name} onChange={(e) => onChangeEquip('weapon', e.target.value)}>
              <option value="装備無し">装備無し</option>
              {state.weaponList.filter(item => (
                // 格闘, 射撃, 盾を除く
                item.weaponType !== 0 && item.weaponType !== 5 && item.weaponType !== 6
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.baseDmg / 2} (${item.gold}金)`}</option>
              ))}
            </select>
            <div className={state.saleEquips.weapon.name === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${state.saleEquips.weapon.name} を売却 (${Math.floor(state.saleEquips.weapon.gold / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">射撃武器: </label>
            <select className="w-72 m-6 px-3 text-left" value={state.equips.missile.name} onChange={(e) => onChangeEquip('missile', e.target.value)}>
              <option value="装備無し">装備無し</option>
              {state.weaponList.filter(item => (
                // 射撃武器のみを取り出す
                item.weaponType === 5
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.baseDmg / 2} (${item.gold}金)`}</option>
              ))}
            </select>
            <div className={state.saleEquips.missile.name === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${state.saleEquips.missile.name} を売却 (${Math.floor(state.saleEquips.missile.gold / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">盾: </label>
            <select className="w-72 m-6 px-3 text-left" value={state.equips.shield.name} onChange={(e) => onChangeEquip('shield', e.target.value)}>
              <option value="装備無し">装備無し</option>
              {state.weaponList.filter(item => (
                // 盾のみを取り出す
                item.weaponType === 6
              )).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.ev} (${item.gold}金)`}</option>
              ))}
            </select>
            <div className={state.saleEquips.shield.name === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${state.saleEquips.shield.name} を売却 (${Math.floor(state.saleEquips.shield.gold / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">胴防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={state.equips.body.name} onChange={(e) => onChangeEquip('body', e.target.value)}>
              {state.armorList.filter(item => item.id !== 0).map((item, i) => (
                <option key={i} value={item.name}>{`${item.name} | 性能:${item.sdr} (${item.gold * 0.5}金)`}</option>
              ))}
            </select>
            <div className={state.saleEquips.body.name === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${state.saleEquips.body.name} を売却 (${Math.floor(state.saleEquips.body.gold * 0.5 / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">頭防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={state.equips.head.parts[0]!} onChange={(e) => onChangeEquip('head', e.target.value)}>
              <option value="装備無し">装備無し</option>
              {state.armorList.filter(item => (
                item.id !== 0 && item.parts[0]
              )).map((item, i) => (
                <option key={i} value={item.parts[0]!}>{`${item.parts[0]} | 性能:${item.sdr} (${item.gold * 0.25}金)`}</option>
              ))}
            </select>
            <div className={state.saleEquips.head.parts[0] === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${state.saleEquips.head.parts[0]} を売却 (${Math.floor(state.saleEquips.head.gold * 0.25 / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">腕防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={state.equips.arm.parts[1]!} onChange={(e) => onChangeEquip('arm', e.target.value)}>
              <option value="装備無し">装備無し</option>
              {state.armorList.filter(item => (
                item.id !== 0 && item.parts[1]
              )).map((item, i) => (
                <option key={i} value={item.parts[1]!}>{`${item.parts[1]} | 性能:${item.sdr} (${item.gold * 0.1}金)`}</option>
              ))}
            </select>
            <div className={state.saleEquips.arm.parts[1] === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${state.saleEquips.arm.parts[1]} を売却 (${Math.floor(state.saleEquips.arm.gold * 0.1 / 2)}金)`}</span>
            </div>
          </div>
          <div>
            <label className="inline-block w-24 sm:text-right">脚防具: </label>
            <select className="w-72 m-6 px-3 text-left" value={state.equips.leg.parts[2]!} onChange={(e) => onChangeEquip('leg', e.target.value)}>
              <option value="装備無し">装備無し</option>
              {state.armorList.filter(item => (
                item.id !== 0 && item.parts[2]
              )).map((item, i) => (
                <option key={i} value={item.parts[2]!}>{`${item.parts[2]} | 性能:${item.sdr} (${item.gold * 0.15}金)`}</option>
              ))}
            </select>
            <div className={state.saleEquips.leg.parts[2] === '装備無し' ? 'hidden' : 'inline-block'}>
              <span>{`${state.saleEquips.leg.parts[2]} を売却 (${Math.floor(state.saleEquips.leg.gold * 0.15 / 2)}金)`}</span>
            </div>
          </div>
        </section>
        {isFirstCreation && (
          <section>
            <h4>4. プロフィールの設定</h4>
            <div>
              <label className="inline-block w-24 sm:text-right">名前: </label>
              <input className="w-72 m-6 px-3 text-left" type="text" value={state.name} onChange={(e) => onSetName(e.target.value)} />
              <button className="block sm:inline-block w-24 h-6 m-auto text-sm/1" onClick={autoName}>自動決定</button>
            </div>
            <div>
              <label className="inline-block w-24 sm:text-right">性別: </label>
              <select className="w-72 m-6 px-3 text-left" value={state.gender} onChange={(e) => onSetGender(e.target.value)}>
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
          <button onClick={back}>{isFirstCreation ? '作成' : '編集'}中断</button>
        </section>
      </div>
      {alertOpen && (
        <Modal message={alertMessage} onClose={() => setAlertOpen(false)} onContinue={null} />
      )}
    </div>
  )
}

export default Setting
