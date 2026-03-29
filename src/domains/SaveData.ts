// SaveData.ts

// LocalStorage, SessionStorage をそれぞれ使用
export const STORAGE_KEY = 'savedata';

const DEFAULT_POINTS = 10
const DEFAULT_GOLD = 100
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
  removeModel(uid: string) {
    const keys = this.data.keys
    if (!keys) return
    const order = keys.indexOf(uid)
    if (order === -1) return
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

  // LocalStorage をクリア
  clear() {
    localStorage.clear()
  }
}
