#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str) {
  return str.split('-').map(capitalize).join('');
}

function generateTestStructure(featureName, options = {}) {
  const testDir = path.join('tests', featureName);
  
  // 建立目錄
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log(`📁 建立目錄: ${testDir}`);
  }
  
  const pascalFeatureName = toPascalCase(featureName);
  
  // 生成 testUtils.ts
  const testUtilsContent = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setup${pascalFeatureName}TestData() {
  // 建立測試資料
  await prisma.${featureName}.upsert({
    where: { id: 'test-${featureName}-1' },
    update: { /* 更新資料 */ },
    create: {
      id: 'test-${featureName}-1',
      // 建立資料
    },
  });
}

export async function cleanup${pascalFeatureName}TestData() {
  // 清除測試資料
  await prisma.${featureName}.deleteMany({ 
    where: { id: { startsWith: 'test-${featureName}' } } 
  });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
`;

  // 生成 API 測試
  const apiTestContent = `import { callback } from '../../src/index';
import { setup${pascalFeatureName}TestData, cleanup${pascalFeatureName}TestData, disconnectPrisma } from './testUtils';

describe('${pascalFeatureName} API 測試', () => {
  const fetchApi = async (path: string, init?: RequestInit) => {
    const url = 'http://localhost:3000' + path;
    return callback(new Request(url, init));
  };

  beforeAll(async () => {
    await setup${pascalFeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup${pascalFeatureName}TestData();
    await disconnectPrisma();
  });

  describe('GET /${featureName}', () => {
    it('應正確查詢資料', async () => {
      const res = await fetchApi('/${featureName}/test-${featureName}-1', { method: 'GET' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('id');
    });

    it('查無資料時應回傳 404', async () => {
      const res = await fetchApi('/${featureName}/not-exist', { method: 'GET' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /${featureName}', () => {
    it('應正確建立資料', async () => {
      const res = await fetchApi('/${featureName}', {
        method: 'POST',
        body: JSON.stringify({ /* 測試資料 */ }),
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
      });
      expect(res.status).toBe(201);
    });

    it('權限不足時應回傳 403', async () => {
      const res = await fetchApi('/${featureName}', {
        method: 'POST',
        body: JSON.stringify({ /* 測試資料 */ }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(res.status).toBe(403);
    });
  });
});
`;

  // 生成權限測試
  const authTestContent = `import { callback } from '../../src/index';
import { setup${pascalFeatureName}TestData, cleanup${pascalFeatureName}TestData, disconnectPrisma } from './testUtils';

describe('${pascalFeatureName} 權限測試', () => {
  const fetchApi = async (path: string, init?: RequestInit) => {
    const url = 'http://localhost:3000' + path;
    return callback(new Request(url, init));
  };

  beforeAll(async () => {
    await setup${pascalFeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup${pascalFeatureName}TestData();
    await disconnectPrisma();
  });

  it('非管理員無法執行管理操作', async () => {
    const res = await fetchApi('/${featureName}/admin-action', {
      method: 'POST',
      body: JSON.stringify({ /* 測試資料 */ }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(403);
  });

  it('管理員可執行管理操作', async () => {
    const res = await fetchApi('/${featureName}/admin-action', {
      method: 'POST',
      body: JSON.stringify({ /* 測試資料 */ }),
      headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
    });
    expect(res.status).toBe(200);
  });
});
`;

  // 寫入檔案
  const files = [
    { name: 'testUtils.ts', content: testUtilsContent },
    { name: `${featureName}-api.test.ts`, content: apiTestContent },
    { name: `${featureName}-auth.test.ts`, content: authTestContent },
  ];

  // 可選檔案
  if (options.includeUnit) {
    const unitTestContent = `import { ${featureName}Service } from '../../src/services/${featureName}Service';
import { setup${pascalFeatureName}TestData, cleanup${pascalFeatureName}TestData, disconnectPrisma } from './testUtils';

describe('${pascalFeatureName} 服務測試', () => {
  beforeAll(async () => {
    await setup${pascalFeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup${pascalFeatureName}TestData();
    await disconnectPrisma();
  });

  describe('get${pascalFeatureName}', () => {
    it('應正確查詢資料', async () => {
      const result = await ${featureName}Service.get${pascalFeatureName}('test-${featureName}-1');
      expect(result).toBeDefined();
    });

    it('應正確處理錯誤情況', async () => {
      await expect(${featureName}Service.get${pascalFeatureName}('invalid-id')).rejects.toThrow();
    });
  });
});
`;
    files.push({ name: `${featureName}-unit.test.ts`, content: unitTestContent });
  }

  if (options.includeConcurrency) {
    const concurrencyTestContent = `import { ${featureName}Service } from '../../src/services/${featureName}Service';
import { setup${pascalFeatureName}TestData, cleanup${pascalFeatureName}TestData, disconnectPrisma } from './testUtils';

describe('${pascalFeatureName} 高併發測試', () => {
  beforeAll(async () => {
    await setup${pascalFeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup${pascalFeatureName}TestData();
    await disconnectPrisma();
  });

  it('高併發下不會產生競態條件', async () => {
    const tasks = Array.from({ length: 10 }).map(() => 
      ${featureName}Service.concurrentMethod('test-${featureName}-1')
    );
    const results = await Promise.allSettled(tasks);
    
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');
    
    expect(successes.length + failures.length).toBe(10);
  });
});
`;
    files.push({ name: `${featureName}-concurrency.test.ts`, content: concurrencyTestContent });
  }

  if (options.includePerformance) {
    const performanceTestContent = `import { ${featureName}Service } from '../../src/services/${featureName}Service';
import { setup${pascalFeatureName}TestData, cleanup${pascalFeatureName}TestData, disconnectPrisma } from './testUtils';

describe('${pascalFeatureName} 效能測試', () => {
  beforeAll(async () => {
    await setup${pascalFeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup${pascalFeatureName}TestData();
    await disconnectPrisma();
  });

  it('大量操作下效能不退化', async () => {
    const start = Date.now();
    const tasks = Array.from({ length: 100 }).map(() => 
      ${featureName}Service.performanceMethod('test-${featureName}-1')
    );
    await Promise.allSettled(tasks);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 秒內完成
  });
});
`;
    files.push({ name: `${featureName}-performance.test.ts`, content: performanceTestContent });
  }

  files.forEach(file => {
    const filePath = path.join(testDir, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`✅ 生成: ${filePath}`);
  });
  
  console.log(`\n🎉 已生成 ${featureName} 測試結構完成！`);
  console.log(`📂 位置: ${testDir}`);
}

// 解析命令列參數
const args = process.argv.slice(2);
const featureName = args[0];

const options = {
  includeUnit: args.includes('--unit'),
  includeConcurrency: args.includes('--concurrency'),
  includePerformance: args.includes('--performance'),
  includeAll: args.includes('--all'),
};

if (options.includeAll) {
  options.includeUnit = true;
  options.includeConcurrency = true;
  options.includePerformance = true;
}

if (featureName) {
  generateTestStructure(featureName, options);
} else {
  console.error(`
❌ 請提供功能名稱

使用方式:
  node scripts/generate-test-structure.js <feature-name> [options]

選項:
  --unit          包含單元測試
  --concurrency   包含高併發測試  
  --performance   包含效能測試
  --all           包含所有測試類型

範例:
  node scripts/generate-test-structure.js user
  node scripts/generate-test-structure.js inventory --all
  node scripts/generate-test-structure.js order --unit --concurrency
`);
}