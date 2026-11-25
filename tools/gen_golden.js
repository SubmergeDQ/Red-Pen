// Generates golden analysis output from the web rule engine (engine.js)
// for the Dart parity tests. Run: node tools/gen_golden.js
//
// NOTE: client/test/golden/golden.json is the 1.0 baseline (R1-R30). The Dart
// engine now also implements R31-R36, covered by client/test/engine_consumer_test.dart.
// Regenerating this file against the current web engine changes the baseline, so do it
// only when both engines are intentionally updated together.
'use strict';
const fs = require('fs');
const path = require('path');
const engine = require(path.join(__dirname, '..', 'engine.js'));

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden_corpus.json'), 'utf8'));
const byId = Object.fromEntries(engine.SAMPLES.map(s => [s.id, s]));

const results = corpus.map(entry => {
  const text = entry.text != null ? entry.text : byId[entry.source.split('SAMPLES.').pop()].text;
  const options = entry.docType ? { docType: entry.docType } : undefined;
  return {
    name: entry.name,
    docType: entry.docType || null,
    text,
    analysis: engine.analyzeContract(text, options),
  };
});

const outDir = path.join(__dirname, '..', 'client', 'test', 'golden');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'golden.json'), JSON.stringify(results, null, 1), 'utf8');
console.log('wrote', path.join(outDir, 'golden.json'), results.length, 'cases');