/**
 * Category-themed SVG placeholder icons for services and opportunities.
 * Each group has a distinct color + icon combination.
 * Returns an inline SVG data URI that renders cleanly at any size.
 */

const GROUP_THEMES = {
  Tecnologia: {
    bg: "#1e3a5f",
    accent: "#60a5fa",
    icon: "code",
    label: "Tecnología",
  },
  "Cuidado del Hogar": {
    bg: "#065f46",
    accent: "#34d399",
    icon: "home",
    label: "Cuidado del Hogar",
  },
  Educacion: {
    bg: "#7c2d12",
    accent: "#fb923c",
    icon: "book",
    label: "Educación",
  },
  "Servicios Generales": {
    bg: "#581c87",
    accent: "#c084fc",
    icon: "briefcase",
    label: "Servicios Generales",
  },
  Eventos: {
    bg: "#831843",
    accent: "#f472b6",
    icon: "sparkles",
    label: "Eventos",
  },
  "Oficios Manuales": {
    bg: "#78350f",
    accent: "#fbbf24",
    icon: "wrench",
    label: "Oficios Manuales",
  },
};

const DEFAULT_THEME = {
  bg: "#334155",
  accent: "#94a3b8",
  icon: "star",
  label: "SkillBay",
};

const ICONS = {
  code: `<rect x="8" y="8" width="84" height="84" rx="16" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M42 30L30 42L42 54" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M58 30L70 42L58 54" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="52" y1="26" x2="48" y2="58" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,
  home: `<rect x="8" y="8" width="84" height="84" rx="16" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M50 28L30 44H38V62H62V44H70L50 28Z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="44" y="50" width="12" height="12" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>`,
  book: `<rect x="8" y="8" width="84" height="84" rx="16" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M30 32C30 32 36 28 50 28C64 28 70 32 70 32V60C70 60 64 56 50 56C36 56 30 60 30 60V32Z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="50" y1="28" x2="50" y2="56" stroke="currentColor" stroke-width="2"/>`,
  briefcase: `<rect x="8" y="8" width="84" height="84" rx="16" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/><rect x="26" y="38" width="48" height="30" rx="4" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M38 38V32C38 30 40 28 42 28H58C60 28 62 30 62 32V38" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="26" y1="50" x2="74" y2="50" stroke="currentColor" stroke-width="2"/><rect x="44" y="44" width="12" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>`,
  sparkles: `<rect x="8" y="8" width="84" height="84" rx="16" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M50 24L53 40L69 43L53 46L50 62L47 46L31 43L47 40L50 24Z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="28" r="2" fill="currentColor"/><circle cx="68" cy="30" r="1.5" fill="currentColor"/><circle cx="36" cy="60" r="1.5" fill="currentColor"/>`,
  wrench: `<rect x="8" y="8" width="84" height="84" rx="16" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M60 28L52 36C54 39 54 43 52 46L60 54C63 51 63 45 60 42L64 38C67 35 67 31 64 28H60Z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M48 40L34 54C32 56 32 58 34 60C36 62 38 62 40 60L54 46" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="56" cy="32" r="4" stroke="currentColor" stroke-width="2" fill="none"/>`,
  star: `<rect x="8" y="8" width="84" height="84" rx="16" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M50 26L55 40H69L58 49L62 63L50 54L38 63L42 49L31 40H45L50 26Z" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
};

function buildSVG(theme, width = 400, height = 300) {
  const iconSvg = ICONS[theme.icon] || ICONS.star;
  const svgString =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${theme.bg}"/>` +
    `<stop offset="100%" stop-color="${adjustColor(theme.bg, -20)}"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>` +
    `<g color="${theme.accent}" transform="translate(${width/2 - 50}, ${height/2 - 70}) scale(1.2)">${iconSvg}</g>` +
    `<text x="${width/2}" y="${height - 30}" text-anchor="middle" fill="${theme.accent}" font-family="system-ui,sans-serif" font-size="14" font-weight="600" opacity="0.8">${theme.label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

function getThemeForCategory(categoryName, grupo) {
  if (grupo && GROUP_THEMES[grupo]) return GROUP_THEMES[grupo];
  // Fallback: try to match by category name
  for (const [key, theme] of Object.entries(GROUP_THEMES)) {
    if (categoryName?.toLowerCase().includes(key.toLowerCase().split(" ")[0])) return theme;
  }
  return DEFAULT_THEME;
}

/**
 * Returns a category-themed SVG placeholder as a data URI.
 * @param {object} service - Service or opportunity object
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Data URI of the SVG placeholder
 */
export function getCategoryPlaceholder(service, width = 400, height = 300) {
  const catName = service?.categoria?.nombre || "";
  const grupo = service?.categoria?.grupo || "";
  const theme = getThemeForCategory(catName, grupo);
  return buildSVG(theme, width, height);
}

/**
 * Returns a generic default placeholder (no category info).
 */
export function getDefaultPlaceholder(width = 400, height = 300) {
  return buildSVG(DEFAULT_THEME, width, height);
}
