// Setup/Edit.tsx

import { type Reducer, useReducer, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ParametersSetting from './Edit/ParametersSetting'
import EquipmentsSetting from './Edit/EquipmentsSetting'
import { type ParameterKey, Parameters } from '../../domains/Parameters'
import { WEAPONS, ARMORS, type WeaponKey, type BodyArmorKey, type HeadArmorKey, type ArmArmorKey, type LegArmorKey, type Weapon, type Armor, Equipments } from '../../domains/Equipments'
import { type CharacterModel as Model } from '../../domains/Character'
import { SaveData } from '../../domains/SaveData'

export type ParamsState = {
  // CP
  initialPoints: number // CP: 初期値 0

  // 所持金
  initialGold: number // 所持金: 初期値 0

  // パラメータ
  prevParams: Parameters // 元のパラメータ
  params: Parameters // 現在のパラメータ

  //装備
  isEquipChanged: boolean // 装備を一度でも変更したかどうか
  prevEquips: Equipments // 元の装備
  equips: Equipments // 現在の装備
  saleEquips: Equipments // 外して売却する装備 (売却装備)
  weaponList: [WeaponKey, Weapon][] // 装備可能な武器一覧
  armorList: [BodyArmorKey, Armor][] // 装備可能な防具一覧
}

export type Action =
  | { type: 'INIT', payload: { prevModel: Model,  model: Model } }
  | { type: 'STEP_PARAM', payload: { prevParams: Parameters, name: ParameterKey, size: number } }
  | { type: 'CHANGE_EQUIP', payload: { slot: 'weapon' | 'spare' | 'shield' | 'body' | 'head' | 'arm' | 'leg', name: string } }

function Edit() {
  // セーブデータの読み込み
  const saveData = new SaveData()
  
  // navigate, uid を取得
  let { uid = '00' } = useParams()

  // 新規作成かどうかを変数に格納
  const isFirstCreation: boolean = uid === '00' ? true : false

  // 状態初期値 → ほとんど最初の useEffect で初期値を再代入
  const initialState: ParamsState = {
    initialPoints: 0,
    initialGold: 0,
    prevParams: new Parameters([]),
    params: new Parameters([]),
    isEquipChanged: false,
    prevEquips: new Equipments({}),
    equips: new Equipments({}),
    saleEquips: new Equipments({}),
    weaponList: Object.entries(WEAPONS) as [WeaponKey, Weapon][],
    armorList: Object.entries(ARMORS) as [BodyArmorKey, Armor][]
  }

  // 状態更新 (設定内容)
  const reducer: Reducer<ParamsState, Action> = (state, action) => {
    switch (action.type) {
      case 'INIT':
        // CP, 所持金を取得
        const initialPoints = saveData.loadPoints()
        const initialGold = saveData.loadGold()

        // 元と現在のパラメータ, 装備を取得
        const prevParams = new Parameters(action.payload.prevModel.points)
        const params = new Parameters(action.payload.model.points)
        const prevEquips = new Equipments(action.payload.prevModel.equipments)
        const equips = new Equipments(action.payload.model.equipments)

        // 武器・防具一覧を更新 (派生状態)
        const weaponList = (params.isWarrior ? Object.entries(WEAPONS)
          : Object.entries(WEAPONS).filter(([, weapon]) => weapon.skill !== '武術')
        ) as [WeaponKey, Weapon][]
        const armorList = (params.isWarrior ? Object.entries(ARMORS)
          : Object.entries(ARMORS).filter(([, armor]) => armor.wt <= 2)
        ) as [BodyArmorKey, Armor][]

        // 元と現在の装備を比較し, 異なる場合は元の装備を売却装備に指定
        const saleEquips = new Equipments({ body: '装備無し' })
        if (prevEquips.weapon.name !== equips.weapon.name) {
          saleEquips.weapon = prevEquips.weapon.name as WeaponKey
        }
        if (prevEquips.spare.name !== equips.spare.name) {
          saleEquips.spare = prevEquips.spare.name as WeaponKey
        }
        if (prevEquips.shield.name !== equips.shield.name) {
          saleEquips.shield = prevEquips.shield.name as WeaponKey
        }
        if (prevEquips.body.name[0] !== equips.body.name[0]) {
          saleEquips.body = prevEquips.body.name[0] as BodyArmorKey
        }
        if (prevEquips.head.name[1] !== equips.head.name[1]) {
          saleEquips.head = prevEquips.head.name[1] as HeadArmorKey
        }
        if (prevEquips.arm.name[2] !== equips.arm.name[2]) {
          saleEquips.arm = prevEquips.arm.name[2] as ArmArmorKey
        }
        if (prevEquips.leg.name[3] !== equips.leg.name[3]) {
          saleEquips.leg = prevEquips.leg.name[3] as LegArmorKey
        }

        return {
          ...state,
          initialPoints, initialGold,
          prevParams, params,
          prevEquips, equips, saleEquips,
          weaponList, armorList
        }

      case 'STEP_PARAM': {
        const nextParams = new Parameters(state.params.model)
        nextParams.step(action.payload.name, action.payload.size)

        // 武器・防具一覧を更新 (派生状態)
        const weaponList = (nextParams.isWarrior ? Object.entries(WEAPONS)
          : Object.entries(WEAPONS).filter(([, weapon]) => weapon.skill !== '武術')
        ) as [WeaponKey, Weapon][]
        const armorList = (nextParams.isWarrior ? Object.entries(ARMORS)
          : Object.entries(ARMORS).filter(([, armor]) => armor.wt <= 2)
        ) as [BodyArmorKey, Armor][]

        return {
          ...state,
          params: nextParams,
          weaponList, armorList
        }
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
          const equips = new Equipments(state.equips.model)
          setter(equips, name)

          const saleEquips = new Equipments(state.saleEquips.model)
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
              setter: (eq, name) => eq.weapon = name as WeaponKey,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'spare':
            return changeEquip({
              getter: () => state.prevEquips.spare.name,
              setter: (eq, name) => eq.spare = name as WeaponKey,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'shield':
            return changeEquip({
              getter: () => state.prevEquips.shield.name,
              setter: (eq, name) => eq.shield = name as WeaponKey,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'body':
            return changeEquip({
              getter: () => state.prevEquips.body.name[0],
              setter: (eq, name) => eq.body = name as BodyArmorKey,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'head':
            return changeEquip({
              getter: () => state.prevEquips.head.name[1],
              setter: (eq, name) => eq.head = name as HeadArmorKey,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          case 'arm':
            return changeEquip({
              getter: () => state.prevEquips.arm.name[2],
              setter: (eq, name) => eq.arm = name as ArmArmorKey,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
          
          default: //case 'leg':
            return changeEquip({
              getter: () => state.prevEquips.leg.name[3],
              setter: (eq, name) => eq.leg = name as LegArmorKey,
              isSame: (a, b) => a === b,
              name: action.payload.name
            })
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

  // 残りCPを計算 isMax: true で持ち点を返す
  const calcPoints = (state: ParamsState, isMax: boolean = false): number => {
    let points = state.initialPoints
    if (!isMax) points -= state.params.total
    return points
  }

  // 所持金を計算 isMax: true で持ち金を返す
  const calcGold = (state: ParamsState, isMax: boolean = false): number => {
    let gold = state.initialGold
    // 現在と元の装備の差分 (購入分 - 売却分) を算出
    if (!isMax) gold -= state.equips.gold - state.prevEquips.gold + Math.ceil(state.saleEquips.gold / 2)
    // 算出結果を返す
    return gold
  }

  // 最初に一度だけ実行
  useEffect(() => {    
    onInit() // 初期化
  }, [])

  return (
    <div className="edit px-6">
      <div className="max-w-[48em] mx-auto">
        <h3>キャラクター{isFirstCreation ? '作成' : '編集'}</h3>
        <ParametersSetting isFirstCreation={isFirstCreation} state={state} dispatch={dispatch} calcPoints={calcPoints} />
        <EquipmentsSetting isFirstCreation={isFirstCreation} state={state} dispatch={dispatch} calcGold={calcGold} />
      </div>
    </div>
  )
}

export default Edit
