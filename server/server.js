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
const demoCaseLocales = require('../data/demo-case-locales.json');

const PORT = process.env.PORT || 4174;
const impactCopy = {
  High: 'High Priority',
  Medium: 'Medium Priority',
  Low: 'Low Priority'
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const deepClone = (value) => JSON.parse(JSON.stringify(value));

const mergeLocalizedDemoData = (baseData = {}, localeData = {}) => ({
  ...baseData,
  ...localeData,
  project: {
    ...(baseData.project || {}),
    ...(localeData.project || {}),
    metadata: {
      ...(baseData.project?.metadata || {}),
      ...(localeData.project?.metadata || {})
    },
    brief: {
      ...(baseData.project?.brief || {}),
      ...(localeData.project?.brief || {})
    },
    setupDefaults: {
      ...(baseData.project?.setupDefaults || {}),
      ...(localeData.project?.setupDefaults || {})
    }
  },
  materials: {
    ...(baseData.materials || {}),
    ...(localeData.materials || {}),
    sampleDocuments: localeData.materials?.sampleDocuments || baseData.materials?.sampleDocuments || []
  },
  analysisTemplate: {
    ...(baseData.analysisTemplate || {}),
    ...(localeData.analysisTemplate || {}),
    frameworkDetails: {
      ...(baseData.analysisTemplate?.frameworkDetails || {}),
      ...(localeData.analysisTemplate?.frameworkDetails || {})
    }
  },
  frameworkOptions: localeData.frameworkOptions || baseData.frameworkOptions || [],
  keyQuestions: localeData.keyQuestions || baseData.keyQuestions || [],
  ogsmTable: localeData.ogsmTable || baseData.ogsmTable || [],
  sampleProject: {
    ...(baseData.sampleProject || {}),
    ...(localeData.sampleProject || {})
  },
  sampleDocuments: localeData.sampleDocuments || baseData.sampleDocuments || [],
  issueLibrary: localeData.issueLibrary || baseData.issueLibrary || {},
  riskTemplates: localeData.riskTemplates || baseData.riskTemplates || [],
  recommendationPool: localeData.recommendationPool || baseData.recommendationPool || []
});

const getDemoData = (lang = 'en') => {
  const baseData = {
    frameworkOptions,
    issueLibrary,
    sampleProject,
    sampleDocuments,
    riskTemplates,
    recommendationPool
  };
  const localeData = lang === 'zh' ? demoCaseLocales.zh || {} : {};
  return normalizeDemoData(mergeLocalizedDemoData(deepClone(baseData), localeData));
};

const sentenceCase = (text = '') => {
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
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
  const hasGrowth = titles.some((title) => /growth|subscription|revenue|channel/i.test(title));
  const hasOps = titles.some((title) => /delivery|process|talent|ramp|role/i.test(title));
  const hasIncentive = titles.some((title) => /incentive|performance|compensation|outcome/i.test(title));
  const findings = [];

  if (hasGrowth) {
    findings.push(
      `${project.topic || 'The current project'} has a clear growth ambition, but the path from signed deals and channel activation to recognized revenue is still not translated into a disciplined operating cadence.`
    );
  }
  if (hasOps) {
    findings.push(
      'Delivery standardization, cross-functional coordination, and talent ramp-up are not yet strong enough to support the planned scale-up.'
    );
  }
  if (hasIncentive) {
    findings.push(
      'Incentive and performance mechanisms are not tightly linked to business outcomes, which weakens execution focus around the most important results.'
    );
  }
  if (!findings.length) {
    findings.push(
      'The selected issues suggest that the main challenge is turning strategy into coordinated execution with clear ownership and review rhythm.'
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

const buildAnalysis = ({ project, issues = [], notes = '', sampleMode = false, lang = 'en' }) => {
  const demoData = getDemoData(lang);
  const effectiveProject = project || demoData.sampleProject;
  const derivedQuestions = demoData.keyQuestions.map((item, index) => ({
    id: item.id || `kq-${index + 1}`,
    title: item.title || item.question || (lang === 'zh' ? `关键问题 ${index + 1}` : `Key Issue ${index + 1}`),
    description: item.strategyHint || item.description || item.question || '',
    impact: item.impact || 'Medium'
  }));
  const primaryIssues = issues.length
    ? issues.slice(0, 4)
    : derivedQuestions.length
      ? derivedQuestions.slice(0, 4)
      : [
          {
            title: lang === 'zh' ? '增长北极星目标尚未统一' : 'The growth north star is not yet unified',
            description: lang === 'zh' ? '收入、续约与服务 KPI 尚未形成统一口径，导致优先级判断不稳定。' : 'Revenue, renewal, and service KPIs are not aligned, which makes prioritization inconsistent.',
            impact: 'High'
          }
        ];
  const analysisTemplate = demoData.analysisTemplate || {};
  const summary = [
    ...(sampleMode ? analysisTemplate.summary || [] : []),
    lang === 'zh'
      ? `${effectiveProject.projectName}当前聚焦${effectiveProject.topic}，目标是${effectiveProject.goal}`
      : `${effectiveProject.projectName} focuses on ${effectiveProject.topic} with the objective of ${effectiveProject.goal}`,
    ...(sampleMode && demoData.materials.backgroundSummary
      ? [lang === 'zh'
        ? `案例材料释放出的背景信号：${demoData.materials.backgroundSummary}`
        : `Background signal from the case materials: ${demoData.materials.backgroundSummary}`]
      : []),
    lang === 'zh'
      ? `AI 已从上传材料中提炼出 ${issues.length || primaryIssues.length} 个重点问题，供顾问进一步确认。`
      : `AI extracted ${issues.length || primaryIssues.length} priority issues from the uploaded materials and prepared them for consultant review.`,
    lang === 'zh'
      ? '当前工作笔记显示，客户最核心的诉求集中在执行节奏与跨部门协同，因此建议先建立 30-60-90 天的推进机制。'
      : 'Working notes suggest the strongest client demand centers on execution cadence and cross-functional coordination, so the immediate recommendation is a 30-60-90 day operating rhythm.',
    lang === 'zh'
      ? '以下动作优先聚焦未来 90 天内可落地的举措，并可在后续接入真实 API 工作流。'
      : 'The actions below focus on moves that are practical within the next 90 days and can later be linked to a real API workflow.'
  ];

  const findings = buildHighLevelFindings(primaryIssues, effectiveProject);

  const frameworkMeta = demoData.frameworkOptions.find((f) => f.id === effectiveProject.framework);
  const derivedHighlights = sampleMode && demoData.ogsmTable.length
    ? demoData.ogsmTable
        .flatMap((row) => [
          { label: lang === 'zh' ? '目标方向' : 'Objective', text: row.objective },
          ...(row.goals?.length ? [{ label: lang === 'zh' ? '目标' : 'Goal', text: row.goals.join(lang === 'zh' ? '；' : '; ') }] : []),
          ...(row.strategies?.length ? [{ label: lang === 'zh' ? '策略' : 'Strategy', text: row.strategies.join(lang === 'zh' ? '；' : '; ') }] : []),
          ...(row.measures?.length ? [{ label: lang === 'zh' ? '衡量' : 'Measure', text: row.measures.join(lang === 'zh' ? '；' : '; ') }] : []),
        ])
        .slice(0, 4)
    : null;
  const frameworkDetails = {
    title: lang === 'zh' ? '框架说明' : 'Framework Note',
    description:
      effectiveProject.framework === 'ogsm'
        ? (lang === 'zh'
          ? '此处使用 OGSM，是因为增长目标本身已经明确，真正需要解决的是如何把目标拆解为可执行动作、衡量指标与责任归属。OGSM 能把目标、策略与评审指标放进同一结构，确保问题审核能够直接过渡到执行规划。'
          : 'OGSM is used here because the growth ambition is already clear. The real task is to convert that ambition into executable actions, measures, and operating ownership. OGSM keeps objectives, strategies, and review metrics in one structure so issue review can flow directly into execution planning.')
        : frameworkMeta?.description || (lang === 'zh' ? '当前所选框架的简要说明。' : 'Short note for the selected framework.'),
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

  const lang = query.lang === 'zh' ? 'zh' : 'en';
  const demoData = getDemoData(lang);

  if (pathname === '/api/frameworks' && req.method === 'GET') {
    await delay(200);
    return sendJson(res, 200, demoData.frameworkOptions);
  }

  if (pathname === '/api/issues' && req.method === 'GET') {
    await delay(350);
    const framework = query.framework || 'swot';
    const payload = demoData.issueLibrary[framework] || demoData.issueLibrary.swot;
    return sendJson(res, 200, payload);
  }

  if (pathname === '/api/sample-project' && req.method === 'GET') {
    await delay(150);
    return sendJson(res, 200, demoData.sampleProject);
  }

  if (pathname === '/api/sample-docs' && req.method === 'GET') {
    await delay(150);
    return sendJson(res, 200, demoData.sampleDocuments);
  }

  if (pathname === '/api/analysis' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      await delay(500);
      const analysis = buildAnalysis({ ...body, lang: body.lang === 'zh' ? 'zh' : 'en' });
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
