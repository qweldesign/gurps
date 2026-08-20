// Setup/BattleSelect.tsx

import { type Character } from '../../domains/Character'

// 出撃メンバー (4名) をセレクトボックスで選ぶ, Setup (一覧画面) 上部への埋め込み用コンポーネント
// 選択状態は Setup 側で管理し (「戦闘へ」ボタンをボタン群側に配置するため), 本体は表示に専念する
function BattleSelect({ units, slots, onChangeSlot }: { units: Character[], slots: (number | null)[], onChangeSlot: (index: number, value: string) => void }) {
  return (
    <div className="mb-12">
      <h4 className="mt-12 mb-6 font-serif italic text-lg before:content-['-'] before:pe-3">出撃メンバー (4名)</h4>
      <div className="table-wrapper">
        {slots.map((selected, i) => (
          <div className="my-1" key={i}>
            <label className="inline-block w-24 sm:text-right">{`Slot ${i + 1}: `}</label>
            <select
              className="w-72 m-6 px-3 text-left"
              value={selected ?? ''}
              onChange={(e) => onChangeSlot(i, e.target.value)}
            >
              <option value="">未選択</option>
              {units
                .filter(u => !slots.includes(u.id) || u.id === selected)
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {`${u.name} | ${u.mainSkill.name}: ${u.mainSkill.level} (HP ${u.maxHp})`}
                  </option>
                ))
              }
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BattleSelect
