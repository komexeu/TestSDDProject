// 解析所有 specs/*/tasks.md，將未勾選的 checklist 轉為 GitHub issue
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN is required');
  process.exit(1);
}

// 取得所有 tasks.md 路徑
const specsDir = path.join(__dirname, '../specs');
const featureDirs = fs.readdirSync(specsDir).filter(f => fs.statSync(path.join(specsDir, f)).isDirectory());
let allTasks = [];

featureDirs.forEach(feature => {
  const tasksPath = path.join(specsDir, feature, 'tasks.md');
  if (!fs.existsSync(tasksPath)) return;
  const content = fs.readFileSync(tasksPath, 'utf8');
  // 只抓未勾選的 checklist
  const matches = [...content.matchAll(/^- \[ \] (.+)$/gm)];
  matches.forEach(m => {
    allTasks.push({
      feature,
      title: m[1].trim(),
      body: `來源：specs/${feature}/tasks.md\n\n${m[1].trim()}`
    });
  });
});

if (allTasks.length === 0) {
  console.log('No new tasks to create as issues.');
  process.exit(0);
}

// 建立 issue
allTasks.forEach(task => {
  const cmd = `gh issue create --title "${task.title}" --body "${task.body}" --label speckit,auto-task`;
  console.log(`Creating issue: ${task.title}`);
  execSync(cmd, {
    stdio: 'inherit',
    env: { ...process.env, GITHUB_TOKEN }
  });
});
