// devProgress/combat.ts

import { type Tasks } from './types'

export const COMBAT_DEV_PROGRESS: Tasks[] = [
  {
    name: 'ドメイン', // ドメイン: 10(28)
    tasks: [
      { name: '戦況クラス', weight: 3, progress: 0 }, // Combat: 全ての情報を集約
      { name: 'ログクラス', weight: 3, progress: 0 }, // Log: ログを管理
      { name: 'ユニットクラス', weight: 3, progress: 0 }, // Unit: ユニットの情報を集約 (キャラクタークラスの拡張)
      { name: 'コマンドクラス', weight: 3, progress: 0 }, // Command: コマンドを管理
      { name: '概要クラス', weight: 3, progress: 0 }, // Summary: ユニットの概要
      { name: '負傷クラス', weight: 3, progress: 0 }, // Health: ユニットの負傷など 
      { name: '攻撃クラス', weight: 3, progress: 0 }, // Offense: ユニットの準備, 狙い, 集中など
      { name: '防御クラス', weight: 3, progress: 0 }, // Defense: ユニットの能動防御など
      { name: '効果クラス', weight: 3, progress: 0 }, // Effect: ユニットの特殊効果など
      { name: '変化クラス', weight: 1, progress: 0 } // Change: ユニットのパラメータ変化など
    ]
  },
  {
    name: 'ベース', // コンポーネント: 6(12)
    tasks: [
      { name: 'レイアウト設計', weight: 1, progress: 0 },
      { name: 'フォーメーション', weight: 2, progress: 0 },
      { name: 'コマンド', weight: 3, progress: 0 },
      { name: 'ターゲット', weight: 1, progress: 0 },
      { name: 'サマリー', weight: 2, progress: 0 },
      { name: 'ログ', weight: 3, progress: 0 }
    ]
  },
  {
    name: 'コマンド', // コマンド: 20 (40)
    tasks: [ 
      { name: '移動', weight: 1, progress: 0 },
      { name: '判定', weight: 1, progress: 0 },
      { name: '攻撃', weight: 2, progress: 0 },
      { name: '防御', weight: 2, progress: 0 },
      { name: 'ダメージ', weight: 2, progress: 0 },
      { name: 'ダメージ効果', weight: 3, progress: 0 },
      { name: '準備', weight: 1, progress: 0 },
      { name: '狙い', weight: 3, progress: 0 },
      { name: '全力防御', weight: 1, progress: 0 },
      { name: '姿勢変更', weight: 1, progress: 0 },
      { name: '装備変更', weight: 1, progress: 0 },
      { name: '射撃', weight: 1, progress: 0 },
      { name: '集中', weight: 1, progress: 0 },
      { name: '法術', weight: 2, progress: 0 },
      { name: '特殊攻撃', weight: 3, progress: 0 },
      { name: '全力攻撃', weight: 3, progress: 0 },
      { name: '部位狙い', weight: 3, progress: 0 },
      { name: 'クリティカル', weight: 3, progress: 0 },
      { name: 'ファンブル', weight: 3, progress: 0 },
      { name: '自動行動', weight: 3, progress: 0 }
    ]
  },
  {
    name: '法術', // 法術: 8(14)
    tasks: [
      { name: '補助呪文', weight: 1, progress: 0 },
      { name: '抵抗呪文', weight: 1, progress: 0 },
      { name: '射撃呪文', weight: 3, progress: 0 },
      { name: '範囲呪文', weight: 1, progress: 0 },
      { name: '回復呪文', weight: 1, progress: 0 },
      { name: '防御呪文', weight: 3, progress: 0 },
      { name: '環境呪文', weight: 1, progress: 0 },
      { name: '特殊呪文', weight: 3, progress: 0 }
    ]
  },
  {
    name: '完成', // 完成: 1(6)
    tasks: [
      { name: '最終調整', weight: 6, progress: 0 }
    ]
  }
] as const
