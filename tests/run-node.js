/* Roda os testes no terminal:  node tests/run-node.js
   Carrega apenas os arquivos que existem no projeto, então funciona
   mesmo antes de todos os módulos serem adicionados. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const files = [
  'base/engine.js',
  'modulos/limites/limites-engine.js', 'modulos/derivadas/derivadas-engine.js', 'modulos/integrais/integrais-engine.js',
  'tests/runner.js',
  'tests/test-base.js', 'tests/test-limites.js', 'tests/test-derivadas.js', 'tests/test-integrais.js',
];
const ctx = vm.createContext({ console, Math });
for (const f of files) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
  else console.log(`(arquivo ainda não adicionado: ${f})`);
}
const rows = vm.runInContext('Testes.run()', ctx);
for (const r of rows) console.log(`${r.pass ? '✔' : '✘'} [${r.grupo}] ${r.nome}  →  ${r.obtido}`);
const fails = rows.filter(r => !r.pass).length;
console.log(`\n${rows.length - fails}/${rows.length} testes passaram.`);
process.exit(fails ? 1 : 0);
