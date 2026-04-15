import {
  frameworkOptions,
  issueLibrary,
  sampleProject,
  sampleDocuments,
  riskTemplates,
  recommendationPool
} from './fixtures.js';

const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4174/api'
    : null;
const LOCAL_DATA_URL = new URL('../data/demo-case.json', import.meta.url);
const defaultDemoData = {
  frameworkOptions,
  issueLibrary,
  sampleProject,
  sampleDocuments,
  riskTemplates,
  recommendationPool
};
let localDemoDataPromise;
const impactCopy = {
  High: 'High Priority',
  Medium: 'Medium Priority',
  Low: 'Low Priority'
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

const normalizeDemoData = (data = {}) => ({
  frameworkOptions: data.frameworkOptions || frameworkOptions,
  sampleProject: data.sampleProject || data.project?.setupDefaults || sampleProject,
  sampleDocuments:
    data.sampleDocuments ||
    data.materials?.sampleDocuments?.map((item) => item.name) ||
    sampleDocuments,
  issueLibrary: data.issueLibrary || issueLibrary,
  riskTemplates: data.riskTemplates || riskTemplates,
  recommendationPool: data.recommendationPool || recommendationPool,
  analysisTemplate: data.analysisTemplate || {},
  keyQuestions: data.keyQuestions || [],
  ogsmTable: data.ogsmTable || [],
  materials: data.materials || {},
  project: data.project || {}
});

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

const getLocalDemoData = async () => {
  if (!localDemoDataPromise) {
    localDemoDataPromise = fetch(LOCAL_DATA_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Local demo JSON error: ${response.status}`);
        }
        return response.json().then(normalizeDemoData);
      })
      .catch(() => null);
  }
  return localDemoDataPromise;
};

const buildAnalysis = (
  { project, issues = [], notes = '', sampleMode = false },
  demoData = defaultDemoData
) => {
  const normalized = normalizeDemoData(demoData);
  const effectiveProject = project || normalized.sampleProject;
  const derivedQuestions = normalized.keyQuestions.map((item, index) => ({
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
  const materialSummary = normalized.materials.backgroundSummary;
  const summary = [
    ...(sampleMode ? analysisTemplate.summary || [] : []),
    `${effectiveProject.projectName} focuses on ${effectiveProject.topic} with the objective of ${effectiveProject.goal}`,
    ...(sampleMode && materialSummary ? [`Background signal from the case materials: ${materialSummary}`] : []),
    `AI extracted ${issues.length || primaryIssues.length} priority issues from the uploaded materials and prepared them for consultant review.`,
    'Working notes suggest the strongest client demand centers on execution cadence and cross-functional coordination, so the immediate recommendation is a 30-60-90 day operating rhythm.',
    'The actions below focus on moves that are practical within the next 90 days and can later be linked to a real API workflow.'
  ];
  const findings =
    buildHighLevelFindings(primaryIssues, effectiveProject);

  const frameworkMeta = normalized.frameworkOptions.find((f) => f.id === effectiveProject.framework);
  const derivedHighlights = sampleMode && normalized.ogsmTable.length
    ? normalized.ogsmTable.flatMap((row) => [
        { label: 'Objective', text: row.objective },
        ...(row.goals?.length ? [{ label: 'Goal', text: row.goals.join('；') }] : []),
        ...(row.strategies?.length ? [{ label: 'Strategy', text: row.strategies.join('；') }] : []),
        ...(row.measures?.length ? [{ label: 'Measure', text: row.measures.join('；') }] : [])
      ]).slice(0, 4)
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

  const risks = normalized.riskTemplates.map((risk) => ({ ...risk }));
  const recommendations = pick(randomRotate(normalized.recommendationPool), 4);
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

const request = async (path, { method = 'GET', body, fallback, timeoutMs = 1800 } = {}) => {
  if (!API_BASE_URL) {
    if (fallback === undefined) {
      throw new Error('No API base URL configured for this environment.');
    }
    return typeof fallback === 'function' ? fallback() : fallback;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    };
    if (body !== undefined) {
      options.body = body;
    }
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (fallback === undefined) {
      throw error;
    }
    return typeof fallback === 'function' ? fallback() : fallback;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const DemoAPI = {
  async fetchCaseData() {
    return (await getLocalDemoData()) || normalizeDemoData(defaultDemoData);
  },
  async fetchFrameworks() {
    return request('/frameworks', {
      timeoutMs: 1200,
      fallback: async () => (await getLocalDemoData())?.frameworkOptions || frameworkOptions
    });
  },
  async fetchIssues(frameworkId) {
    return request(`/issues?framework=${frameworkId}`, {
      timeoutMs: 1500,
      fallback: async () => {
        const local = await getLocalDemoData();
        return local?.issueLibrary?.[frameworkId] || local?.issueLibrary?.swot || issueLibrary[frameworkId] || issueLibrary.swot;
      }
    });
  },
  async fetchSampleProject() {
    return request('/sample-project', {
      timeoutMs: 1200,
      fallback: async () => (await getLocalDemoData())?.sampleProject || sampleProject
    });
  },
  async fetchSampleDocs() {
    return request('/sample-docs', {
      timeoutMs: 1200,
      fallback: async () => (await getLocalDemoData())?.sampleDocuments || sampleDocuments
    });
  },
  async generateAnalysis(payload) {
    const local = await getLocalDemoData();
    return request('/analysis', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 1800,
      fallback: () => buildAnalysis(payload, local || defaultDemoData)
    });
  }
};
