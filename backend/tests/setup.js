const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

global.expect = (val) => {
  return {
    toBe: (expected) => {
      if (val !== expected) throw new Error(`Expected ${expected} but got ${val}`);
    },
    toEqual: (expected) => {
      const v = JSON.stringify(val);
      const e = JSON.stringify(expected);
      if (v !== e) throw new Error(`Expected ${e} but got ${v}`);
    },
    toBeDefined: () => { if (val === undefined) throw new Error('Expected value to be defined'); },
    toBeNull: () => { if (val !== null) throw new Error('Expected null'); },
    toBeGreaterThan: (n) => { if (val <= n) throw new Error(`Expected ${val} > ${n}`); },
    toContain: (item) => { if (!val.includes(item)) throw new Error(`Expected [${val}] to contain ${item}`); },
    toThrow: () => {
      let threw = false;
      try { val(); } catch (e) { threw = true; }
      if (!threw) throw new Error('Expected function to throw but it did not');
    }
  };
};

global.test = (name, fn) => {
  const run = async () => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
      process.exitCode = 1;
    }
  };
  run();
};
global.describe = (name, fn) => { console.log(`\n${name}`); fn(); };
