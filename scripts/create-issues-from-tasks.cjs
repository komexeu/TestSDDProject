// 解析所有 specs/*/tasks.md，將未勾選的 checklist 轉為 GitHub issue

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN is required');
  process.exit(1);
}

const SPECS_DIR = path.join(__dirname, '../specs');
const TASKS_MD = 'tasks.md';
const LABELS = ['speckit', 'auto-task'];

function getAllSpecs() {
  return fs.readdirSync(SPECS_DIR).filter(f => fs.statSync(path.join(SPECS_DIR, f)).isDirectory());
}

function parseTasksMd(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const tasks = [];
  let currentTask = null;
  for (const line of lines) {
    const match = line.match(/^[-*] \[ \] (.+)$/);
    if (match) {
      if (currentTask) tasks.push(currentTask);
      currentTask = { title: match[1].trim(), details: [] };
    } else if (currentTask && /^\s{2,}[-*] (.+)$/.test(line)) {
      // 解析二級子項目（兩個以上空白開頭）
      const sub = line.replace(/^\s{2,}[-*] /, '').trim();
      currentTask.details.push(sub);
    } else if (currentTask && /^\s{1,}[-*] (.+)$/.test(line)) {
      // 解析一級子項目（單一空白開頭）
      const sub = line.replace(/^\s{1,}[-*] /, '').trim();
      currentTask.details.push(sub);
    }
  }
  if (currentTask) tasks.push(currentTask);
  return tasks;
}

function getExistingIssues() {
  const out = execSync('gh issue list --state all --limit 9000 --json title,number,body,labels', { encoding: 'utf8' });
  return JSON.parse(out);
}

function ensureLabel(label) {
  try {
    execSync(`gh label create "${label}" --force`, { stdio: 'ignore' });
  } catch { }
}

function createIssue(title, body, labels) {
  const labelArgs = labels.map(l => `--label "${l}"`).join(' ');
  const cmd = `gh issue create --title "${title}" --body "${body}" ${labelArgs}`;
  const out = execSync(cmd, { encoding: 'utf8' });
  const match = out.match(/https:\/\/github.com\/[^/]+\/[^/]+\/issues\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function main() {
  const specs = getAllSpecs();
  const existingIssues = getExistingIssues();
  for (const label of LABELS) ensureLabel(label);
  ensureLabel('test');

  for (const spec of specs) {
    // if (spec != '004-create-order')
    //   continue;

    const featureLabel = spec;
    ensureLabel(featureLabel);
    const tasksPath = path.join(SPECS_DIR, spec, TASKS_MD);
    if (!fs.existsSync(tasksPath)) continue;
    // 1. 主 issue: 以 spec 名稱為標題
    const mainIssueTitle = `[${featureLabel}] Feature`;
    let mainIssue = existingIssues.find(i => i.title === mainIssueTitle && i.labels.some(l => l.name === featureLabel));
    let mainIssueNumber = mainIssue ? mainIssue.number : null;
    if (mainIssueNumber) {
      console.log(`Main issue already exists: ${mainIssueTitle} (#${mainIssueNumber})`);
    } else {
      mainIssueNumber = createIssue(mainIssueTitle, `Auto-generated main issue for ${spec}\n\n此 issue 代表 ${spec} 的主功能，所有子任務請見 sub-issues。`, [...LABELS, featureLabel]);
      console.log(`Created main issue: ${mainIssueTitle} (#${mainIssueNumber})`);
      // 重新取得 existingIssues 以便 reference
      existingIssues.push({ title: mainIssueTitle, number: mainIssueNumber, labels: [{ name: featureLabel }] });
    }

    // 2. sub issue: checklist
    const tasks = parseTasksMd(tasksPath);
    if (!mainIssueNumber) {
      console.log(`Skip sub-issues for ${spec} because main issue does not exist.`);
    } else {
      // 先建立一個 set 方便比對
      const taskSet = new Set(tasks.map(t => t.title));
      // 先處理現有 sub issue 是否有已被移除的
      for (const issue of existingIssues) {
        if (
          issue.title.startsWith(`[${featureLabel}] `) &&
          issue.labels.some(l => l.name === featureLabel) &&
          issue.title !== `[${featureLabel}] Feature`
        ) {
          const taskTitle = issue.title.replace(`[${featureLabel}] `, '');
          if (!taskSet.has(taskTitle) && !issue.labels.some(l => l.name === 'remove')) {
            // 標記 remove label
            ensureLabel('remove');
            const cmd = `gh issue edit ${issue.number} --add-label "remove"`;
            execSync(cmd, { encoding: 'utf8' });
            console.log(`Marked sub-issue as removed: ${issue.title}`);
          }
        }
      }
      // 再處理新增 sub issue
      for (const task of tasks) {
        const subIssueTitle = `[${featureLabel}] ${task.title}`;
        const exists = existingIssues.some(i => i.title === subIssueTitle && i.labels.some(l => l.name === featureLabel));
        // T 開頭自動加 test label
        const extraLabels = task.title.startsWith('T') ? ['test'] : [];
        if (exists) {
          console.log(`[${featureLabel}] Sub issue already exists: ${subIssueTitle}`);
          // 如果 T 開頭但沒有 test 標籤，補上
          if (extraLabels.includes('test')) {
            const existing = existingIssues.find(i => i.title === subIssueTitle && i.labels.some(l => l.name === featureLabel));
            if (existing && !existing.labels.some(l => l.name === 'test')) {
              ensureLabel('test');
              const cmd = `gh issue edit ${existing.number} --add-label "test"`;
              execSync(cmd, { encoding: 'utf8' });
              console.log(`Added test label to: ${subIssueTitle}`);
            }
          }
        } else {
          console.log(`[${featureLabel}] Creating sub issue: ${subIssueTitle}`);
          let subBody = `Parent: #${mainIssueNumber}\n\nAuto-generated from ${spec}/tasks.md`;
          if (task.details && task.details.length > 0) {
            subBody += `\n\n**細項：**\n` + task.details.map(d => `- ${d}`).join('\n');
          }
          createIssue(subIssueTitle, subBody, [...LABELS, featureLabel, ...extraLabels]);
          console.log(`Created sub-issue: ${subIssueTitle}`);
        }
      }
    }
  }
}

main();
