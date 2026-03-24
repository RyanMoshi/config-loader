'use strict';
const fs = require('fs');
const path = require('path');

// Load config from environment variables, JSON files, or plain objects

class ConfigLoader {
  constructor() {
    this._data = {};
    this._sources = [];
  }

  fromObject(obj) {
    if (typeof obj !== 'object' || obj === null) throw new TypeError('Expected a plain object');
    this._data = Object.assign({}, this._data, this._flatten(obj));
    this._sources.push('object');
    return this;
  }

  fromEnv(prefix) {
    prefix = (prefix || '').toUpperCase();
    Object.keys(process.env).forEach((k) => {
      if (!prefix || k.startsWith(prefix + '_')) {
        const key = prefix ? k.slice(prefix.length + 1).toLowerCase() : k.toLowerCase();
        this._data[key] = process.env[k];
      }
    });
    this._sources.push('env:' + (prefix || '*'));
    return this;
  }

  fromFile(filePath) {
    const abs = path.resolve(filePath);
    if (!fs.existsSync(abs)) throw new Error('Config file not found: ' + abs);
    const raw = fs.readFileSync(abs, 'utf8');
    const obj = JSON.parse(raw);
    this._data = Object.assign({}, this._data, this._flatten(obj));
    this._sources.push('file:' + abs);
    return this;
  }

  get(key, defaultValue) {
    return this._data.hasOwnProperty(key) ? this._data[key] : defaultValue;
  }

  require(key) {
    if (!this._data.hasOwnProperty(key)) throw new Error('Required config key missing: ' + key);
    return this._data[key];
  }

  _flatten(obj, prefix) {
    prefix = prefix || '';
    const out = {};
    Object.keys(obj).forEach((k) => {
      const val = obj[k];
      const full = prefix ? prefix + '.' + k : k;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        Object.assign(out, this._flatten(val, full));
      } else {
        out[full] = val;
      }
    });
    return out;
  }

  all() { return Object.assign({}, this._data); }
}

module.exports = ConfigLoader;
