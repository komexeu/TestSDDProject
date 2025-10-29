// tests/jest.global-setup.cjs
// 只在整個 Jest 測試流程開始前 reset/migrate schema
const { execSync } = require('child_process');

module.exports = async () => {
  // reset 並套用 migration，不執行 seed
  execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' });
};
