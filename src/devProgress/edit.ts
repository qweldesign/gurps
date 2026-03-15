// devProgress/edit.ts

import { type Tasks } from './types'

export const EDIT_DEV_PROGRESS: Tasks[] = [
  {
    name: 'ドメイン', // ドメイン: 4(12)
    tasks: [
      { name: 'パラメータクラス', weight: 3, progress: 3 },
      { name: '装備クラス', weight: 3, progress: 3 },
      { name: 'キャラクタークラス', weight: 3, progress: 3 },
      { name: 'サンプルクラス', weight: 3, progress: 3 }
    ]
  },
  {
    name: 'サンプル画面', // コンポーネント: 3(5)
    tasks: [
      { name: 'サンプル', weight: 1, progress: 1 },
      { name: '一覧', weight: 2, progress: 2 },
      { name: '詳細', weight: 2, progress: 2 }
    ]
  },
  {
    name: '編成画面', // コンポーネント: 5(10)
    tasks: [
      { name: '編成', weight: 1, progress: 1 },
      { name: '一覧', weight: 2, progress: 2 },
      { name: '詳細', weight: 2, progress: 2 },
      { name: '作成/編集', weight: 3, progress: 3 },
      { name: '確認', weight: 2, progress: 2 }
    ]
  },
  {
    name: '機能', // 機能: 8 (17)
    tasks: [ 
      { name: 'CP/所持金設定', weight: 1, progress: 1 },
      { name: 'CP振り分け', weight: 3, progress: 3 },
      { name: '装備選択', weight: 3, progress: 1 },
      { name: 'プロフィール決定', weight: 1, progress: 1 },
      { name: '作成内容確認', weight: 3, progress: 3 },
      { name: '作成内容保存', weight: 3, progress: 3 },
      { name: '編集', weight: 2, progress: 1 },
      { name: '除名', weight: 1, progress: 1 }
    ]
  },
  {
    name: '完成', // 完成: 1(6)
    tasks: [
      { name: '最終調整', weight: 6, progress: 4 }
    ]
  }
] as const
