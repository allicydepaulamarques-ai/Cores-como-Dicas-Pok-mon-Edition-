const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const SCORE_STORAGE_KEY = 'cores-como-dicas-score';

const DIFFICULTY = {
  easy: { attemptsPerPokemon: 3, maxPokemonPerRound: 5, points: 120, colorSpread: 26 },
  normal: { attemptsPerPokemon: 3, maxPokemonPerRound: 5, points: 100, colorSpread: 42 },
  hard: { attemptsPerPokemon: 3, maxPokemonPerRound: 5, points: 150, colorSpread: 16 }
};

const state = {
  mode: 'normal',
  score: 0,
  streak: 0,
  attemptsUsed: 0,
  attemptsPerPokemon: 3,
  roundPokemonCount: 0,
  maxPokemonPerRound: 5,
  current: null,
  availableColors: [],
  locked: false,
};

const scoreNode = document.getElementById('score');
const streakNode = document.getElementById('streak');
const livesNode = document.getElementById('lives');
const roundProgressNode = document.getElementById('round-progress');
const nameNode = document.getElementById('pokemon-name');
const spriteNode = document.getElementById('pokemon-sprite');
const colorGrid = document.getElementById('color-grid');
const feedbackNode = document.getElementById('feedback');
const nextButton = document.getElementById('next-round');
const modeButtons = document.querySelectorAll('.mode-button');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');

function setFeedback(message, type = '') {
  feedbackNode.textContent = message;
  feedbackNode.className = 'feedback';
  if (type) feedbackNode.classList.add(type);
}

function setScreen(mode) {
  if (mode === 'game') {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  } else {
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
  }
}

function getStoredScore() {
  try {
    const saved = Number.parseInt(localStorage.getItem(SCORE_STORAGE_KEY) || '0', 10);
    return Number.isFinite(saved) ? saved : 0;
  } catch (error) {
    return 0;
  }
}

function saveScore() {
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, String(state.score));
  } catch (error) {
    // Ignora falhas de armazenamento do navegador.
  }
}

function updateHud() {
  scoreNode.textContent = String(state.score);
  streakNode.textContent = String(state.streak);
  livesNode.textContent = String(Math.max(0, state.attemptsPerPokemon - state.attemptsUsed));
  roundProgressNode.textContent = `${Math.min(state.roundPokemonCount, state.maxPokemonPerRound)}/${state.maxPokemonPerRound}`;
  saveScore();
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const normalized = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;

  const number = Number.parseInt(normalized, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

function shiftHex(hex, deltaH = 0, deltaS = 0, deltaL = 0) {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  const hue = ((h * 360 + deltaH + 360) % 360) / 360;
  const saturation = Math.max(0, Math.min(1, s + deltaS));
  const lightness = Math.max(0, Math.min(1, l + deltaL));

  const sat = saturation;
  const lum = lightness;
  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs((hue * 6 % 2) - 1));
  const m = lum - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  const segment = Math.floor(hue * 6);
  switch (segment) {
    case 0: r1 = c; g1 = x; b1 = 0; break;
    case 1: r1 = x; g1 = c; b1 = 0; break;
    case 2: r1 = 0; g1 = c; b1 = x; break;
    case 3: r1 = 0; g1 = x; b1 = c; break;
    case 4: r1 = x; g1 = 0; b1 = c; break;
    default: r1 = c; g1 = 0; b1 = x; break;
  }

  return rgbToHex(Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255));
}

