const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.join(__dirname, '..');
const temporaryDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'stringee-react-native-v2-package-'),
);
const npmCache = path.join(temporaryDirectory, 'npm-cache');
const consumerDirectory = path.join(temporaryDirectory, 'consumer');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('npm_execpath is required to run the package contract test.');
}

const npmEnvironment = {
  ...process.env,
  NPM_CONFIG_AUDIT: 'false',
  NPM_CONFIG_CACHE: npmCache,
  NPM_CONFIG_DRY_RUN: 'false',
  NPM_CONFIG_FUND: 'false',
  NPM_CONFIG_OFFLINE: 'true',
  NPM_CONFIG_UPDATE_NOTIFIER: 'false',
};

function runNpm(arguments_, cwd) {
  return childProcess.execFileSync(process.execPath, [npmCli, ...arguments_], {
    cwd,
    encoding: 'utf8',
    env: npmEnvironment,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

try {
  fs.mkdirSync(consumerDirectory);
  fs.writeFileSync(
    path.join(consumerDirectory, 'package.json'),
    JSON.stringify({name: 'stringee-js-consumer', private: true}, null, 2),
  );

  const packOutput = runNpm(
    [
      'pack',
      '--ignore-scripts',
      '--json',
      '--pack-destination',
      temporaryDirectory,
    ],
    root,
  );
  const packResult = JSON.parse(packOutput)[0];
  const packedPaths = packResult.files.map(file => file.path);
  const tarballPath = path.join(temporaryDirectory, packResult.filename);

  assert(packedPaths.includes('lib/commonjs/index.js'));
  assert(packedPaths.includes('lib/commonjs/index.d.ts'));
  assert(packedPaths.includes('index.d.ts'));
  assert(packedPaths.includes('CHANGELOG.md'));
  assert(packedPaths.includes('docs/react-native-integration.md'));
  assert(packedPaths.includes('docs/api-reference.md'));
  assert(!packedPaths.some(file => file.startsWith('example/')));
  assert(!packedPaths.some(file => file.startsWith('android/build/')));
  assert(!packedPaths.some(file => file.startsWith('android/.gradle/')));
  assert(
    !packedPaths.some(
      file =>
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.d.ts'),
    ),
    'Tarball contains TypeScript implementation source.',
  );

  runNpm(
    [
      'install',
      '--ignore-scripts',
      '--legacy-peer-deps',
      '--omit=peer',
      '--no-package-lock',
      '--no-audit',
      '--no-fund',
      '--offline',
      tarballPath,
    ],
    consumerDirectory,
  );

  const installedPackage = path.join(
    consumerDirectory,
    'node_modules',
    'stringee-react-native-v2',
  );
  assert(!fs.existsSync(path.join(consumerDirectory, 'node_modules', 'typescript')));

  childProcess.execFileSync(
    process.execPath,
    [path.join(root, 'test/package/js-consumer.cjs'), installedPackage],
    {stdio: 'inherit'},
  );

  fs.copyFileSync(
    path.join(root, 'test/types/consumer.tsx'),
    path.join(consumerDirectory, 'consumer.tsx'),
  );
  fs.writeFileSync(
    path.join(consumerDirectory, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          jsx: 'react-jsx',
          lib: ['ES2019'],
          module: 'commonjs',
          moduleResolution: 'node',
          noEmit: true,
          paths: {
            react: [path.join(root, 'node_modules/@types/react')],
            'react/jsx-runtime': [
              path.join(root, 'node_modules/@types/react/jsx-runtime.d.ts'),
            ],
            'react-native': [path.join(root, 'node_modules/react-native')],
          },
          skipLibCheck: true,
          strict: true,
          target: 'ES2019',
        },
        files: ['consumer.tsx'],
      },
      null,
      2,
    ),
  );

  childProcess.execFileSync(
    process.execPath,
    [
      path.join(root, 'node_modules/typescript/bin/tsc'),
      '-p',
      path.join(consumerDirectory, 'tsconfig.json'),
    ],
    {cwd: consumerDirectory, stdio: 'inherit'},
  );

  console.log(
    `Package contract verified (${packResult.entryCount} files, ${packResult.size} bytes).`,
  );
} finally {
  fs.rmSync(temporaryDirectory, {force: true, recursive: true});
}
