// Варианты для редактора аватара растения.
export const LEAVES = [['broad', 'Широкие'], ['spiky', 'Острые'], ['bushy', 'Пышные'], ['round', 'Круглые'], ['drop', 'Капля'], ['heart', 'Сердечки'], ['lance', 'Копьё'], ['needle', 'Иголки'], ['fan', 'Веер'], ['scallop', 'Волнистые']]
export const LEAF_SIZES = [['s', 'Мелкие'], ['m', 'Средние'], ['l', 'Крупные']]
export const LEAF_COUNTS = [['few', 'Мало'], ['mid', 'Средне'], ['many', 'Много']]
export const SPREADS = [['narrow', 'Узкий'], ['normal', 'Обычный'], ['wide', 'Широкий']]
export const PATTERNS = [['none', 'Однотонные'], ['midrib', 'Жилка'], ['stripes', 'Прожилки'], ['spots', 'Пятна'], ['speckle', 'Крапинки'], ['edge', 'Кайма'], ['center', 'Сердцевина']]
export const POTS = [['round', 'Круглый'], ['square', 'Квадратный'], ['tapered', 'Конус'], ['bowl', 'Чаша'], ['tall', 'Высокий'], ['vase', 'Ваза'], ['trough', 'Ящик'], ['egg', 'Яйцо']]
export const POT_TEXTURES = [['smooth', 'Гладкий'], ['ribs', 'Рёбра'], ['grid', 'Клетка'], ['stripes', 'Полоски'], ['dots', 'Горошек'], ['waves', 'Волны'], ['diamonds', 'Ромбы'], ['terrazzo', 'Терраццо']]
export const TRUNKS = [['none', 'Без ствола'], ['single', 'Один ствол'], ['bush', 'Куст']]
export const TRUNK_COUNTS = [['2', '2 ствола'], ['3', '3 ствола'], ['5', '5 стволов']]
export const TRUNK_HEIGHTS = [['low', 'Низкий'], ['mid', 'Средний'], ['high', 'Высокий']]
export const TRUNK_THICK = [['thin', 'Тонкий'], ['thick', 'Толстый']]
export const TRUNK_BENDS = [['straight', 'Прямой'], ['curved', 'Изогнутый']]
export const LEAF_PLACES = [['top', 'На верхушке'], ['along', 'По всему стволу']]
export const TRUNK_COLORS = ['#7a4a32', '#8a5a3c', '#a07a55', '#c9a27a', '#d9cdb5', '#6b4a3a', '#b05a4a', '#5a7a5a', '#3a3d40']
export const HANGERS = [['none', 'Нет'], ['rope', 'Верёвка'], ['chain', 'Цепочка'], ['beads', 'Бусины']]
// Одна палитра и для листьев, и для узора
export const LEAF_COLORS = [
  '#3f8a52', '#4d8f5a', '#2f6b3f', '#1f4d2e', '#7aa83f', '#6a8f9a',
  '#b9dcc0', '#f3e9c6', '#f2d36b', '#f4c6d2', '#e58aa6', '#c0587a',
  '#c9b8e8', '#d9b99b', '#8a5a3c',
  '#2c6e6a', '#7d8a3c', '#b7d94f', '#8fd3b0', '#8fc1e3', '#7a2e45',
  '#e8735f', '#e59a4a', '#fbf7ee', '#2b3a33',
]
export const POT_COLORS = [
  '#c9774f', '#9a5c52', '#7a4a32', '#f2c9a5', '#e8dfcf', '#f6f3ee',
  '#d98aa8', '#e8735f', '#d9a43b', '#8fae93', '#2aa7a0', '#8fc1e3',
  '#2f55b8', '#25356b', '#b7a3dd', '#3a3d40',
  '#c9a27a', '#b87333', '#a14b4b', '#5a7a5a', '#4d8f9a', '#e8c547',
  '#ffd9e8', '#7d8a7a', '#222222',
]
export const DEFAULT_ART = {
  leaf: 'broad', leafSize: 'm', leafCount: 'mid', spread: 'normal', pattern: 'none',
  leafColor: LEAF_COLORS[0], leaf2Color: LEAF_COLORS[7],
  pot: 'round', potTexture: 'smooth', potColor: POT_COLORS[0],
  hanger: 'none', hangerColor: POT_COLORS[4],
  trunk: 'none', trunkCount: '3', trunkHeight: 'mid', trunkThick: 'thin', trunkBend: 'straight', trunkColor: TRUNK_COLORS[0], leafPlace: 'top',
}
const pick = (list) => list[Math.floor(Math.random() * list.length)]
export const randomArt = () => ({
  leaf: pick(LEAVES)[0], leafSize: pick(LEAF_SIZES)[0], leafCount: pick(LEAF_COUNTS)[0], spread: pick(SPREADS)[0],
  pattern: pick(PATTERNS)[0], leafColor: pick(LEAF_COLORS), leaf2Color: pick(LEAF_COLORS),
  pot: pick(POTS)[0], potTexture: pick(POT_TEXTURES)[0], potColor: pick(POT_COLORS),
  ...(Math.random() < 0.35
    ? { trunk: pick(['single', 'bush']), trunkCount: pick(TRUNK_COUNTS)[0], trunkHeight: pick(TRUNK_HEIGHTS)[0], trunkThick: pick(TRUNK_THICK)[0], trunkBend: pick(TRUNK_BENDS)[0], trunkColor: pick(TRUNK_COLORS), leafPlace: pick(LEAF_PLACES)[0] }
    : { trunk: 'none' }),
  hanger: Math.random() < 0.25 ? pick(HANGERS.slice(1))[0] : 'none', hangerColor: pick(POT_COLORS),
})
