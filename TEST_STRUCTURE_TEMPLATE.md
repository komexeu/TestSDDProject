# Test Structure Template

這是 TestSDDProject 的測試結構範本，用於自動生成符合專案慣例的測試檔案。

## 資料夾結構

```
tests/
├── {feature-name}/                    # 功能模組測試目錄
│   ├── testUtils.ts                  # 該功能的測試工具與資料設置
│   ├── {feature-name}-api.test.ts    # API 整合測試
│   ├── {feature-name}-unit.test.ts   # 單元測試
│   ├── {feature-name}-auth.test.ts   # 權限測試
│   ├── {feature-name}-concurrency.test.ts # 高併發測試
│   ├── {feature-name}-performance.test.ts # 效能測試
│   └── {feature-name}-edge-cases.test.ts  # 邊界條件測試
├── models/                           # 資料模型測試
├── integration/                      # 跨功能整合測試
└── e2e/                             # 端對端測試
```

## 檔案範本

### testUtils.ts 範本
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setup{FeatureName}TestData() {
  // 建立測試資料
  await prisma.{model}.upsert({
    where: { id: 'test-{feature}-1' },
    update: { /* 更新資料 */ },
    create: {
      id: 'test-{feature}-1',
      // 建立資料
    },
  });
}

export async function cleanup{FeatureName}TestData() {
  // 清除測試資料
  await prisma.{model}.deleteMany({ 
    where: { id: { startsWith: 'test-{feature}' } } 
  });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
```

### API 測試範本
```typescript
import { callback } from '../../src/index';
import { setup{FeatureName}TestData, cleanup{FeatureName}TestData, disconnectPrisma } from './testUtils';

describe('{FeatureName} API 測試', () => {
  const fetchApi = async (path: string, init?: RequestInit) => {
    const url = 'http://localhost:3000' + path;
    return callback(new Request(url, init));
  };

  beforeAll(async () => {
    await setup{FeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup{FeatureName}TestData();
    await disconnectPrisma();
  });

  describe('GET /{feature}', () => {
    it('應正確查詢資料', async () => {
      const res = await fetchApi('/{feature}/test-{feature}-1', { method: 'GET' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('id');
    });

    it('查無資料時應回傳 404', async () => {
      const res = await fetchApi('/{feature}/not-exist', { method: 'GET' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /{feature}', () => {
    it('應正確建立資料', async () => {
      const res = await fetchApi('/{feature}', {
        method: 'POST',
        body: JSON.stringify({ /* 測試資料 */ }),
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
      });
      expect(res.status).toBe(201);
    });

    it('權限不足時應回傳 403', async () => {
      const res = await fetchApi('/{feature}', {
        method: 'POST',
        body: JSON.stringify({ /* 測試資料 */ }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(res.status).toBe(403);
    });
  });
});
```

### 單元測試範本
```typescript
import { {serviceName} } from '../../src/services/{serviceName}';
import { setup{FeatureName}TestData, cleanup{FeatureName}TestData, disconnectPrisma } from './testUtils';

describe('{ServiceName} 服務測試', () => {
  beforeAll(async () => {
    await setup{FeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup{FeatureName}TestData();
    await disconnectPrisma();
  });

  describe('{methodName}', () => {
    it('應正確執行功能', async () => {
      const result = await {serviceName}.{methodName}('test-{feature}-1');
      expect(result).toBeDefined();
    });

    it('應正確處理錯誤情況', async () => {
      await expect({serviceName}.{methodName}('invalid-id')).rejects.toThrow();
    });
  });
});
```

### 權限測試範本
```typescript
import { callback } from '../../src/index';
import { setup{FeatureName}TestData, cleanup{FeatureName}TestData, disconnectPrisma } from './testUtils';

describe('{FeatureName} 權限測試', () => {
  const fetchApi = async (path: string, init?: RequestInit) => {
    const url = 'http://localhost:3000' + path;
    return callback(new Request(url, init));
  };

  beforeAll(async () => {
    await setup{FeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup{FeatureName}TestData();
    await disconnectPrisma();
  });

  it('非管理員無法執行管理操作', async () => {
    const res = await fetchApi('/{feature}/admin-action', {
      method: 'POST',
      body: JSON.stringify({ /* 測試資料 */ }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(403);
  });

  it('管理員可執行管理操作', async () => {
    const res = await fetchApi('/{feature}/admin-action', {
      method: 'POST',
      body: JSON.stringify({ /* 測試資料 */ }),
      headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
    });
    expect(res.status).toBe(200);
  });
});
```

### 高併發測試範本
```typescript
import { {serviceName} } from '../../src/services/{serviceName}';
import { setup{FeatureName}TestData, cleanup{FeatureName}TestData, disconnectPrisma } from './testUtils';

describe('{FeatureName} 高併發測試', () => {
  beforeAll(async () => {
    await setup{FeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup{FeatureName}TestData();
    await disconnectPrisma();
  });

  it('高併發下不會產生競態條件', async () => {
    const tasks = Array.from({ length: 10 }).map(() => 
      {serviceName}.{concurrentMethod}('test-{feature}-1')
    );
    const results = await Promise.allSettled(tasks);
    
    // 驗證結果一致性
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');
    
    expect(successes.length + failures.length).toBe(10);
    // 根據業務邏輯驗證預期的成功/失敗數量
  });
});
```

### 效能測試範本
```typescript
import { {serviceName} } from '../../src/services/{serviceName}';
import { setup{FeatureName}TestData, cleanup{FeatureName}TestData, disconnectPrisma } from './testUtils';

describe('{FeatureName} 效能測試', () => {
  beforeAll(async () => {
    await setup{FeatureName}TestData();
  });

  afterAll(async () => {
    await cleanup{FeatureName}TestData();
    await disconnectPrisma();
  });

  it('大量操作下效能不退化', async () => {
    const start = Date.now();
    const tasks = Array.from({ length: 100 }).map(() => 
      {serviceName}.{performanceMethod}('test-{feature}-1')
    );
    await Promise.allSettled(tasks);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 秒內完成
  });
});
```

## 生成腳本建議

可建立 `scripts/generate-test-structure.js` 腳本：

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function generateTestStructure(featureName) {
  const testDir = path.join('tests', featureName);
  
  // 建立目錄
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // 讀取範本並替換變數
  const templates = [
    'testUtils.ts',
    `${featureName}-api.test.ts`,
    `${featureName}-unit.test.ts`,
    `${featureName}-auth.test.ts`,
    `${featureName}-concurrency.test.ts`,
    `${featureName}-performance.test.ts`
  ];
  
  templates.forEach(template => {
    const templateContent = readTemplate(template);
    const content = templateContent
      .replace(/{feature-name}/g, featureName)
      .replace(/{FeatureName}/g, capitalize(featureName))
      .replace(/{feature}/g, featureName);
    
    fs.writeFileSync(path.join(testDir, template), content);
  });
  
  console.log(`✅ 已生成 ${featureName} 測試結構`);
}

// 使用方式: npm run generate-tests inventory
const featureName = process.argv[2];
if (featureName) {
  generateTestStructure(featureName);
} else {
  console.error('請提供功能名稱: npm run generate-tests <feature-name>');
}
```

## 命名慣例

- 測試檔案：`{feature-name}-{test-type}.test.ts`
- 測試資料 ID：`test-{feature}-{number}`
- 服務名稱：`{feature}Service`
- 測試套件描述：`{FeatureName} {測試類型} 測試`

這個範本確保所有測試都有一致的結構、命名和模式，便於維護和擴展。