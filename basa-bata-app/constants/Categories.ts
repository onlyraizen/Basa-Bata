export interface WordItem {
  id: number;
  word: string;
  icon: string;
  syllables?: string; // For slow-down hint (e.g., "a-so")
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string; // Category theme color
  words: WordItem[];
}

export const CATEGORIES: { [key: string]: Category } = {
  hayop: {
    id: 'hayop',
    title: 'Mga Hayop',
    subtitle: 'Animals',
    icon: '🦁',
    color: '#F59E0B', // Amber
    words: [
      { id: 1, word: 'aso',  icon: '🐶', syllables: 'a-so' },
      { id: 2, word: 'pusa', icon: '🐱', syllables: 'pu-sa' },
      { id: 3, word: 'ibon', icon: '🐦', syllables: 'i-bon' },
    ],
  },
  kulay: {
    id: 'kulay',
    title: 'Mga Kulay',
    subtitle: 'Colors',
    icon: '🎨',
    color: '#A855F7', // Purple
    words: [
      { id: 1, word: 'pula',  icon: '🔴', syllables: 'pu-la' },
      { id: 2, word: 'asul',  icon: '🔵', syllables: 'a-sul' },
      { id: 3, word: 'dilaw', icon: '🟡', syllables: 'di-law' },
    ],
  },
  bilang: {
    id: 'bilang',
    title: 'Mga Bilang',
    subtitle: 'Numbers',
    icon: '🔢',
    color: '#3B82F6', // Blue
    words: [
      { id: 1, word: 'isa',    icon: '1️⃣', syllables: 'i-sa' },
      { id: 2, word: 'dalawa', icon: '2️⃣', syllables: 'da-la-wa' },
      { id: 3, word: 'tatlo',  icon: '3️⃣', syllables: 'tat-lo' },
    ],
  },
  katawan: {
    id: 'katawan',
    title: 'Ang Katawan',
    subtitle: 'Body Parts',
    icon: '👋',
    color: '#EF4444', // Red
    words: [
      { id: 1, word: 'mata',  icon: '👁️', syllables: 'ma-ta' },
      { id: 2, word: 'ilong', icon: '👃', syllables: 'i-long' },
      { id: 3, word: 'bibig', icon: '👄', syllables: 'bi-big' },
    ],
  },
  prutas: {
    id: 'prutas',
    title: 'Mga Prutas',
    subtitle: 'Fruits',
    icon: '🍎',
    color: '#22C55E', // Green
    words: [
      { id: 1, word: 'mangga', icon: '🥭', syllables: 'mang-ga' },
      { id: 2, word: 'saging', icon: '🍌', syllables: 'sa-ging' },
      { id: 3, word: 'ubas',   icon: '🍇', syllables: 'u-bas' },
    ],
  },
  pagkain: {
    id: 'pagkain',
    title: 'Mga Pagkain',
    subtitle: 'Food',
    icon: '🍚',
    color: '#EC4899', // Pink
    words: [
      { id: 1, word: 'kanin',  icon: '🍚', syllables: 'ka-nin' },
      { id: 2, word: 'tinapay', icon: '🍞', syllables: 'ti-na-pay' },
      { id: 3, word: 'itlog',  icon: '🥚', syllables: 'it-log' },
    ],
  },
};

// Total word count helper
export const TOTAL_WORDS = Object.values(CATEGORIES).reduce(
  (sum, cat) => sum + cat.words.length,
  0
);