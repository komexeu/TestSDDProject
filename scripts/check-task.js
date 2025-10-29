const fs = require('fs');
const { execSync } = require('child_process');

// 支援格式：close 003-inventory-feature:M001
// 可多個 feature:task 一起出現
const commitMsg = execSync('git log -1 --pretty=%B').toString();
const matches = [...commitMsg.matchAll(/close[s]?\s+([\w-]+):(DB\d{3}|M\d{3}|T\d{3}|D\d{3})/gi)];

if (matches.length === 0) {
  console.log('找不到 close feature:TaskID 指令，未自動勾選任務');
  process.exit(0);
}

// 依 feature 分組
const featureTasks = {};
matches.forEach(m => {
  const feature = m[1];
  const taskId = m[2];
  if (!featureTasks[feature]) featureTasks[feature] = [];
  featureTasks[feature].push(taskId);
});

Object.entries(featureTasks).forEach(([feature, taskIds]) => {
  const path = `specs/${feature}/tasks.md`;
  if (!fs.existsSync(path)) {
    console.warn(`找不到 ${path}，略過`);
    return;
  }
  let content = fs.readFileSync(path, 'utf8');
  taskIds.forEach(taskId => {
    // 只勾選對應前綴的任務ID
    const regex = new RegExp(`- \\[ \\] (${taskId} )`, 'g');
    content = content.replace(regex, '- [x] $1');
  });
  fs.writeFileSync(path, content);
  console.log(`已自動勾選 ${feature}: ${taskIds.join(', ')}`);
});