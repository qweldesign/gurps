// chapters.ts

export const chapters = [
  {
    order: '01',
    heading: 'キャラクター',
    sections: [
      {
        order: '01',
        heading: '判定'
      },
      {
        order: '02',
        heading: 'CPと能力値'
      },
      {
        order: '03',
        heading: '技能'
      },
      {
        order: '04',
        heading: '装備'
      },
      {
        order: '05',
        heading: '意志と宿星'
      },
      {
        order: '06',
        heading: 'ランダム作成'
      }
    ]
  },
  {
    order: '02',
    heading: '基本戦闘',
    sections: [
      {
        order: '01',
        heading: '戦闘の流れ'
      },
      {
        order: '02',
        heading: '行動の解決'
      },
      {
        order: '03',
        heading: 'ダメージ効果'
      },
      {
        order: '04',
        heading: '疲労・一時異状'
      },
      {
        order: '05',
        heading: '起死回生・退却'
      },
      {
        order: '06',
        heading: 'ファンブル'
      }
    ]
  },
  {
    order: '03',
    heading: '上級戦闘',
    sections: [
      {
        order: '01',
        heading: '攻撃型'
      },
      {
        order: '02',
        heading: '姿勢・距離'
      },
      {
        order: '03',
        heading: '部位狙い'
      },
      {
        order: '04',
        heading: '部分防具'
      },
      {
        order: '05',
        heading: '近接戦闘'
      },
      {
        order: '06',
        heading: '反応判定'
      }
    ]
  },
  {
    order: '04',
    heading: '法術',
    sections: [
      {
        order: '01',
        heading: '概要'
      },
      {
        order: '02',
        heading: '効果一覧'
      },
      {
        order: '03',
        heading: 'ファンブル'
      },
      {
        order: '04',
        heading: '魔物'
      }
    ]
  }
] as const
