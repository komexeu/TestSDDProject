# 測試用 Docker PostgreSQL 與 .env.test 設定說明

## 目標
- 測試時自動用 Docker 建立獨立 PostgreSQL 資料庫
- 使用 `.env.test` 作為測試環境變數

## 步驟

### 1. docker-compose 設定
已於 `docker-compose.yml` 新增 `postgres-test` 服務：
```yaml
  postgres-test:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    ports:
      - "5433:5432"
    volumes:
      - pgdata_test:/var/lib/postgresql/data
```

### 2. .env.test 設定
內容如下，注意 port 要對應 `5433`：
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/testdb"
```

### 3. 啟動測試資料庫
```sh
docker-compose up -d postgres-test
```

### 4. 執行測試時載入 .env.test
建議於 `package.json` scripts 加入：
```json
"test": "cp .env.test .env && jest"
```
或用 cross-env：
```json
"test": "cross-env NODE_ENV=test jest"
```

### 5. 測試結束後可移除容器
```sh
docker-compose down postgres-test
```

---

## 備註
- 若要自動化啟動/關閉容器，可寫 shell script 或用 npm-run-all。
- 只要照此流程，未來任何人都能理解並複製這個測試環境。
- 若有多組資料庫需求，可複製 postgres-test 服務並調整 port。
