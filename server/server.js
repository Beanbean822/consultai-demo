const http = require('http');
const url = require('url');
const {
  frameworkOptions,
  issueLibrary,
  sampleProject,
  sampleDocuments,
  riskTemplates,
  recommendationPool
} = require('./data');

const PORT = process.env.PORT || 4174;
const impactCopy = {
  High: '高优先级',
  Medium: '中优先级',
  Low: '低优先级'
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sentenceCase = (text = '') => {
  if (!text) return '';
  return /[。！？]$/.test(text) ? text : `${text}。`;
};

const pick = (arr, count) => {
  const clone = [...arr];
  while (clone.length < count) {
    clone.push(...arr);
  }
  return clone.slice(0, count);
};

const randomRotate = (arr) => {
  if (!arr.length) return arr;
  const offset = Math.floor(Math.random() * arr.length);
  return [...arr.slice(offset), ...arr.slice(0, offset)];
};

const buildHighLevelFindings = (issues = [], project = {}) => {
  const titles = issues.map((issue) => issue.title || '');
  const hasGrowth = titles.some((title) => /增长|订阅|收入|渠道/.test(title));
  const hasOps = titles.some((title) => /交付|流程|人才|培养/.test(title));
  const hasIncentive = titles.some((title) => /激励|绩效|业绩/.test(title));
  const findings = [];

  if (hasGrowth) {
    findings.push(
      `${project.topic || '当前项目'}的增长目标已经明确，但从签约、渠道到确认收入的执行链路仍缺少统一拆解，短期需要先建立季度节奏与责任分工。`
    );
  }
  if (hasOps) {
    findings.push(
      '交付流程标准化、跨部门协同与人才培养节奏未形成稳定支撑，说明组织能力尚未完全匹配业务扩张目标。'
    );
  }
  if (hasIncentive) {
    findings.push(
      '激励机制与经营目标之间缺少直接联动，导致团队行为难以围绕关键结果集中发力。'
    );
  }
  if (!findings.length) {
    findings.push(
      '当前已选问题显示，项目的主要挑战集中在目标拆解不充分、执行协同不足，以及缺少可持续跟踪的经营节奏。'
    );
  }

  return findings.slice(0, 3);
};

const normalizeDemoData = (data = {}) => ({
  frameworkOptions: data.frameworkOptions || [],
  sampleProject: data.sampleProject || data.project?.setupDefaults || {},
  sampleDocuments:
    data.sampleDocuments ||
    data.materials?.sampleDocuments?.map((item) => item.name) ||
    [],
  issueLibrary: data.issueLibrary || {},
  riskTemplates: data.riskTemplates || [],
  recommendationPool: data.recommendationPool || [],
  analysisTemplate: data.analysisTemplate || {},
  keyQuestions: data.keyQuestions || [],
  ogsmTable: data.ogsmTable || [],
  materials: data.materials || {},
});

const buildAnalysis = ({ project = sampleProject, issues = [], notes = '', sampleMode = false }) => {
  const demoData = normalizeDemoData({
    frameworkOptions,
    sampleProject,
    sampleDocuments,
    issueLibrary,
    riskTemplates,
    recommendationPool
  });
  const effectiveProject = project || demoData.sampleProject;
  const derivedQuestions = demoData.keyQuestions.map((item, index) => ({
    id: item.id || `kq-${index + 1}`,
    title: item.title || item.question || `关键问题 ${index + 1}`,
    description: item.strategyHint || item.description || item.question || '',
    impact: item.impact || 'Medium'
  }));
  const primaryIssues = issues.length
    ? issues.slice(0, 4)
    : derivedQuestions.length
      ? derivedQuestions.slice(0, 4)
      : [
          {
            title: '缺少统一的增长北极星',
            description: '收入、续费、服务等 KPI 未对齐，导致战役无法排优先级。',
            impact: 'High'
          }
        ];
  const analysisTemplate = demoData.analysisTemplate || {};
  const summary = [
    ...(sampleMode ? analysisTemplate.summary || [] : []),
    `${effectiveProject.projectName} 针对 ${effectiveProject.topic} 的目标是 ${effectiveProject.goal}`,
    ...(sampleMode && demoData.materials.backgroundSummary
      ? [`材料背景显示：${demoData.materials.backgroundSummary}`]
      : []),
    `AI 根据上传资料识别出 ${issues.length || primaryIssues.length} 个关键阻碍，并与顾问共创优先级。`,
    '工作笔记显示客户在“执行节奏”和“流程协同”上诉求最强，因此建议以 30-60-90 天节奏落地。',
    '以下建议聚焦 90 天内可落地的动作，并预留与真实 API 对接的空间。'
  ];

  const findings = buildHighLevelFindings(primaryIssues, effectiveProject);

  const frameworkMeta = demoData.frameworkOptions.find((f) => f.id === effectiveProject.framework);
  const derivedHighlights = sampleMode && demoData.ogsmTable.length
    ? demoData.ogsmTable
        .flatMap((row) => [
          { label: 'Objective', text: row.objective },
          ...(row.goals?.length ? [{ label: 'Goal', text: row.goals.join('；') }] : []),
          ...(row.strategies?.length ? [{ label: 'Strategy', text: row.strategies.join('；') }] : []),
          ...(row.measures?.length ? [{ label: 'Measure', text: row.measures.join('；') }] : []),
        ])
        .slice(0, 4)
    : null;
  const frameworkDetails = {
    title: '框架说明',
    description:
      effectiveProject.framework === 'ogsm'
        ? '本案例使用 OGSM，是因为项目已经具备明确增长目标，关键任务不是重新定义方向，而是把目标拆解为可执行的策略动作与衡量指标。OGSM 可以把业务目标、组织动作和跟踪指标放在同一结构中，便于从问题审核直接过渡到执行方案。'
        : frameworkMeta?.description || '当前所选框架的简要说明。',
    highlights:
      (sampleMode ? analysisTemplate.frameworkDetails?.highlights : null) ||
      derivedHighlights ||
      []
  };

  const risks = demoData.riskTemplates.map((risk) => ({ ...risk }));
  const recommendations = pick(randomRotate(demoData.recommendationPool), 4);
  const noteBlock = notes ? notes.split(/\n+/).filter(Boolean).slice(0, 2) : [];
  const issuesSnapshot = primaryIssues.map((issue) => issue.title);

  return {
    summary,
    findings,
    frameworkDetails,
    risks,
    recommendations,
    noteBlock,
    issuesSnapshot
  };
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  // Preflight handling
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (pathname === '/api/frameworks' && req.method === 'GET') {
    await delay(200);
    return sendJson(res, 200, frameworkOptions);
  }

  if (pathname === '/api/issues' && req.method === 'GET') {
    await delay(350);
    const framework = query.framework || 'swot';
    const payload = issueLibrary[framework] || issueLibrary.swot;
    return sendJson(res, 200, payload);
  }

  if (pathname === '/api/sample-project' && req.method === 'GET') {
    await delay(150);
    return sendJson(res, 200, sampleProject);
  }

  if (pathname === '/api/sample-docs' && req.method === 'GET') {
    await delay(150);
    return sendJson(res, 200, sampleDocuments);
  }

  if (pathname === '/api/analysis' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      await delay(500);
      const analysis = buildAnalysis(body);
      return sendJson(res, 200, analysis);
    } catch (error) {
      return sendJson(res, 400, { message: error.message });
    }
  }

  sendJson(res, 404, { message: 'Not found' });
});

const start = (port = PORT) =>
  server.listen(port, () => {
    console.log(`ConsultAI mock API listening on http://localhost:${port}`);
  });

if (require.main === module) {
  start();
}

module.exports = { server, start };
