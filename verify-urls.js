#!/usr/bin/env node

/**
 * Script de verificación para asegurar que la estructura de URLs limpias está correcta
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES = [
  'homenoticias', 'comunidad', 'mercado', 'activities', 'contacto',
  'pedidos', 'perfil', 'qr', 'registro', 'soporte', 'visitas',
  'onboarding', 'privacy-policy'
];

console.log('🔍 Verificando estructura de URLs limpias...\n');

let allGood = true;

// 1. Verificar que existan las carpetas y los archivos index.html
console.log('✅ Verificando carpetas y archivos index.html:');
PAGES.forEach(page => {
  const folderPath = path.join(__dirname, page);
  const indexPath = path.join(folderPath, 'index.html');
  
  if (!fs.existsSync(folderPath)) {
    console.log(`  ❌ Falta la carpeta: ${page}/`);
    allGood = false;
  } else if (!fs.existsSync(indexPath)) {
    console.log(`  ❌ Falta el archivo: ${page}/index.html`);
    allGood = false;
  } else {
    console.log(`  ✓ ${page}/index.html`);
  }
});

// 2. Verificar que los archivos de configuración existan
console.log('\n✅ Verificando archivos de configuración:');
const configFiles = [
  { name: '.htaccess', required: false, desc: 'Apache' },
  { name: 'vercel.json', required: false, desc: 'Vercel' },
  { name: 'nginx.conf.example', required: false, desc: 'Nginx ejemplo' }
];

configFiles.forEach(({ name, required, desc }) => {
  const filePath = path.join(__dirname, name);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${name} (${desc})`);
  } else if (required) {
    console.log(`  ❌ Falta archivo requerido: ${name}`);
    allGood = false;
  } else {
    console.log(`  ⚠ ${name} no encontrado (opcional para ${desc})`);
  }
});

// 3. Verificar que los recursos estáticos usen rutas absolutas
console.log('\n✅ Verificando rutas absolutas en archivos index.html de carpetas:');
PAGES.forEach(page => {
  const indexPath = path.join(__dirname, page, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Buscar rutas relativas problemáticas
    const relativeStyles = content.match(/href="styles\.css"/);
    const relativeLogo = content.match(/src="logo\d\.png"/);
    const relativeFirebase = content.match(/import\(['"]\.\//);
    
    if (relativeStyles || relativeLogo || relativeFirebase) {
      console.log(`  ⚠ ${page}/index.html tiene rutas relativas que deberían ser absolutas`);
      if (relativeStyles) console.log(`    - Encontrado: href="styles.css" (debería ser href="/styles.css")`);
      if (relativeLogo) console.log(`    - Encontrado: src="logoX.png" (debería ser src="/logoX.png")`);
      if (relativeFirebase) console.log(`    - Encontrado: import('./firebase.js') (debería ser import('/firebase.js'))`);
    } else {
      console.log(`  ✓ ${page}/index.html`);
    }
  }
});

// 4. Buscar referencias antiguas a .html en archivos principales
console.log('\n✅ Buscando referencias antiguas a .html:');
const mainFiles = ['index.html', 'home.js'];
let foundOldRefs = false;

mainFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const oldRefs = [
      ...content.matchAll(/href=["'](homenoticias|comunidad|mercado|activities|contacto|pedidos|perfil|qr|registro|soporte|visitas|onboarding|privacy-policy)\.html["']/g)
    ];
    
    if (oldRefs.length > 0) {
      console.log(`  ⚠ ${file} tiene ${oldRefs.length} referencia(s) antigua(s) a .html`);
      foundOldRefs = true;
    } else {
      console.log(`  ✓ ${file} - sin referencias antiguas`);
    }
  }
});

// Resumen final
console.log('\n' + '='.repeat(50));
if (allGood && !foundOldRefs) {
  console.log('✅ ¡Todo se ve bien! La configuración de URLs limpias está correcta.');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Desplegar a tu servidor o Vercel');
  console.log('   2. Configurar el dominio iasaapp.online');
  console.log('   3. Verificar que las URLs funcionan sin .html');
  console.log('   4. Opcional: Eliminar archivos .html antiguos de la raíz');
} else {
  console.log('⚠️  Hay algunos problemas que necesitan atención.');
  console.log('   Revisa los mensajes arriba para más detalles.');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood && !foundOldRefs ? 0 : 1);
