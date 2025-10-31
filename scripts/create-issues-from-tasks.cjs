
// --- 型別定義 ---
/**
 * @typedef {Object} Task
 * @property {string} title
 * @property {string[]} details
 */

/**
 * @typedef {Object} SpecInfo
 * @property {string} name
 * @property {Task[]} tasks
 */

/**
 * @typedef {Object} Issue
 * @property {number} number
 * @property {string} title
 * @property {string} body
 * @property {Array<{name: string}>} labels
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SPECS_DIR = path.join(__dirname, '../specs');
const TASKS_MD = 'tasks.md';
const LABELS = ['speckit', 'auto-task'];

function getAllSpecs() {
  return fs.readdirSync(SPECS_DIR).filter(f => fs.statSync(path.join(SPECS_DIR, f)).isDirectory());
}

/**
 * 解析 tasks.md，回傳 Task[]
 * @param {string} filePath
 * @returns {Task[]}
 */
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
      const sub = line.replace(/^\s{2,}[-*] /, '').trim();
      currentTask.details.push(sub);
    } else if (currentTask && /^\s{1,}[-*] (.+)$/.test(line)) {
      const sub = line.replace(/^\s{1,}[-*] /, '').trim();
      currentTask.details.push(sub);
    }
  }
  if (currentTask) tasks.push(currentTask);
  return tasks;
}

/**
 * 取得現有 GitHub issues
 * @returns {Issue[]}
 */
function getExistingIssues() {
  const out = execSync('gh issue list --state all --limit 9000 --json title,number,body,labels', { encoding: 'utf8' });
  return JSON.parse(out);
}

/**
 * 整理所有 specs 與 tasks
 * @returns {SpecInfo[]}
 */
function collectSpecsAndTasks() {
  const specs = getAllSpecs();
  const result = [];
  for (const spec of specs) {
    const tasksPath = path.join(SPECS_DIR, spec, TASKS_MD);
    if (!fs.existsSync(tasksPath)) continue;
    const tasks = parseTasksMd(tasksPath);
    result.push({ name: spec, tasks });
  }
  return result;
}

/**
 * 比對 specs/tasks 與 issues，產生比對報告
 * @param {SpecInfo[]} specs
 * @param {Issue[]} issues
 * @returns {any[]}
 */
function diffSpecsAndIssues(specs, issues) {
  const report = [];
  for (const spec of specs) {
    const featureLabel = spec.name;
    const mainIssueTitle = `[${featureLabel}] Feature`;
    const mainIssue = issues.find(i => i.title === mainIssueTitle && i.labels.some(l => l.name === featureLabel));
    const mainIssueNumber = mainIssue ? mainIssue.number : null;
    const subIssues = issues.filter(i => i.title.startsWith(`[${featureLabel}] `) && i.labels.some(l => l.name === featureLabel) && i.title !== mainIssueTitle);
    const taskSet = new Set(spec.tasks.map(t => t.title));
    // 比對主 issue
    report.push({
      type: 'main',
      spec: featureLabel,
      exists: !!mainIssue,
      issue: mainIssue || null
    });
    // 比對 sub issue
    for (const task of spec.tasks) {
      const subIssueTitle = `[${featureLabel}] ${task.title}`;
      const subIssue = subIssues.find(i => i.title === subIssueTitle);
      let needTestLabel = task.title.startsWith('T');
      let hasTestLabel = subIssue && subIssue.labels.some(l => l.name === 'test');
      // 細項內容比對
      let newSubBody = `Parent: #${mainIssueNumber}\n\nAuto-generated from ${featureLabel}/tasks.md`;
      if (task.details && task.details.length > 0) {
        newSubBody += `\n\n**細項：**\n` + task.details.map(d => `- ${d}`).join('\n');
      }
      let bodyDiff = subIssue && subIssue.body !== newSubBody;
      report.push({
        type: 'sub',
        spec: featureLabel,
        title: task.title,
        exists: !!subIssue,
        needTestLabel,
        hasTestLabel,
        bodyDiff,
        subIssue: subIssue || null
      });
    }
    // 比對已被移除的 sub issue
    for (const sub of subIssues) {
      const taskTitle = sub.title.replace(`[${featureLabel}] `, '');
      if (!taskSet.has(taskTitle) && !sub.labels.some(l => l.name === 'remove')) {
        report.push({
          type: 'removed',
          spec: featureLabel,
          title: taskTitle,
          issue: sub
        });
      }
    }
  }
  return report;
}


