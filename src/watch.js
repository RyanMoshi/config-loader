'use strict';
const fs = require('fs');

function watchConfig(filePath, onChange, intervalMs) {
  intervalMs = intervalMs || 2000;
  let lastMtime = null;
  let lastContent = null;

  const check = () => {
    try {
      const stat = fs.statSync(filePath);
      if (lastMtime !== null && stat.mtimeMs === lastMtime) return;
      lastMtime = stat.mtimeMs;
      const raw = fs.readFileSync(filePath, 'utf8');
      if (raw === lastContent) return;
      lastContent = raw;
      try {
        const config = JSON.parse(raw);
        onChange(null, config);
      } catch (parseErr) {
        onChange(parseErr, null);
      }
    } catch (err) {
      onChange(err, null);
    }
  };

  check();
  const id = setInterval(check, intervalMs);
  return { stop: () => clearInterval(id) };
}

module.exports = watchConfig;
