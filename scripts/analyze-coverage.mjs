import fs from 'fs';

const data = JSON.parse(fs.readFileSync('coverage-rules.html', 'utf8'));
const content = data.rules.files[0].content;
const lines = content.split('\n');

const lineHits = {};
lines.forEach((_, idx) => { lineHits[idx + 1] = 0; });

function walk(node) {
  if (node.sourcePosition && node.sourcePosition.line) {
    const l = node.sourcePosition.line;
    let hitCount = 0;
    if (node.values) {
      node.values.forEach(v => { hitCount += v.count || 0; });
    }
    lineHits[l] = (lineHits[l] || 0) + hitCount;
  }
  if (node.children) {
    node.children.forEach(walk);
  }
}

data.report.forEach(walk);

console.log('=== RULES STATEMENT COVERAGE SUMMARY ===');
const unexercised = [];
const exercised = [];

lines.forEach((code, idx) => {
  const lineNo = idx + 1;
  const hits = lineHits[lineNo] || 0;
  const trimmed = code.trim();
  if (trimmed.startsWith('allow ')) {
    if (hits > 0) {
      exercised.push({ lineNo, hits, text: trimmed });
    } else {
      unexercised.push({ lineNo, hits, text: trimmed });
    }
  }
});

console.log(`\nExercised Allow Statements (${exercised.length}):`);
exercised.forEach(e => console.log(`  ✓ L${e.lineNo} (${e.hits} evaluations): ${e.text}`));

console.log(`\nUnexercised Allow Statements (${unexercised.length}):`);
unexercised.forEach(u => console.log(`  ✗ L${u.lineNo} (0 evaluations): ${u.text}`));
