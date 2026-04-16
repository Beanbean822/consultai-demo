import {
  frameworkOptions,
  issueLibrary,
  sampleProject,
  sampleDocuments,
  riskTemplates,
  recommendationPool
} from './fixtures.js?v=20260416-hero3';

const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4174/api'
    : null;
const LOCAL_DATA_URL = new URL('../data/demo-case.json', import.meta.url);
const LOCAL_LOCALES_URL = new URL('../data/demo-case-locales.json', import.meta.url);
const defaultDemoData = {
  frameworkOptions,
  issueLibrary,
  sampleProject,
  sampleDocuments,
  riskTemplates,
  recommendationPool
};
let localDemoDataPromise;
let localDemoLocalesPromise;
const impactCopy = {
  High: 'High Priority',
  Medium: 'Medium Priority',
  Low: 'Low Priority'
};

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

const localizeDemoData = (data = {}, lang = 'en', locales = {}) => {
  const normalized = normalizeDemoData(deepClone(data));
  if (lang === 'en') return normalized;
  const localeData = locales?.[lang];
  if (!localeData) return normalized;
  return normalizeDemoData(mergeLocalizedDemoData(normalized, localeData));
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

const buildHighLevelFindings = (issues = [], project = {}, lang = 'en') => {
  const titles = issues.map((issue) => issue.title || '');
  const hasGrowth = titles.some((title) => /growth|subscription|revenue|channel/i.test(title));
  const hasOps = titles.some((title) => /delivery|process|talent|ramp|role/i.test(title));
  const hasIncentive = titles.some((title) => /incentive|performance|compensation|outcome/i.test(title));
  const findings = [];

  if (hasGrowth) {
    findings.push(
      lang === 'zh'
        ? `${project.topic || '当前项目'}已经有明确的增长目标，但从签约、渠道激活到确认收入的路径，仍未被拆解为稳定的经营节奏。`
        : `${project.topic || 'The current project'} has a clear growth ambition, but the path from signed deals and channel activation to recognized revenue is still not translated into a disciplined operating cadence.`
    );
  }
  if (hasOps) {
    findings.push(
      lang === 'zh'
        ? '交付标准化、跨部门协同和人才培养节奏仍不足以支撑既定的业务放量目标。'
        : 'Delivery standardization, cross-functional coordination, and talent ramp-up are not yet strong enough to support the planned scale-up.'
    );
  }
  if (hasIncentive) {
    findings.push(
      lang === 'zh'
        ? '激励与绩效机制尚未与关键经营结果紧密挂钩，导致团队执行焦点难以稳定围绕核心目标展开。'
        : 'Incentive and performance mechanisms are not tightly linked to business outcomes, which weakens execution focus around the most important results.'
    );
  }
  if (!findings.length) {
    findings.push(
      lang === 'zh'
        ? '已选问题表明，当前最主要的挑战在于如何把战略目标真正转化为有责任人、有节奏和可复盘的协同执行。'
        : 'The selected issues suggest that the main challenge is turning strategy into coordinated execution with clear ownership and review rhythm.'
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

const getLocalDemoLocales = async () => {
  if (!localDemoLocalesPromise) {
    localDemoLocalesPromise = fetch(LOCAL_LOCALES_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Local demo locale JSON error: ${response.status}`);
        }
        return response.json();
      })
      .catch(() => ({}));
  }
  return localDemoLocalesPromise;
};

const getLocalizedDemoData = async (lang = 'en') => {
  const [data, locales] = await Promise.all([getLocalDemoData(), getLocalDemoLocales()]);
  return localizeDemoData(data || defaultDemoData, lang, locales || {});
};

const buildAnalysis = (
  { project, issues = [], notes = '', sampleMode = false, lang = 'en' },
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
            title: lang === 'zh' ? '增长北极星目标尚未统一' : 'The growth north star is not yet unified',
            description: lang === 'zh' ? '收入、续约和服务指标之间仍未对齐，导致优先级判断容易出现偏差。' : 'Revenue, renewal, and service KPIs are not aligned, which makes prioritization inconsistent.',
            impact: 'High'
          }
        ];
  const analysisTemplate = demoData.analysisTemplate || {};
  const materialSummary = normalized.materials.backgroundSummary;
  const summary = [
    ...(sampleMode ? analysisTemplate.summary || [] : []),
    lang === 'zh'
      ? `${effectiveProject.projectName} 当前聚焦于${effectiveProject.topic}，本次分析目标是${effectiveProject.goal}`
      : `${effectiveProject.projectName} focuses on ${effectiveProject.topic} with the objective of ${effectiveProject.goal}`,
    ...(sampleMode && materialSummary ? [lang === 'zh' ? `材料背景信号：${materialSummary}` : `Background signal from the case materials: ${materialSummary}`] : []),
    lang === 'zh'
      ? `AI 已从上传材料中提炼出 ${issues.length || primaryIssues.length} 个优先问题，等待顾问确认与排序。`
      : `AI extracted ${issues.length || primaryIssues.length} priority issues from the uploaded materials and prepared them for consultant review.`,
    lang === 'zh'
      ? '当前材料显示，客户最核心的诉求集中在执行节奏和跨部门协同，因此建议优先建立 30-60-90 天经营节奏。'
      : 'Working notes suggest the strongest client demand centers on execution cadence and cross-functional coordination, so the immediate recommendation is a 30-60-90 day operating rhythm.',
    lang === 'zh'
      ? '以下建议动作聚焦于未来 90 天内可落地的优先事项，并可在后续接入真实 API 工作流。'
      : 'The actions below focus on moves that are practical within the next 90 days and can later be linked to a real API workflow.'
  ];
  const findings =
    buildHighLevelFindings(primaryIssues, effectiveProject, lang);

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
    title: lang === 'zh' ? '框架说明' : 'Framework Note',
    description:
      effectiveProject.framework === 'ogsm'
        ? (lang === 'zh'
          ? '本案例采用 OGSM，是因为增长目标本身已经明确，真正的任务是把这些目标转化为可执行的动作、衡量指标与经营责任。OGSM 可以把目标、策略和复盘指标放在同一结构中，使问题审核自然衔接到执行规划。'
          : 'OGSM is used here because the growth ambition is already clear. The real task is to convert that ambition into executable actions, measures, and operating ownership. OGSM keeps objectives, strategies, and review metrics in one structure so issue review can flow directly into execution planning.')
        : frameworkMeta?.description || (lang === 'zh' ? '当前所选框架的简要说明。' : 'Short note for the selected framework.'),
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
  async fetchCaseData(lang = 'en') {
    return getLocalizedDemoData(lang);
  },
  async fetchFrameworks(lang = 'en') {
    return request(`/frameworks?lang=${lang}`, {
      timeoutMs: 1200,
      fallback: async () => (await getLocalizedDemoData(lang)).frameworkOptions || frameworkOptions
    });
  },
  async fetchIssues(frameworkId, lang = 'en') {
    return request(`/issues?framework=${frameworkId}&lang=${lang}`, {
      timeoutMs: 1500,
      fallback: async () => {
        const local = await getLocalizedDemoData(lang);
        return local?.issueLibrary?.[frameworkId] || local?.issueLibrary?.swot || issueLibrary[frameworkId] || issueLibrary.swot;
      }
    });
  },
  async fetchSampleProject(lang = 'en') {
    return request(`/sample-project?lang=${lang}`, {
      timeoutMs: 1200,
      fallback: async () => (await getLocalizedDemoData(lang)).sampleProject || sampleProject
    });
  },
  async fetchSampleDocs(lang = 'en') {
    return request(`/sample-docs?lang=${lang}`, {
      timeoutMs: 1200,
      fallback: async () => (await getLocalizedDemoData(lang)).sampleDocuments || sampleDocuments
    });
  },
  async generateAnalysis(payload, lang = 'en') {
    const local = await getLocalizedDemoData(lang);
    return request('/analysis', {
      method: 'POST',
      body: JSON.stringify({ ...payload, lang }),
      timeoutMs: 1800,
      fallback: () => buildAnalysis({ ...payload, lang }, local || defaultDemoData)
    });
  }
};
