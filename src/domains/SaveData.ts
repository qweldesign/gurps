// SaveData.ts

// LocalStorage, SessionStorage をそれぞれ使用
export const STORAGE_KEY = 'savedata';

const DEFAULT_POINTS = 10
const DEFAULT_GOLD = 100
const DEFAULT_MULTIPLIER = 2 // CP倍率: 初期CP選択 (10/20/40) に対応する 1/2/4 (未選択時は 2 = CP20相当)
const DEFAULT_MODEL = {
  id: 0,
  name: '未設定',
  gender: '男性',
  points: [],
  equipments: {}
}

// セーブデータを司るクラス
export class SaveData {
  private storageKey: string
  private data: {
    keys?: string[]
    cp?: number
    gold?: number
    multiplier?: number
    battleMembers?: number[]
    initialMod?: number
  }

  constructor() {
    // インデックスの読み込み
    this.storageKey = `${STORAGE_KEY}:index`
    const raw = localStorage.getItem(this.storageKey) ?? '{}'
    this.data = JSON.parse(raw)
  }

  // 保存
  private save(isTemporary: boolean = false) {
    const storage = isTemporary ? sessionStorage : localStorage
    const raw = JSON.stringify(this.data)
    storage.setItem(this.storageKey, raw)
  }

  // 全てのデータを読み込み
  private load(isTemporary: boolean = false) {
    if (isTemporary) {
      const raw = sessionStorage.getItem(this.storageKey) ?? '{}'
      const data = JSON.parse(raw)
      return data
    } else {
      return this.data
    }
  }

  // キーを更新
  saveKeys(keys: Set<string>) {
    this.data = { ...this.data, keys: [...keys].sort() }
    this.save()
  }

  // キーを読み込み
  loadKeys() {
    return new Set(this.data.keys ?? [])
  }

  // キーを追加
  addKey(uid: string) {
    const keys = new Set<string>(this.data.keys ?? [])
    keys.add(uid)
    this.saveKeys(keys)
  }

  // キーを削除
  removeKey(uid: string) {
    const keys = new Set<string>(this.data.keys ?? [])
    keys.delete(uid)
    this.saveKeys(keys)
  }

  // uid を指定してモデルを読み込み
  // インデックスに uid が無ければ空のモデルを返す
  // isTemporary: true で作りかけのデータを読み込み
  loadModel(uid: string, isTemporary: boolean = false) {
    const storage = isTemporary ? sessionStorage : localStorage
    const storageKey = `${STORAGE_KEY}:${uid}`
    let raw = storage.getItem(storageKey) ?? 'null'
    if (isTemporary && raw === 'null') {
      raw = localStorage.getItem(storageKey) ?? 'null'
    }
    const model = JSON.parse(raw) ?? DEFAULT_MODEL
    return model
  }

  // 全てのモデルを読み込み
  loadModels() {
    if (this.data.keys) {
      return this.data.keys.map(uid => {
        return this.loadModel(uid)
      })
    } else {
      return []
    }
  }

  // uid を指定してモデルを削除
  // 除名対象より後ろの (id が大きい) キャラクターは id を1つずつ詰めるため, battleMembers (出撃メンバー, id 配列で保持) の
  // 参照もあわせて更新する (除名対象自身の id は除外し, それより大きい id は1減算する. 放置すると詰め直し後に
  // 別のキャラクターを指す不正な参照になりうるため)
  removeModel(uid: string) {
    const keys = this.data.keys
    if (!keys) return
    const order = keys.indexOf(uid)
    if (order === -1) return
    const removedId = this.loadModel(uid).id
    // 配列を詰める
    keys.forEach((uid, i) => {
      if (i > order) {
        // 旧キーからデータを取り出す
        const model = this.loadModel(uid)
        model.id--
        const newUid = String(model.id).padStart(2, '0') // ID を更新
        const newStorageKey = `${STORAGE_KEY}:${newUid}` // キーを更新
        const raw = JSON.stringify(model)
        localStorage.setItem(newStorageKey, raw) // 新キーへデータを格納
        sessionStorage.setItem(newStorageKey, raw)
      }
    })
    // 末尾を削除
    const latestUid = keys[keys.length - 1]
    const latestUniqueKey = `${STORAGE_KEY}:${latestUid}`
    this.removeKey(latestUid)
    localStorage.removeItem(latestUniqueKey)
    sessionStorage.removeItem(latestUniqueKey)

    // 出撃メンバー (battleMembers) の id 参照を, 上記の id 詰め直しに追従させる
    if (this.data.battleMembers) {
      const battleMembers = this.data.battleMembers
        .filter(id => id !== removedId)
        .map(id => id > removedId ? id - 1 : id)
      this.data = { ...this.data, battleMembers }
      this.save()
    }
  }

  // 出撃メンバー (id配列) を更新
  saveBattleMembers(ids: number[]) {
    this.data = { ...this.data, battleMembers: ids }
    this.save()
  }

  // 出撃メンバー (id配列) を読み込み
  loadBattleMembers(): number[] {
    return this.data.battleMembers ?? []
  }

  // 初期仲間 (ゲーム開始時に自動生成される仲間セット) の生成に使った乱数を更新
  // 戦闘の敵生成時, この値との重複を避けることで, 仲間と同じ顔ぶれの敵が出現しないようにする
  saveInitialMod(mod: number) {
    this.data = { ...this.data, initialMod: mod }
    this.save()
  }

  // 初期仲間の生成に使った乱数を読み込み (未生成の場合は null)
  loadInitialMod(): number | null {
    return this.data.initialMod ?? null
  }

  // CPを更新
  savePoints(cp: number, isTemporary: boolean = false) {
    this.data = { ...this.data, cp }
    this.save(isTemporary)
  }

  // CPを読み込み
  loadPoints(isTemporary: boolean = false) {
    if (isTemporary) {
      return this.load(true).cp ?? DEFAULT_POINTS
    } else {
      return this.data.cp ?? DEFAULT_POINTS
    }
  }

  // 所持金を更新
  saveGold(gold: number, isTemporary: boolean = false) {
    this.data = { ...this.data, gold }
    this.save(isTemporary)
  }

  // 所持金を読み込み
  loadGold(isTemporary: boolean = false) {
    if (isTemporary) {
      return this.load(true).gold ?? DEFAULT_GOLD
    } else {
      return this.data.gold ?? DEFAULT_GOLD
    }
  }

  // CP倍率を更新 (初期CP選択 (10/20/40) にあわせた 1/2/4.
  // SampleCharacter (NPC/敵サンプル) の能力値スケーリングに使用する. 一度選択したら以後は変更しない想定)
  saveMultiplier(multiplier: number) {
    this.data = { ...this.data, multiplier }
    this.save()
  }

  // CP倍率を読み込み
  loadMultiplier(): number {
    return this.data.multiplier ?? DEFAULT_MULTIPLIER
  }

  // LocalStorage をクリア
  clear() {
    localStorage.clear()
  }
}