function buildColorOptions(correctHex, spread = 26) {
  const colors = new Set([correctHex]);
  const offsets = [
    [0, 0.04, 0.04],
    [18, 0.03, 0.02],
    [-18, 0.02, -0.02],
    [35, -0.06, 0.05],
    [-35, -0.04, -0.05],
    [50, 0.02, 0.08],
    [-50, 0.04, -0.08],
    [70, -0.08, 0.05],
    [-70, 0.01, -0.06]
  ];

  offsets.forEach(([h, s, l]) => {
    colors.add(shiftHex(correctHex, h, s, l));
  });

  while (colors.size < 8) {
    const variant = shiftHex(correctHex, Math.random() * 90 - 45, (Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.22);
    colors.add(variant);
  }

  const final = Array.from(colors).slice(0, 8);
  return final.sort(() => Math.random() - 0.5);
}

function pickPokemonId() {
  return Math.floor(Math.random() * 898) + 1;
}

async function fetchPokemonData(id) {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${POKEAPI_BASE}/pokemon/${id}`),
    fetch(`${POKEAPI_BASE}/pokemon-species/${id}`)
  ]);

  if (!pokemonRes.ok || !speciesRes.ok) {
    throw new Error('Falha ao carregar Pokémon.');
  }

  const [pokemon, species] = await Promise.all([
    pokemonRes.json(),
    speciesRes.json()
  ]);

  const officialColor = species.color?.name || 'normal';
  const colorHex = getSpeciesColorHex(officialColor);
  const artwork = pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default;

  return {
    id,
    name: pokemon.name,
    artwork,
    officialColor,
    officialHex: colorHex,
  };
}

function getSpeciesColorHex(colorName) {
  const map = {
    black: '#1F2937',
    blue: '#3B82F6',
    brown: '#8B5E3C',
    gray: '#94A3B8',
    green: '#22C55E',
    pink: '#FFB7C5',
    purple: '#754283',
    red: '#EF4444',
    white: '#F8FAFC',
    yellow: '#F7D02C'
  };

  return map[colorName] || '#8B5E3C';
}

async function startRound() {
  try {
    const id = pickPokemonId();
    const pokemon = await fetchPokemonData(id);

    state.current = pokemon;
    state.locked = false;
    state.attemptsUsed = 0;

    const difficultyConfig = DIFFICULTY[state.mode] || DIFFICULTY.normal;
    const palette = [
      '#F7D02C', '#754283', '#FFB7C5', '#F08030', '#A8B820', '#3B82F6', '#7C3AED', '#5AC8FA',
      '#22C55E', '#EF4444', '#F59E0B', '#14B8A6', '#E2E8F0', '#F472B6', '#94A3B8', '#FCD34D'
    ];

    const closeColors = buildColorOptions(pokemon.officialHex, difficultyConfig.colorSpread);
    state.availableColors = closeColors.filter((hex) => hex && hex !== '#').slice(0, 8);

    if (state.availableColors.length < 8) {
      state.availableColors = [...new Set([pokemon.officialHex, ...palette])].slice(0, 8);
    }

    nameNode.textContent = pokemon.name;
    spriteNode.src = pokemon.artwork;
    spriteNode.classList.add('silhouette');
    spriteNode.classList.remove('revealed');
    spriteNode.style.filter = 'brightness(0)';
    spriteNode.alt = pokemon.name;

    renderColorOptions();
    setFeedback(`Pokémon ${state.roundPokemonCount + 1} de ${state.maxPokemonPerRound}. Descubra a cor correta.`, '');
    nextButton.classList.add('hidden');
    updateHud();
  } catch (error) {
    setFeedback('Não foi possível carregar o Pokémon. Tente outra rodada.', 'error');
  }
}

function renderColorOptions() {
  colorGrid.innerHTML = '';

  state.availableColors.forEach((hex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'color-option';
    button.style.background = hex;
    button.setAttribute('aria-label', `Cor ${hex}`);
    button.textContent = hex.toUpperCase();
    button.addEventListener('click', () => handleColorClick(hex));
    colorGrid.appendChild(button);
  });
}

function handleColorClick(selectedHex) {
  if (state.locked) return;

  const correctHex = state.current.officialHex;
  const isCorrect = selectedHex.toLowerCase() === correctHex.toLowerCase();
  const previousAttempts = state.attemptsUsed;

  if (isCorrect) {
    const pointsEarned = previousAttempts < 2 ? 50 : 25;
    state.streak += 1;
    state.score += pointsEarned;
    updateHud();
    spriteNode.classList.remove('silhouette');
    spriteNode.classList.add('revealed');
    spriteNode.style.filter = 'brightness(1)';
    state.locked = true;
    state.roundPokemonCount += 1;
    setFeedback(`Correta! +${pointsEarned} pontos em ${previousAttempts + 1} tentativa(s).`, 'success');
    updateHud();
    nextButton.classList.remove('hidden');
    nextButton.textContent = state.roundPokemonCount >= state.maxPokemonPerRound ? 'Voltar ao menu' : 'Próximo Pokémon';
    return;
  }

  state.attemptsUsed += 1;

  if (state.attemptsUsed >= state.attemptsPerPokemon) {
    state.streak = 0;
    state.locked = true;
    state.roundPokemonCount += 1;
    setFeedback(`Acabaram as tentativas! A cor correta era ${correctHex.toUpperCase()}.`, 'error');
    updateHud();
    nextButton.classList.remove('hidden');
    nextButton.textContent = state.roundPokemonCount >= state.maxPokemonPerRound ? 'Voltar ao menu' : 'Próximo Pokémon';
    return;
  }

  const remaining = state.attemptsPerPokemon - state.attemptsUsed;
  setFeedback(`Errado! Você ainda tem ${remaining} tentativa(s).`, 'error');
  updateHud();
}

function nextRound() {
  if (state.roundPokemonCount >= state.maxPokemonPerRound) {
    setTimeout(() => {
      state.streak = 0;
      state.roundPokemonCount = 0;
      updateHud();
      setScreen('start');
      setFeedback('Escolha o nível para começar outra rodada.', '');
    }, 700);
    return;
  }

  startRound();
}

function startGame(mode) {
  state.mode = mode;
  state.streak = 0;
  state.attemptsPerPokemon = DIFFICULTY[mode].attemptsPerPokemon;
  state.maxPokemonPerRound = DIFFICULTY[mode].maxPokemonPerRound;
  state.roundPokemonCount = 0;
  updateHud();
  setScreen('game');
  nextButton.textContent = 'Próximo Pokémon';
  startRound();
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => startGame(button.dataset.mode));
});

nextButton.addEventListener('click', nextRound);

state.score = getStoredScore();
updateHud();
setScreen('start');
