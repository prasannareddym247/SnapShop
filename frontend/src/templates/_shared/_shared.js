const fs = require('fs');
const readline = require('readline');
const path = require('path');

const LOG_FILE = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\c948b18d-ee39-45b5-b52a-f993d931ed85\\.system_generated\\logs\\transcript_full.jsonl';
const TARGET_DIR = path.join(__dirname, '../frontend/src/templates/_shared');

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function extract() {
  const fileStream = fs.createReadStream(LOG_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const recoveredFiles = {};

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const step = JSON.parse(line);
      // Look inside tool_calls
      const calls = step.tool_calls || [];
      calls.forEach(call => {
        if ((call.name === 'write_to_file' || call.name === 'default_api:write_to_file') && call.args) {
          const target = call.args.TargetFile;
          if (target && target.includes('_shared')) {
            const relPath = target.substring(target.indexOf('_shared'));
            recoveredFiles[relPath] = call.args.CodeContent;
          }
        }
      });
    } catch (e) {
      // Ignore parse errors
    }
  }

  console.log(`Found ${Object.keys(recoveredFiles).length} shared files to recover:`);
  Object.entries(recoveredFiles).forEach(([rel, content]) => {
    const destPath = path.join(TARGET_DIR, rel.replace('_shared/', ''));
    ensureDirectory(path.dirname(destPath));
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`✓ Recovered: ${rel} -> ${destPath}`);
  });

  console.log('=== EXTRACTION SUCCESSFUL ===');
  process.exit(0);
}

extract().catch(err => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
