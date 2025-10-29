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
  for (const line of lines) {
    const match = line.match(/^[-*] \[ \] (.+)$/);
    if (match) {
      tasks.push(match[1].trim());
    }
  }
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

  for (const spec of specs) {
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
      for (const task of tasks) {
        const subIssueTitle = `[${featureLabel}] ${task}`;
        const exists = existingIssues.some(i => i.title === subIssueTitle && i.labels.some(l => l.name === featureLabel));
        if (exists) {
          console.log(`[${featureLabel}] Sub issue already exists: ${subIssueTitle}`);
        } else {
          console.log(`[${featureLabel}] Creating sub issue: ${subIssueTitle}`);
          const subBody = `Parent: #${mainIssueNumber}\n\nAuto-generated from ${spec}/tasks.md`;
          createIssue(subIssueTitle, subBody, [...LABELS, featureLabel]);
          console.log(`Created sub-issue: ${subIssueTitle}`);
        }
      }
    }
  }
}

main();
