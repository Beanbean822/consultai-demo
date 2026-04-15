import {
  frameworkOptions,
  issueLibrary,
  sampleProject,
  sampleDocuments,
  riskTemplates,
  recommendationPool
} from './fixtures.js';

const API_BASE_URL = 'http://localhost:4174/api';
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
  High: '高优先级',
  Medium: '中优先级',
  Low: '低优先级'
};

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
  const materialSummary = normalized.materials.backgroundSummary;
  const summary = [
    ...(sampleMode ? analysisTemplate.summary || [] : []),
    `${effectiveProject.projectName} 针对 ${effectiveProject.topic} 的目标是 ${effectiveProject.goal}`,
    ...(sampleMode && materialSummary ? [`材料背景显示：${materialSummary}`] : []),
    `AI 根据上传资料识别出 ${issues.length || primaryIssues.length} 个关键阻碍，并与顾问共创优先级。`,
    '工作笔记显示客户在“执行节奏”和“流程协同”上诉求最强，因此建议以 30-60-90 天节奏落地。',
    '以下建议聚焦 90 天可落地动作，并标记可替换为真实 API 的触点。'
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
