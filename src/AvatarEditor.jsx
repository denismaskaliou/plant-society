import { useState } from 'react'
import PlantArt from './PlantArt.jsx'
import { Choice, Swatches } from './Choice.jsx'
import {
  LEAVES, LEAF_SIZES, LEAF_COUNTS, SPREADS, PATTERNS, POTS, POT_TEXTURES, HANGERS, LEAF_COLORS, POT_COLORS, randomArt,
} from './avatarOptions.js'

const TABS = [['leaves', '🌿 Листья'], ['pattern', '✨ Узор'], ['pot', '🪴 Горшок'], ['colors', '🎨 Цвета']]

// Отдельный экран редактора: превью и вкладки закреплены сверху, параметры листаются под ними.
export default function AvatarEditor({ art: initialArt, onDone, onCancel }) {
  const [art, setArt] = useState(initialArt)
  const [tab, setTab] = useState('leaves')
  const set = (k) => (v) => setArt((a) => ({ ...a, [k]: v }))

  return (
    <div className="sheet avatar-editor" role="dialog" aria-label="Аватар растения">
      <div className="avatar-top">
        <div className="sheet__bar">
          <button type="button" className="sheet__back" onClick={onCancel}>Отмена</button>
          <button type="button" className="sheet__back avatar-done" onClick={() => onDone(art)}>Готово</button>
        </div>
        <div className="avatar-stage">
          <PlantArt {...art} />
          <button type="button" className="avatar-random" onClick={() => setArt(randomArt())} aria-label="Случайный аватар" title="Случайный аватар">🎲</button>
        </div>
        <div className="tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={`tab${tab === id ? ' tab--on' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </div>

      <section className="panel">
        {tab === 'leaves' && (
          <>
            <Choice label="Форма листа" options={LEAVES} value={art.leaf} onChange={set('leaf')} />
            <Choice label="Размер листа" options={LEAF_SIZES} value={art.leafSize} onChange={set('leafSize')} />
            <Choice label="Количество листьев" options={LEAF_COUNTS} value={art.leafCount} onChange={set('leafCount')} />
            <Choice label="Раскрытие" options={SPREADS} value={art.spread} onChange={set('spread')} />
          </>
        )}
        {tab === 'pattern' && (
          <>
            <Choice label="Узор листа" options={PATTERNS} value={art.pattern} onChange={set('pattern')} />
            {art.pattern !== 'none' && <Swatches label="Цвет узора" colors={LEAF_COLORS} value={art.leaf2Color} onChange={set('leaf2Color')} />}
          </>
        )}
        {tab === 'pot' && (
          <>
            <Choice label="Форма горшка" options={POTS} value={art.pot} onChange={set('pot')} />
            <Choice label="Текстура горшка" options={POT_TEXTURES} value={art.potTexture} onChange={set('potTexture')} />
            <Choice label="Подвесное кашпо" options={HANGERS} value={art.hanger} onChange={set('hanger')} />
            {art.hanger !== 'none' && <Swatches label="Цвет подвеса" colors={POT_COLORS} value={art.hangerColor} onChange={set('hangerColor')} />}
          </>
        )}
        {tab === 'colors' && (
          <>
            <Swatches label="Цвет листьев" colors={LEAF_COLORS} value={art.leafColor} onChange={set('leafColor')} />
            <Swatches label="Цвет горшка" colors={POT_COLORS} value={art.potColor} onChange={set('potColor')} />
          </>
        )}
      </section>
    </div>
  )
}
