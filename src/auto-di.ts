import { globSync } from 'glob';
import { container } from 'tsyringe';
import glob from 'glob';

import path from 'path';

// 先註冊 DomainEventPublisher，避免掃描時未載入
import { InMemoryDomainEventPublisher } from './shared/domain/events/domain-event';
container.register('DomainEventPublisher', { useClass: InMemoryDomainEventPublisher });
container.register('InMemoryDomainEventPublisher', { useClass: InMemoryDomainEventPublisher });

// 註冊規則：自動掃描 usecase/repository/service/controller
// 使用專案根目錄 alias
const projectRoot = path.resolve(__dirname, '..');
const patterns = [
  // 多層目錄自動掃描
  path.join(__dirname, 'domains', '**', '*.ts'),
  path.join(__dirname, 'interfaces', '**', '*.ts'),
  path.join(__dirname, 'shared', '**', '*.ts'),
];

console.log('Auto DI - Scanning files for dependency injection:');
console.log(patterns);

function toAlias(name: string) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

patterns.forEach(pattern => {
  const files: string[] = globSync(pattern);
  files.forEach((file: string) => {
    console.log(`[DI] Scanning file: ${file}`);
    const module = require(file);
    // 支援 default export
    const entries = Object.entries(module.default ? { ...module, default: module.default } : module);
    console.log(`[DI] Module exports:`, module);
    console.log(`[DI] Entries:`, entries.map(([name]) => name));
    entries.forEach(([name, exported]) => {
      if (
        typeof exported === 'function' &&
        (
          name.endsWith('UseCase') ||
          name.endsWith('Repository') ||
          name.endsWith('Service') ||
          name.endsWith('Controller')||
          name.endsWith('Publisher')
        )
      ) {
        // 類別註冊（原本）
        container.register(exported as new (...args: any[]) => any, { useClass: exported as new (...args: any[]) => any });
        // 字串 token 註冊，支援 @inject('CreateProductUseCase')
        container.register(name, { useClass: exported as new (...args: any[]) => any });
        console.log(`[DI] Registered: ${name} (class & string token)`);
      }
    });
  });
});


