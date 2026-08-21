// Setup/Edit/OptionsSetting.tsx
// (branch alpha の同名コンポーネント (WIP) を参考に, 初期CP・所持金をまとめて選択する形で実装)

// 選択可能な初期CP/所持金の組み合わせ (CP倍率 1/2/4 に対応. 所持金もCP倍率にあわせてスケーリングする)
const OPTIONS: [points: number, gold: number][] = [
  [10, 100],
  [20, 200],
  [40, 400],
]

// value (select の value 属性) ⇔ 表示ラベルの相互変換
const toValue = (points: number, gold: number) => `${points}/${gold}`
const toLabel = (points: number, gold: number) => `${points}CP / ${gold}金`

// 初期CP・所持金を選択するコンポーネント (ゲーム最初の1人目のキャラクター作成の冒頭にのみ表示.
// 「編成」画面からの新規追加 (2人目以降) では表示しない (キャラクター作成の連番ステップの一部ではないため, 見出しに番号は振らない))
// 選択値はセーブデータ全体の基準として即時保存される (以後の全キャラクター作成・敵/NPCサンプル生成に影響する)
function OptionsSetting({ points, gold, onChange }: { points: number, gold: number, onChange: (points: number, gold: number) => void }) {
  const onSelect = (value: string) => {
    const [p, g] = value.split('/').map(Number)
    onChange(p, g)
  }

  return (
    <section>
      <h4>基本設定</h4>
      <p>キャラクター作成の条件を設定します。
        <br />初期CPや所持金が大きいほど強いキャラクターを作成でき、高度な戦術も扱いやすくなります。
        <br />この選択はセーブデータ全体の基準として保存され、これから作成する仲間や、戦闘で登場する敵の強さにも反映されます。
      </p>
      <div>
        <label className="inline-block w-24 sm:text-right">作成条件: </label>
        <select className="w-72 m-6 px-3 text-left" value={toValue(points, gold)} onChange={(e) => onSelect(e.target.value)}>
          {OPTIONS.map(([p, g]) => (
            <option key={toValue(p, g)} value={toValue(p, g)}>{toLabel(p, g)}</option>
          ))}
        </select>
      </div>
    </section>
  )
}

export default OptionsSetting