function printReport(report) {
  for (const item of report) {
    if (item.type === 'main') {
      console.log(`[${item.spec}] 主 issue: ${item.exists ? '存在' : '缺少'}`);
    } else if (item.type === 'sub') {
      let msg = `  [${item.spec}] 子任務: ${item.title} - ${item.exists ? '存在' : '缺少'}`;
      if (item.needTestLabel && !item.hasTestLabel) msg += ' (需補 test label)';
      if (item.bodyDiff) msg += ' (細項內容不同)';
      console.log(msg);
    } else if (item.type === 'removed') {
      console.log(`  [${item.spec}] 已移除 checklist: ${item.title} (需標記 remove)`);
    }
  }
}

// --- GitHub 操作 ---
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

function addLabelToIssue(number, label) {
  ensureLabel(label);
  execSync(`gh issue edit ${number} --add-label "${label}"`, { encoding: 'utf8' });
}

function updateIssueBody(number, body) {
  execSync(`gh issue edit ${number} --body "${body.replace(/"/g, '\"')}"`, { encoding: 'utf8' });
}

// --- 執行所有 GitHub 操作 ---
function applyActions(report, specs, issues) {
  // 先確保全域 label
  for (const label of LABELS) ensureLabel(label);
  ensureLabel('test');
  ensureLabel('remove');

  for (const item of report) {
    if (item.type === 'main' && !item.exists) {
      // 建立主 issue
      const mainIssueTitle = `[${item.spec}] Feature`;
      const body = `Auto-generated main issue for ${item.spec}\n\n此 issue 代表 ${item.spec} 的主功能，所有子任務請見 sub-issues。`;
      const labels = [...LABELS, item.spec];
      const number = createIssue(mainIssueTitle, body, labels);
      console.log(`Created main issue: ${mainIssueTitle} (#${number})`);
    }
    if (item.type === 'sub') {
      const featureLabel = item.spec;
      const subIssueTitle = `[${featureLabel}] ${item.title}`;
      const mainIssue = issues.find(i => i.title === `[${featureLabel}] Feature` && i.labels.some(l => l.name === featureLabel));
      const mainIssueNumber = mainIssue ? mainIssue.number : null;
      let subBody = `Parent: #${mainIssueNumber}\n\nAuto-generated from ${featureLabel}/tasks.md`;
      const specObj = specs.find(s => s.name === featureLabel);
      const task = specObj ? specObj.tasks.find(t => t.title === item.title) : null;
      if (task && task.details && task.details.length > 0) {
        subBody += `\n\n**細項：**\n` + task.details.map(d => `- ${d}`).join('\n');
      }
      // 新增 sub issue
      if (!item.exists) {
        const extraLabels = item.needTestLabel ? ['test'] : [];
        createIssue(subIssueTitle, subBody, [...LABELS, featureLabel, ...extraLabels]);
        console.log(`Created sub-issue: ${subIssueTitle}`);
      } else {
        // 補 test label
        if (item.needTestLabel && !item.hasTestLabel && item.subIssue) {
          addLabelToIssue(item.subIssue.number, 'test');
          console.log(`Added test label to: ${subIssueTitle}`);
        }
        // 更新細項內容
        if (item.bodyDiff && item.subIssue) {
          updateIssueBody(item.subIssue.number, subBody);
          console.log(`Updated sub-issue body: ${subIssueTitle}`);
        }
      }
    }
    if (item.type === 'removed' && item.issue) {
      addLabelToIssue(item.issue.number, 'remove');
      console.log(`Marked sub-issue as removed: ${item.issue.title}`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const doAction = args.includes('--apply') || args.includes('-a');
  const specs = collectSpecsAndTasks();
  const issues = getExistingIssues();
  const report = diffSpecsAndIssues(specs, issues);
  printReport(report);

  console.log('\n---\n執行 GitHub 操作...');
  applyActions(report, specs, issues);
}

main();
