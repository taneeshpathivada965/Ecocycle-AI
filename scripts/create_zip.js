const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const stagingDir = path.join(rootDir, 'staging_ecocycle');
const zipFileRoot = path.join(rootDir, 'ecocycle-ai.zip');
const distZip = path.join(rootDir, 'client', 'dist', 'ecocycle-ai.zip');
const publicDir = path.join(rootDir, 'client', 'public');
const publicZip = path.join(publicDir, 'ecocycle-ai.zip');

function copyRecursive(src, dest, excludeNames = ['node_modules', '.git']) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const baseName = path.basename(src);
    if (excludeNames.includes(baseName)) {
      return;
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (excludeNames.includes(entry)) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry), excludeNames);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function makeZip() {
  console.log('[ZIP] Preparing clean project staging directory...');
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  const itemsToInclude = [
    'client',
    'server',
    'supabase',
    'scripts',
    'docs',
    '.env.example',
    '.env',
    'package.json',
    'package-lock.json',
    'render.yaml',
    'README.md'
  ];

  for (const item of itemsToInclude) {
    const srcPath = path.join(rootDir, item);
    const destPath = path.join(stagingDir, item);
    if (fs.existsSync(srcPath)) {
      console.log(`[ZIP] Staging: ${item}...`);
      copyRecursive(srcPath, destPath, ['node_modules', '.git', 'staging_ecocycle', 'ecocycle-ai.zip']);
    }
  }

  if (fs.existsSync(zipFileRoot)) {
    fs.unlinkSync(zipFileRoot);
  }

  console.log('[ZIP] Creating ecocycle-ai.zip using Compress-Archive...');
  const psCmd = `powershell -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipFileRoot}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });

  const zipStat = fs.statSync(zipFileRoot);
  const sizeMb = (zipStat.size / (1024 * 1024)).toFixed(2);
  console.log(`[ZIP] Archive created successfully: ${zipFileRoot} (${sizeMb} MB)`);

  // Copy to client/dist and client/public for instant HTTP browser download
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.copyFileSync(zipFileRoot, publicZip);
  console.log(`[ZIP] Placed in client/public: ${publicZip}`);

  const clientDist = path.join(rootDir, 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    fs.copyFileSync(zipFileRoot, distZip);
    console.log(`[ZIP] Placed in client/dist: ${distZip}`);
  }

  // Cleanup staging directory
  fs.rmSync(stagingDir, { recursive: true, force: true });
  console.log('[ZIP] Staging directory cleaned up.');
}

makeZip().catch(err => {
  console.error('[ZIP] Error:', err);
  process.exit(1);
});
