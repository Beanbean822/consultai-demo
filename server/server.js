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
  High: 'High Priority',
  Medium: 'Medium Priority',
  Low: 'Low Priority'
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    title: item.title || item.question || `Key Issue ${index + 1}`,
    description: item.strategyHint || item.description || item.question || '',
    impact: item.impact || 'Medium'
  }));
  const primaryIssues = issues.length
    ? issues.slice(0, 4)
    : derivedQuestions.length
      ? derivedQuestions.slice(0, 4)
      : [
          {
            title: 'The growth north star is not yet unified',
            description: 'Revenue, renewal, and service KPIs are not aligned, which makes prioritization inconsistent.',
            impact: 'High'
          }
        ];
  const analysisTemplate = demoData.analysisTemplate || {};
  const summary = [
    ...(sampleMode ? analysisTemplate.summary || [] : []),
    `${effectiveProject.projectName} focuses on ${effectiveProject.topic} with the objective of ${effectiveProject.goal}`,
    ...(sampleMode && demoData.materials.backgroundSummary
      ? [`Background signal from the case materials: ${demoData.materials.backgroundSummary}`]
      : []),
    `AI extracted ${issues.length || primaryIssues.length} priority issues from the uploaded materials and prepared them for consultant review.`,
    'Working notes suggest the strongest client demand centers on execution cadence and cross-functional coordination, so the immediate recommendation is a 30-60-90 day operating rhythm.',
    'The actions below focus on moves that are practical within the next 90 days and can later be linked to a real API workflow.'
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
    title: 'Framework Note',
    description:
      effectiveProject.framework === 'ogsm'
        ? 'OGSM is used here because the growth ambition is already clear. The real task is to convert that ambition into executable actions, measures, and operating ownership. OGSM keeps objectives, strategies, and review metrics in one structure so issue review can flow directly into execution planning.'
        : frameworkMeta?.description || 'Short note for the selected framework.',
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
