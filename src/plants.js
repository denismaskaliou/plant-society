// Коллекция растений. Описания живут в коде, а записи ухода, добавленные в приложении
// («Полил сегодня»), хранятся в Firestore и накладываются сверху (см. storage.js).
//
// photo   — чистое фото в public/plants/ (подпись рисует приложение), null — рисуем SVG-заглушку
// acquired / repotted — { date: 'YYYY-MM' | 'YYYY-MM-DD' } (точность определяется длиной строки)
// care    — события ухода: type = water | fertilize | pest, date = 'YYYY-MM-DD'
// tagline — своя третья строка подписи; иначе собирается из name и aka
export const CARE_TYPES = {
  water: { label: 'Полив', button: 'Полил сегодня', staleDays: 7 },
  fertilize: { label: 'Удобрение', button: 'Удобрил сегодня' },
  pest: { label: 'Обработка от жуков', button: 'Обработал сегодня' },
}

export const PLANTS = [
  {
    id: 'aphelandra',
    name: 'Афеландра торчащая',
    aka: 'зебровое растение',
    tagline: 'Зебра из Бразилии',
    emoji: '🇧🇷💛💚',
    latin: 'Aphelandra squarrosa',
    photo: null,
    art: { leaf: 'broad', leafColor: '#3f8a52', pot: 'round', potColor: '#2aa7a0' },
    acquired: '2026-07-03',
    repotted: '2026-07-05',
    care: [
      { type: 'fertilize', date: '2026-11-16' },
      { type: 'water', date: '2026-11-21' },
    ],
    notes: 'Зал, 1,5 м от окна. Любит рассеянный свет и влагу, «обмякает», когда много света.',
  },
  {
    id: 'stromanthe',
    name: 'Строманта',
    tagline: 'Подружка каламеи',
    emoji: '💗💚🤍',
    latin: "Stromanthe 'Triostar'",
    photo: '/plants/stromanthe.jpg',
    acquired: '2026-06',
    repotted: '2026-08',
    care: [
      { type: 'fertilize', date: '2026-11-16' },
      { type: 'water', date: '2026-11-20' },
      { type: 'pest', date: '2026-11-20' },
    ],
  },
  {
    id: 'philodendron',
    name: 'Филодендрон бархатный',
    emoji: '💛',
    latin: 'Philodendron micans',
    photo: '/plants/philodendron.jpg',
    acquired: '2025-09',
    repotted: '2026-06',
    care: [
      { type: 'fertilize', date: '2026-11-04' },
      { type: 'water', date: '2026-11-17' },
    ],
  },
  {
    id: 'pilea',
    name: 'Пилея Кадье',
    aka: 'алюминиевое растение',
    emoji: '♡',
    latin: 'Pilea cadierei',
    photo: '/plants/pilea.jpg',
    acquired: '2026-10-02',
    repotted: '2026-10-04',
    care: [
      { type: 'fertilize', date: '2026-11-20' },
      { type: 'water', date: '2026-11-20' },
    ],
    notes: 'Висит на стене в зале.',
  },
  {
    id: 'epipremnum',
    name: 'Белый эпик',
    emoji: '🤍🤍',
    latin: "Epipremnum Happy Leaf & N'Joy",
    photo: '/plants/epipremnum.jpg',
    acquired: '2025-09',
    repotted: '2026-05',
    care: [
      { type: 'fertilize', date: '2026-11-14' },
      { type: 'water', date: '2026-11-20' },
    ],
    notes: 'Висит на солнечной стене.',
  },
  {
    id: 'ficus-lyrata',
    name: 'Фикус Лирата',
    aka: 'Конина',
    emoji: '😅🐴',
    latin: 'Ficus lyrata',
    photo: '/plants/ficus-lyrata.jpg',
    acquired: '2026-04',
    repotted: '2026-07',
    care: [
      { type: 'fertilize', date: '2026-11-20' },
      { type: 'water', date: '2026-11-20' },
    ],
    notes: 'Растёт быстро, любит много удобрения.',
  },
  {
    id: 'ficus-elastica',
    name: 'Фикус эластика',
    aka: 'Конь',
    emoji: '♡',
    latin: "Ficus elastica 'Belize'",
    photo: '/plants/ficus-elastica.jpg',
    acquired: '2025-01',
    repotted: '2026-06',
    care: [
      { type: 'fertilize', date: '2026-11-20' },
      { type: 'water', date: '2026-11-21' },
    ],
    notes: 'Воздушные корни. В одном горшке два черенка.',
  },
]

// ---------- даты ----------
const MS_DAY = 86400000
const parse = (s) => {
  const [y, m, d = 1] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const strip = (s) => s.replace(/\s*г\.$/, '')

// «июнь 2026» для месяца, «3 июля 2026» для точной даты
export function formatDate(s) {
  if (!s) return ''
  const d = parse(s)
  return s.length === 7
    ? strip(d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }))
    : strip(d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }))
}

export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysSince(s) {
  const now = parse(today())
  return Math.round((now - parse(s)) / MS_DAY)
}

function plural(n, one, few, many) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

export function agoText(s) {
  const n = daysSince(s)
  if (n <= 0) return 'сегодня'
  if (n === 1) return 'вчера'
  return `${n} ${plural(n, 'день', 'дня', 'дней')} назад`
}

// Последнее событие заданного типа из списка событий.
export function lastCare(care, type) {
  return care.filter((c) => c.type === type).reduce((a, c) => (!a || c.date > a ? c.date : a), null)
}

// Третья строка подписи: свой tagline, иначе «Название, aka «…»».
export function captionLine({ name, aka, tagline }) {
  if (tagline) return tagline
  return aka ? `${name}, aka «${aka}»` : name
}
