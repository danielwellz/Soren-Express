/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function flatten(obj, prefix = '', output = {}) {
  Object.entries(obj).forEach(([key, value]) => {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, nextPath, output);
      return;
    }
    output[nextPath] = value;
  });
  return output;
}

function stripPlaceholders(value) {
  return String(value)
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();
}

function hasLatinLetters(value) {
  return /[A-Za-z]/.test(stripPlaceholders(value));
}

function run() {
  const root = path.resolve(__dirname, '..');
  const enPath = path.join(root, 'src', 'locales', 'en.json');
  const faPath = path.join(root, 'src', 'locales', 'fa.json');

  const en = flatten(loadJson(enPath));
  const fa = flatten(loadJson(faPath));

  const enKeys = Object.keys(en);
  const faKeys = Object.keys(fa);

  const missingInFa = enKeys.filter((key) => !(key in fa));
  const extraInFa = faKeys.filter((key) => !(key in en));

  const untranslated = enKeys.filter((key) => {
    const faValue = fa[key];
    if (faValue === undefined || faValue === null) {
      return false;
    }

    if (typeof en[key] !== 'string' || typeof faValue !== 'string') {
      return false;
    }

    return stripPlaceholders(en[key]) === stripPlaceholders(faValue);
  });

  const latinLeakage = enKeys.filter((key) => {
    const faValue = fa[key];
    if (faValue === undefined || faValue === null) {
      return false;
    }

    if (typeof faValue !== 'string') {
      return false;
    }

    if (key === 'meta.locale' || key === 'meta.currency') {
      return false;
    }

    return hasLatinLetters(faValue);
  });

  if (!missingInFa.length && !extraInFa.length && !untranslated.length && !latinLeakage.length) {
    console.log('i18n check passed');
    return;
  }

  if (missingInFa.length) {
    console.error('\nMissing fa keys:');
    missingInFa.forEach((key) => console.error(`- ${key}`));
  }

  if (extraInFa.length) {
    console.error('\nExtra fa keys:');
    extraInFa.forEach((key) => console.error(`- ${key}`));
  }

  if (untranslated.length) {
    console.error('\nPotential untranslated fa values:');
    untranslated.forEach((key) => console.error(`- ${key}`));
  }

  if (latinLeakage.length) {
    console.error('\nLatin characters detected in fa values:');
    latinLeakage.forEach((key) => console.error(`- ${key}`));
  }

  process.exit(1);
}

run();
