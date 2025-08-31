// check-routers.js
const path = require('path');

function inspectModule(relPath) {
  const full = path.join(__dirname, relPath);
  try {
    const m = require(full);
    console.log(`\n[OK] require('${relPath}') -> typeof: ${typeof m}`);
    if (m && typeof m === 'object') {
      console.log('  exported keys:', Object.keys(m));
      for (const k of Object.keys(m)) {
        console.log(`    ${k}: ${typeof m[k]}`);
      }
    }
  } catch (err) {
    console.error(`\n[ERROR] require('${relPath}') failed ->`, err && err.stack ? err.stack.split('\n')[0] : err.message);
  }
}

const toCheck = [
  './router/auth-router',
  './router/contact-router',
  './router/admin-router',
  './router/order-router',
  './router/riderRoutes',
  './controllers/admincontrollers',
  './controllers/riderController',
  './controllers/orderController',
  './middlewares/auth-middleware',
  './middlewares/admin-middleware',
  './middlewares/validate-middleware'
];

console.log('Running module inspection — run: node check-routers.js from project root');
toCheck.forEach(inspectModule);

