import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OK = '\x1b[32m✅\x1b[0m';
const FAIL = '\x1b[31m❌\x1b[0m';
const WARN = '\x1b[33m⚠️\x1b[0m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const GRAY = '\x1b[90m';

console.log('');
console.log(`  ${CYAN}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}`);
console.log(`  ${CYAN}${BOLD}║${RESET}        ${BOLD}\x1b[33mSkillBay Frontend - Verificacion\x1b[0m${RESET}              ${CYAN}${BOLD}║${RESET}`);
console.log(`  ${CYAN}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}`);
console.log('');

// Check Node
try {
  const nodeVersion = execSync('node --version').toString().trim();
  console.log(`  ${OK}  Node.js: ${GRAY}${nodeVersion}${RESET}`);
} catch {
  console.log(`  ${FAIL}  Node.js: ${GRAY}No encontrado${RESET}`);
}

// Check npm
try {
  const npmVersion = execSync('npm --version').toString().trim();
  console.log(`  ${OK}  npm: ${GRAY}v${npmVersion}${RESET}`);
} catch {
  console.log(`  ${FAIL}  npm: ${GRAY}No encontrado${RESET}`);
}

// Check node_modules
const nodeModules = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModules)) {
  const pkgCount = fs.readdirSync(nodeModules).length;
  console.log(`  ${OK}  Dependencias: ${GRAY}${pkgCount} paquetes instalados${RESET}`);
} else {
  console.log(`  ${FAIL}  Dependencias: ${GRAY}No instaladas (npm install)${RESET}`);
}

// Check .env
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  console.log(`  ${OK}  .env: ${GRAY}Existe${RESET}`);
} else {
  console.log(`  ${WARN}  .env: ${GRAY}No encontrado${RESET}`);
}

// Check vite.config.js
const viteConfig = path.join(__dirname, 'vite.config.js');
if (fs.existsSync(viteConfig)) {
  const content = fs.readFileSync(viteConfig, 'utf-8');
  if (content.includes('/storage')) {
    console.log(`  ${OK}  Proxy /storage: ${GRAY}Configurado${RESET}`);
  } else {
    console.log(`  ${WARN}  Proxy /storage: ${GRAY}No configurado en vite.config.js${RESET}`);
  }
  if (content.includes('/api')) {
    console.log(`  ${OK}  Proxy /api: ${GRAY}Configurado${RESET}`);
  }
}

// Check key files
const keyFiles = [
  { path: 'src/main.jsx', label: 'Entry point' },
  { path: 'src/App.jsx', label: 'App component' },
  { path: 'src/utils/serviceImages.js', label: 'Image utilities' },
  { path: 'src/utils/swalHelpers.js', label: 'SweetAlert helpers' },
];

console.log('');
console.log(`  ${CYAN}${BOLD}📁 Archivos Clave${RESET}`);
keyFiles.forEach(f => {
  const fullPath = path.join(__dirname, f.path);
  if (fs.existsSync(fullPath)) {
    console.log(`  ${OK}  ${f.label}: ${GRAY}${f.path}${RESET}`);
  } else {
    console.log(`  ${FAIL}  ${f.label}: ${GRAY}No encontrado - ${f.path}${RESET}`);
  }
});

console.log('');
console.log(`  ${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log('');
