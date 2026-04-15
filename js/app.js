import { DemoAPI } from './services.js';

const state = {
  language: 'en',
  quickStart: null,
  project: null,
  caseData: null,
  setupSource: 'blank',
  sampleProjectLoaded: false,
  sampleDocsLoaded: false,
  uploads: [],
  notes: '',
  parsing: {
    running: false,
    completed: false,
    logs: ['Waiting for file upload or sample materials.']
  },
  issues: [],
  selectedIssueIds: [],
  analysis: null,
  frameworks: []
};

const sections = [...document.querySelectorAll('.demo-section')];
const progressSteps = [...document.querySelectorAll('.progress-step')];
const sectionMap = Object.fromEntries(sections.map((section) => [section.dataset.section, section]));
let currentStep = 'landing';

const setupForm = document.getElementById('setupForm');
const frameworkSelect = document.getElementById('frameworkSelect');
const startDemoBtn = document.getElementById('startDemoBtn');
const useSampleLandingBtn = document.getElementById('useSampleLandingBtn');
const backToLanding = document.getElementById('backToLanding');
const loadSampleProjectBtn = document.getElementById('loadSampleProject');
const useSampleDocsBtn = document.getElementById('useSampleDocs');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const notesInput = document.getElementById('notesInput');
const saveNotesBtn = document.getElementById('saveNotesBtn');
const toPainBtn = document.getElementById('toPainBtn');
const issuesGrid = document.getElementById('issuesGrid');
const selectAllBtn = document.getElementById('selectAllIssues');
const clearIssuesBtn = document.getElementById('clearIssues');
const issueCount = document.getElementById('issueCount');
const manualIssueForm = document.getElementById('manualIssueForm');
const generateAnalysisBtn = document.getElementById('generateAnalysisBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const restartBtn = document.getElementById('restartDemo');
const startLinks = [...document.querySelectorAll('[data-step-link]')];
const startScriptBtn = document.getElementById('recordScriptBtn');
const presenterTemplate = document.getElementById('presenterScript');
const summaryList = document.getElementById('summaryList');
const findingsList = document.getElementById('findingsList');
const frameworkBlock = document.getElementById('frameworkBlock');
const risksList = document.getElementById('risksList');
const recommendationsList = document.getElementById('recommendationsList');
const issuesSnapshot = document.getElementById('issuesSnapshot');
const reportProjectName = document.getElementById('reportProjectName');
const reportTopic = document.getElementById('reportTopic');
const reportFramework = document.getElementById('reportFramework');
const reportDate = document.getElementById('reportDate');
const reportLabel = document.getElementById('reportLabel');
const reportMainTitle = document.getElementById('reportMainTitle');
const reportSubtitle = document.getElementById('reportSubtitle');
const coreConclusionText = document.getElementById('coreConclusionText');
const priorityRecommendationText = document.getElementById('priorityRecommendationText');
const executionTimelineText = document.getElementById('executionTimelineText');
const priorityHighCount = document.getElementById('priorityHighCount');
const priorityMediumCount = document.getElementById('priorityMediumCount');
const priorityHighBar = document.getElementById('priorityHighBar');
const priorityMediumBar = document.getElementById('priorityMediumBar');
const ogsmFlowPath = document.getElementById('ogsmFlowPath');
const issueTemplate = document.getElementById('issueCardTemplate');
const frameworkDescriptionNode = document.getElementById('frameworkDescription');
const setupDetailGrid = document.getElementById('setupDetailGrid');
const setupContext = document.getElementById('setupContext');
const briefTopic = document.querySelector('.brief-topic');
const briefGoal = document.querySelector('.brief-goal');
const caseIndustryText = document.getElementById('caseIndustryText');
const caseDescriptionText = document.getElementById('caseDescriptionText');
const selectionReasonText = document.getElementById('selectionReasonText');
const uploadedItemsList = document.getElementById('uploadedItemsList');
const uploadedCountBadge = document.getElementById('uploadedCountBadge');
const sampleMaterialsSection = document.getElementById('sampleMaterialsSection');
const sampleMaterialsList = document.getElementById('sampleMaterialsList');
const sampleMaterialsBadge = document.getElementById('sampleMaterialsBadge');
const backgroundSummaryText = document.getElementById('backgroundSummaryText');
const observationCard = document.getElementById('observationCard');
const observationList = document.getElementById('observationList');
const parseStatusBadge = document.getElementById('parseStatusBadge');
const parseStatusList = document.getElementById('parseStatusList');
const parseStatusCard = document.querySelector('.parse-status-card');
const summarySelected = document.getElementById('summarySelected');
const summaryHigh = document.getElementById('summaryHigh');
const summaryMedium = document.getElementById('summaryMedium');
const ogsmTableBlock = document.getElementById('ogsmTableBlock');
const painContextIntro = document.getElementById('painContextIntro');
const painContextList = document.getElementById('painContextList');
const generationError = document.getElementById('generationError');
const langButtons = [...document.querySelectorAll('.lang-btn')];

const i18n = {
  zh: {
    documentTitle: 'ConsultAI 演示站',
    htmlLang: 'zh-CN',
    'brand.tagline': '人机协同咨询工作流',
    'header.languageToggle': '语言切换',
    'nav.landing': '首页',
    'nav.setup': '项目设定',
    'nav.upload': '上传材料',
    'nav.pain': '关键问题',
    'nav.results': '分析结果',
    'progress.landing': '首页',
    'progress.setup': '项目设定',
    'progress.upload': '上传材料',
    'progress.pain': '关键问题',
    'progress.results': '分析结果',
    'landing.eyebrow': '产品介绍',
    'landing.title': 'ConsultAI：把复杂业务问题快速整理成清晰可执行的分析',
    'landing.lead': 'ConsultAI 是一个人机协同的咨询工作流工具：由人定义项目边界与判断标准，由 AI 协助整理材料、识别问题、组织结构，并输出可继续打磨的分析初稿。',
    'landing.howItWorks': 'ConsultAI 如何工作',
    'landing.howLead': '人机协同不是替代判断，而是把顾问的工作流变得更快、更稳定，也更容易沉淀为可复用方法。',
    'landing.human.title': '人负责',
    'landing.ai.title': 'AI 负责',
    'landing.feature.1.title': '智能发现',
    'landing.feature.1.body': '模式化模板与 AI 提示，帮助快速定位问题与资料。',
    'landing.feature.2.title': '引导式框架',
    'landing.feature.2.body': '内置咨询框架，帮助形成结构化分析。',
    'landing.feature.3.title': 'AI 协同交付',
    'landing.feature.3.body': '基于人的判断，生成摘要、风险与建议。',
    'landing.human.1': '定义项目背景',
    'landing.human.2': '选择分析框架',
    'landing.human.3': '确认重点问题',
    'landing.human.4': '修正结论表达',
    'landing.ai.1': '总结上传材料',
    'landing.ai.2': '生成问题列表',
    'landing.ai.3': '组织分析结构',
    'landing.ai.4': '输出分析初稿',
    'landing.flow.1': '项目设定',
    'landing.flow.2': '材料整理',
    'landing.flow.3': '问题确认',
    'landing.flow.4': '生成初稿',
    'landing.workflow.title': '流程说明',
    'landing.workflow.1': '定义项目范围',
    'landing.workflow.2': '上传背景材料',
    'landing.workflow.3': '审核 AI 识别的问题',
    'landing.workflow.4': '生成人机协同分析',
    'landing.workflow.5': '输出结构化结果',
    'landing.privacy.title': '隐私与安全',
    'landing.privacy.1': '项目级隔离：每次分析按项目独立处理，避免不同客户材料混用。',
    'landing.privacy.2': '最小化暴露：仅处理当前流程所需内容，默认以样例项目 / 模拟数据演示。',
    'landing.privacy.3': '不用于训练：上传材料仅用于当前分析流程，不作为模型训练数据。',
    'progress.aria': '演示流程进度',
    'step.2': '步骤 2',
    'step.3': '步骤 3',
    'step.4': '步骤 4',
    'step.5': '步骤 5',
    'setup.title': '定义项目边界',
    'setup.label.projectName': '项目名称',
    'setup.label.topic': '公司 / 主题',
    'setup.label.industry': '行业（可选）',
    'setup.label.goal': '分析目标（可选）',
    'setup.label.framework': '分析框架',
    'setup.label.background': '项目背景补充（可选）',
    'setup.placeholder.projectName': '请输入项目名称',
    'setup.placeholder.topic': '请输入公司名称或分析主题',
    'setup.placeholder.industry': '请输入行业或赛道',
    'setup.placeholder.goal': '请输入本次分析希望解决的问题或达成的结果',
    'setup.placeholder.background': '可补充公司当前阶段、行业背景、客户现状或本次案例上下文',
    'setup.frameworkIntro': '框架简介',
    'setup.projectBrief': '项目摘要',
    'setup.caseOverview': '案例概览',
    'setup.frameworkReason': '框架选择理由',
    'setup.subtitle': '让客户输入核心信息或一键载入样例，后续所有步骤都会引用。',
    'setup.brief.topicDefault': '主题：未填写',
    'setup.brief.goalDefault': '目标：未填写',
    'setup.caseIndustryDefault': '行业：未填写',
    'setup.caseDescriptionDefault': '请先填写项目字段，或点击“载入样例项目”。',
    'setup.footerNote': '这些字段将传递给 AI 引擎，也用于生成摘要。',
    'upload.title': '上传项目材料',
    'upload.fileUpload': '文件上传',
    'upload.dropzone': '拖拽文件到这里，或点击选择文件',
    'upload.uploadedItems': '已上传条目',
    'upload.sampleMaterials': '样例材料说明',
    'upload.notes': '人工补充说明',
    'upload.subtitle': '允许文件上传、文本粘贴或直接载入样例数据。',
    'upload.placeholder.notes': '粘贴访谈记录、会议纪要或补充说明。',
    'upload.backgroundSummary': '案例背景摘要',
    'upload.observations': '系统提炼摘要',
    'upload.parseStatus': '解析状态',
    'upload.backgroundPlaceholder': '载入样例项目后，这里将展示案例背景摘要。',
    'upload.footerNote': '所有内容当前暂存于浏览器本地状态，后续可切换为真实 API。',
    'pain.title': 'AI 识别关键问题，顾问确认重点',
    'pain.contextTitle': '问题提炼依据',
    'pain.manualAdd': '手动补充问题',
    'pain.subtitle': '勾选、调整或补充关键问题，并通过优先级排序体现人机协同判断。',
    'pain.contextIntro': '这些问题来自样例材料中的背景摘要、观察纪要与关键问题提炼，可由顾问继续筛选和调整。',
    'pain.summary.selected': '已选择',
    'pain.summary.high': '高优先级',
    'pain.summary.medium': '中优先级',
    'pain.placeholder.title': '问题标题',
    'pain.placeholder.impact': '影响程度（高 / 中 / 低）',
    'pain.placeholder.description': '问题描述',
    'results.title': '输出结构化结果，可替换为真实 API',
    'results.subtitle': '当前演示结果由统一服务层生成，后续接入真实 RAG / LLM 只需替换同一处接口。',
    'results.summary': '执行摘要',
    'results.selectedIssues': '已选问题概览',
    'results.ogsmTable': 'OGSM 结构表',
    'results.findings': '关键发现',
    'results.risks': '风险提示',
    'results.recommendations': '建议动作',
    'results.frameworkNote': '框架说明',
    'results.reportKicker': 'ConsultAI 项目报告',
    'results.meta.project': '客户 / 项目',
    'results.meta.topic': '分析主题',
    'results.meta.framework': '分析框架',
    'results.meta.date': '报告日期',
    'results.conclusion.core': '核心结论',
    'results.conclusion.priority': '建议优先级',
    'results.conclusion.timeline': '建议执行周期',
    'results.priorityChart': '问题优先级分布',
    'results.ogsmFlow': 'OGSM 执行路径图',
    'buttons.script': '演示讲稿',
    'buttons.startDemo': '开始演示',
    'buttons.useSampleProject': '使用样例项目',
    'buttons.loadSampleProject': '载入样例项目',
    'buttons.backHome': '返回首页',
    'buttons.saveContinue': '保存并继续',
    'buttons.loadSampleMaterials': '载入样例材料',
    'buttons.startParsing': '开始解析',
    'buttons.selectAll': '全选',
    'buttons.clear': '清空',
    'buttons.addToList': '加入列表',
    'buttons.generateResults': '生成分析结果',
    'buttons.restart': '重新开始',
    'buttons.exportPdf': '导出 PDF',
    'buttons.saveNotes': '保存备注',
    'buttons.saved': '已保存',
    'buttons.loading': '载入中...',
    'buttons.parsing': '解析中...',
    'buttons.generating': '生成中...',
    'buttons.copied': '已复制',
    'buttons.copyFailed': '复制失败',
    'common.delete': '删除',
    'common.none': '未填写',
    'common.noneShort': '暂无',
    'common.notStarted': '未开始',
    'common.completed': '已完成',
    'common.sampleRequired': '请先选择分析框架，或点击“载入样例项目”。',
    'common.frameworkPlaceholder': '请选择分析框架',
    'common.frameworkDescription': '请选择框架查看简短说明。',
    'common.waitForMaterials': '等待材料上传或载入样例材料。',
    'common.materialsUploaded': '材料已上传，可开始解析。',
    'common.sampleMaterialsLoaded': '样例材料已载入，可开始解析。',
    'common.parsePreparing': '正在准备解析任务…',
    'common.parseReading': '正在读取上传材料…',
    'common.parseIssues': '正在提取关键问题…',
    'common.parseOgsm': '正在生成 OGSM 初步分析…',
    'common.parseDone': '解析完成，已生成关键问题并进入下一步。',
    'common.generatingIssues': '正在生成关键问题...',
    'common.issueCountEmpty': '暂未选择问题',
    'common.issueCountSelected': '已选 {count} 条（将按当前顺序输出）',
    'common.priority': '优先级 #{index}',
    'common.unselected': '未选择',
    'common.sourcePrefix': '来源：',
    'common.evidencePrefix': '证据摘录：',
    'common.aiExtracted': '上传材料 / AI 提取',
    'common.generateError': '生成失败，请重试一次。',
    'common.copiedDefault': '演示讲稿',
    'common.noFiles': '暂无文件',
    'common.noObservations': '暂无观察纪要',
    'common.noBackground': '暂无案例背景。',
    'common.noFrameworkReason': '暂无框架选择理由。',
    'common.noBackgroundSummary': '暂无案例背景摘要。',
    'common.noOgsm': '暂无 OGSM 结构表。',
    'common.ogsmSampleHint': '当前未载入样例项目，OGSM 结构表将在样例模式下展示。',
    'common.materialLoadedSummary': '已载入当前演示流程，解析阶段将沿用同一条问题提炼路径。'
  },
  en: {
    documentTitle: 'ConsultAI Demo',
    htmlLang: 'en',
    'brand.tagline': 'Human + AI Consulting Workflow',
    'header.languageToggle': 'Language toggle',
    'nav.landing': 'Home',
    'nav.setup': 'Setup',
    'nav.upload': 'Materials',
    'nav.pain': 'Key Issues',
    'nav.results': 'Results',
    'progress.landing': 'Home',
    'progress.setup': 'Setup',
    'progress.upload': 'Materials',
    'progress.pain': 'Key Issues',
    'progress.results': 'Results',
    'landing.eyebrow': 'Product Intro',
    'landing.title': 'ConsultAI: Turn Complex Business Problems into Clear, Actionable Analysis',
    'landing.lead': 'ConsultAI is a human + AI consulting workflow tool: people define scope and judgment criteria, while AI helps organize materials, extract issues, structure analysis, and produce a draft output for refinement.',
    'landing.howItWorks': 'How ConsultAI Works',
    'landing.howLead': 'Human + AI does not replace judgment. It makes the consulting workflow faster, more stable, and easier to turn into a reusable method.',
    'landing.human.title': 'Human',
    'landing.ai.title': 'AI',
    'landing.feature.1.title': 'Intelligent Discovery',
    'landing.feature.1.body': 'Template-driven prompts and AI assistance help locate the right issues and materials quickly.',
    'landing.feature.2.title': 'Guided Frameworks',
    'landing.feature.2.body': 'Built-in consulting frameworks help turn raw input into structured analysis.',
    'landing.feature.3.title': 'AI Co-Delivery',
    'landing.feature.3.body': 'Based on human judgment, AI generates summaries, risks, and recommendations.',
    'landing.human.1': 'Define project context',
    'landing.human.2': 'Choose the framework',
    'landing.human.3': 'Confirm issue priorities',
    'landing.human.4': 'Refine conclusion wording',
    'landing.ai.1': 'Summarize uploaded materials',
    'landing.ai.2': 'Generate issue list',
    'landing.ai.3': 'Structure findings',
    'landing.ai.4': 'Produce a draft analysis',
    'landing.flow.1': 'Setup',
    'landing.flow.2': 'Material Review',
    'landing.flow.3': 'Issue Review',
    'landing.flow.4': 'Draft Output',
    'landing.workflow.title': 'Workflow',
    'landing.workflow.1': 'Define project scope',
    'landing.workflow.2': 'Upload background materials',
    'landing.workflow.3': 'Review AI-identified issues',
    'landing.workflow.4': 'Generate human-AI analysis',
    'landing.workflow.5': 'Deliver structured results',
    'landing.privacy.title': 'Privacy & Security',
    'landing.privacy.1': 'Project-level isolation: each analysis run is handled independently to avoid cross-client material mixing.',
    'landing.privacy.2': 'Minimal exposure: only content needed for the current flow is processed, with sample projects / mock data used by default in the demo.',
    'landing.privacy.3': 'No training use: uploaded materials are used only for the current analysis flow and not for model training.',
    'progress.aria': 'Demo workflow progress',
    'step.2': 'Step 2',
    'step.3': 'Step 3',
    'step.4': 'Step 4',
    'step.5': 'Step 5',
    'setup.title': 'Define Project Scope',
    'setup.label.projectName': 'Project Name',
    'setup.label.topic': 'Company / Topic',
    'setup.label.industry': 'Industry (Optional)',
    'setup.label.goal': 'Analysis Goal (Optional)',
    'setup.label.framework': 'Framework',
    'setup.label.background': 'Additional Project Context (Optional)',
    'setup.placeholder.projectName': 'Enter project name',
    'setup.placeholder.topic': 'Enter company name or topic',
    'setup.placeholder.industry': 'Enter industry or sector',
    'setup.placeholder.goal': 'Enter the main problem or desired outcome for this analysis',
    'setup.placeholder.background': 'Add company stage, industry background, current context, or case notes',
    'setup.frameworkIntro': 'Framework Overview',
    'setup.projectBrief': 'Project Brief',
    'setup.caseOverview': 'Case Overview',
    'setup.frameworkReason': 'Why This Framework',
    'setup.subtitle': 'Users can enter the core project information manually or load a sample case, and all later steps reference this setup.',
    'setup.brief.topicDefault': 'Topic: Not filled',
    'setup.brief.goalDefault': 'Goal: Not filled',
    'setup.caseIndustryDefault': 'Industry: Not filled',
    'setup.caseDescriptionDefault': 'Fill in the project fields first, or click "Load Sample Project".',
    'setup.footerNote': 'These fields are passed to the AI layer and also used when generating the summary.',
    'upload.title': 'Upload Project Materials',
    'upload.fileUpload': 'File Upload',
    'upload.dropzone': 'Drag files here, or click to select files',
    'upload.uploadedItems': 'Uploaded Items',
    'upload.sampleMaterials': 'Sample Material Notes',
    'upload.notes': 'Manual Input Notes',
    'upload.subtitle': 'Allows file upload, pasted text, or direct loading of sample materials.',
    'upload.placeholder.notes': 'Paste interview notes, meeting notes, or supplemental context.',
    'upload.backgroundSummary': 'Case Background Summary',
    'upload.observations': 'System Summary',
    'upload.parseStatus': 'Parsing Status',
    'upload.backgroundPlaceholder': 'After loading a sample project, the case background summary will appear here.',
    'upload.footerNote': 'All content is currently stored in browser state and can later be switched to a real API.',
    'pain.title': 'AI-Extracted Issues, Reviewed by the Consultant',
    'pain.contextTitle': 'Issue Traceability',
    'pain.manualAdd': 'Add Manual Issue',
    'pain.subtitle': 'Select, adjust, or add issues, then use priority ordering to reflect human-AI collaboration.',
    'pain.contextIntro': 'These issues come from the sample material background, observation notes, and key-question extraction, and can be further refined by the consultant.',
    'pain.summary.selected': 'Selected',
    'pain.summary.high': 'High Priority',
    'pain.summary.medium': 'Medium Priority',
    'pain.placeholder.title': 'Issue title',
    'pain.placeholder.impact': 'Impact level (High / Medium / Low)',
    'pain.placeholder.description': 'Issue description',
    'results.title': 'Structured Output, Ready for Real API Replacement',
    'results.subtitle': 'The current demo result is generated by a unified service layer. Connecting a real RAG / LLM later only requires replacing one interface.',
    'results.summary': 'Executive Summary',
    'results.selectedIssues': 'Selected Issues Snapshot',
    'results.ogsmTable': 'OGSM Structure Table',
    'results.findings': 'Key Findings',
    'results.risks': 'Risk Alerts',
    'results.recommendations': 'Recommended Actions',
    'results.frameworkNote': 'Framework Note',
    'results.reportKicker': 'ConsultAI Project Report',
    'results.meta.project': 'Client / Project',
    'results.meta.topic': 'Analysis Topic',
    'results.meta.framework': 'Framework',
    'results.meta.date': 'Report Date',
    'results.conclusion.core': 'Core Conclusion',
    'results.conclusion.priority': 'Recommended Priority',
    'results.conclusion.timeline': 'Suggested Timeline',
    'results.priorityChart': 'Issue Priority Distribution',
    'results.ogsmFlow': 'OGSM Execution Path',
    'buttons.script': 'Demo Script',
    'buttons.startDemo': 'Start Demo',
    'buttons.useSampleProject': 'Use Sample Project',
    'buttons.loadSampleProject': 'Load Sample Project',
    'buttons.backHome': 'Back Home',
    'buttons.saveContinue': 'Save & Continue',
    'buttons.loadSampleMaterials': 'Load Sample Materials',
    'buttons.startParsing': 'Start Parsing',
    'buttons.selectAll': 'Select All',
    'buttons.clear': 'Clear',
    'buttons.addToList': 'Add to List',
    'buttons.generateResults': 'Generate Results',
    'buttons.restart': 'Restart',
    'buttons.exportPdf': 'Export PDF',
    'buttons.saveNotes': 'Save Notes',
    'buttons.saved': 'Saved',
    'buttons.loading': 'Loading...',
    'buttons.parsing': 'Parsing...',
    'buttons.generating': 'Generating...',
    'buttons.copied': 'Copied',
    'buttons.copyFailed': 'Copy Failed',
    'common.delete': 'Delete',
    'common.none': 'Not filled',
    'common.noneShort': 'None',
    'common.notStarted': 'Not Started',
    'common.completed': 'Completed',
    'common.sampleRequired': 'Select a framework first, or click "Load Sample Project".',
    'common.frameworkPlaceholder': 'Select a framework',
    'common.frameworkDescription': 'Select a framework to view a short description.',
    'common.waitForMaterials': 'Waiting for file upload or sample materials.',
    'common.materialsUploaded': 'Materials uploaded. Ready to parse.',
    'common.sampleMaterialsLoaded': 'Sample materials loaded. Ready to parse.',
    'common.parsePreparing': 'Preparing parsing task...',
    'common.parseReading': 'Reading uploaded materials...',
    'common.parseIssues': 'Extracting key issues...',
    'common.parseOgsm': 'Generating initial OGSM analysis...',
    'common.parseDone': 'Parsing complete. Key issues generated and moved to next step.',
    'common.generatingIssues': 'Generating key issues...',
    'common.issueCountEmpty': 'No issues selected yet',
    'common.issueCountSelected': '{count} selected (output follows current order)',
    'common.priority': 'Priority #{index}',
    'common.unselected': 'Not selected',
    'common.sourcePrefix': 'Source: ',
    'common.evidencePrefix': 'Evidence: ',
    'common.aiExtracted': 'Uploaded materials / AI extraction',
    'common.generateError': 'Generation failed. Please try again.',
    'common.copiedDefault': 'Demo Script',
    'common.noFiles': 'No files',
    'common.noObservations': 'No observation notes',
    'common.noBackground': 'No case background available.',
    'common.noFrameworkReason': 'No framework rationale yet.',
    'common.noBackgroundSummary': 'No background summary available.',
    'common.noOgsm': 'No OGSM table available.',
    'common.ogsmSampleHint': 'No sample project loaded. The OGSM table is shown in sample mode.',
    'common.materialLoadedSummary': 'Loaded into the current demo workflow. The same issue-extraction path will be used during parsing.'
  }
};

const impactCopy = {
  zh: {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
    custom: '自定义'
  },
  en: {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
    custom: 'Custom'
  }
};

const formatImpact = (impact = '') =>
  impactCopy[state.language]?.[impact.toLowerCase()] ||
  impactCopy.zh[impact.toLowerCase()] ||
  impact ||
  (state.language === 'en' ? 'Pending' : '待评估');
const isSampleMode = () => state.sampleProjectLoaded || state.sampleDocsLoaded;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setGenerationError = (message = '') => {
  if (!generationError) return;
  generationError.hidden = !message;
  generationError.textContent = message;
};

const t = (key, vars = {}) => {
  const messages = i18n[state.language] || i18n.zh;
  const fallback = i18n.zh[key] || key;
  const template = messages[key] || fallback;
  return Object.entries(vars).reduce(
    (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
    template
  );
};

const applyLanguage = () => {
  const messages = i18n[state.language] || i18n.zh;
  document.documentElement.lang = messages.htmlLang;
  document.title = messages.documentTitle;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    node.setAttribute('title', t(node.dataset.i18nTitle));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel));
  });
  if (frameworkSelect?.options?.length && frameworkSelect.options[0].value === '') {
    frameworkSelect.options[0].textContent = t('common.frameworkPlaceholder');
  }
  langButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === state.language);
  });
  updateFrameworkDescription();
  updateProjectBrief();
  renderParseStatus();
  renderCaseContext();
  if (state.issues.length) renderIssues();
  if (state.analysis) renderResults();
};

const setLanguage = (lang) => {
  if (!i18n[lang]) return;
  state.language = lang;
  applyLanguage();
};

const buildResultFindings = (issues = [], project = {}) => {
  const titles = issues.map((issue) => issue.title || '');
  const findings = [];

  if (titles.some((title) => /growth|subscription|revenue|channel/i.test(title))) {
    findings.push(
      state.language === 'en'
        ? `${project.topic || 'The current project'} has a clear growth ambition, but the path from channel activation to recognized revenue is still not translated into an executable operating cadence.`
        : `${project.topic || '当前项目'}的核心矛盾不在目标缺失，而在增长目标尚未被拆解为季度节奏、渠道动作与收入兑现路径。`
    );
  }
  if (titles.some((title) => /delivery|process|talent|ramp|role/i.test(title))) {
    findings.push(
      state.language === 'en'
        ? 'Delivery process, cross-functional coordination, and talent ramp-up are not yet stable enough to support the targeted scale-up.'
        : '交付流程、协作机制与人才培养节奏未形成稳定支撑，组织能力与业务扩张目标之间存在明显缺口。'
    );
  }
  if (titles.some((title) => /incentive|performance|compensation|outcome/i.test(title))) {
    findings.push(
      state.language === 'en'
        ? 'Incentive and performance mechanisms are not sufficiently tied to business outcomes, weakening sustained alignment around growth and delivery quality.'
        : '激励和绩效机制没有与关键经营结果形成闭环，导致团队行为难以持续围绕订阅增长与交付质量对齐。'
    );
  }
  if (!findings.length) {
    findings.push(
      state.language === 'en'
        ? 'The selected issues indicate that the main challenges concentrate on target decomposition, execution coordination, and results tracking.'
        : '已选问题显示，当前项目的主要挑战集中在目标拆解、执行协同与结果跟踪三个层面。'
    );
  }

  return findings.slice(0, 3);
};

const getFrameworkExplanation = (project = {}, fallback = '') => {
  if (project.framework === 'ogsm') {
    return [
      state.language === 'en'
        ? 'OGSM is used here because the project already has a clear growth direction. The main task is not to redefine strategy, but to turn the target into executable actions, metrics, and ownership.'
        : '本案例采用 OGSM，是因为项目已经具备明确增长目标，关键不是重新定义方向，而是把目标拆解为可执行策略、衡量指标与责任动作。',
      state.language === 'en'
        ? 'On this result page, OGSM provides the structure that links objectives, strategy, and measures, so the reviewed issues can move directly into execution planning.'
        : '在这个结果页中，OGSM 用来把“目标—策略—衡量”串成同一结构，确保前面确认的关键问题能够落到后续的执行方案。'
    ];
  }
  return [fallback || (state.language === 'en'
    ? 'The selected framework is used to convert reviewed issues into a structured analysis and next-step action recommendations.'
    : '当前所选框架用于把关键问题整理为结构化分析，并支持后续行动建议输出。')];
};

const formatReportDate = () => {
  const locale = state.language === 'en' ? 'en-US' : 'zh-CN';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date());
};

const buildReportHeaderCopy = (project = {}, frameworkMeta) => {
  const isEn = state.language === 'en';
  const frameworkName = frameworkMeta?.name || project.framework || 'OGSM';
  const reportFrameworkName = /ogsm/i.test(frameworkName) ? 'OGSM' : frameworkName;
  const projectName = project.projectName || '';

  if (isEn) {
    return {
      label: 'ConsultAI Project Report',
      title: `${projectName || 'Project'} ${reportFrameworkName} Analysis Report`,
      subtitle:
        frameworkName.toLowerCase().includes('ogsm')
          ? 'Structured diagnosis of growth targets, channel development, delivery capability, and incentive design based on OGSM strategic decoding.'
          : 'Structured diagnosis of the current business context, priority issues, and execution implications.'
    };
  }

  return {
    label: 'ConsultAI 项目报告',
    title: `${projectName || '项目'} ${reportFrameworkName} 分析报告`,
    subtitle:
      frameworkName.includes('OGSM')
        ? '基于 OGSM 战略解码，对增长目标、渠道建设、交付能力与激励机制进行结构化诊断。'
        : '围绕当前业务问题、关键风险与执行建议进行结构化诊断。'
  };
};

const buildResultHighlights = (selectedIssues = []) => {
  const high = selectedIssues.filter((issue) => (issue.impact || '').toLowerCase() === 'high').length;
  const medium = selectedIssues.filter((issue) => (issue.impact || '').toLowerCase() === 'medium').length;
  const coreConclusion = selectedIssues[0]?.title ||
    (state.language === 'en' ? 'No issue selected yet' : '当前尚未生成核心结论');
  const priorityText = state.language === 'en'
    ? `Address ${high > 0 ? 'high-priority' : 'selected'} issues first, then follow with medium-priority enablers.`
    : `优先处理${high > 0 ? '高优先级问题' : '已选问题'}，再推进中优先级支撑项。`;
  const timelineText = state.language === 'en'
    ? '30-60-90 day execution rhythm'
    : '30-60-90 天执行节奏';
  return { high, medium, coreConclusion, priorityText, timelineText };
};

const getSetupFormState = () => ({
  projectName: setupForm.projectName.value.trim(),
  topic: setupForm.topic.value.trim(),
  industry: setupForm.industry.value.trim(),
  goal: setupForm.goal.value.trim(),
  framework: frameworkSelect.value,
  backgroundContext: setupForm.backgroundContext.value.trim()
});

const hasSetupInput = () => {
  const values = getSetupFormState();
  return Boolean(values.projectName || values.topic || values.industry || values.goal || values.framework);
};

const updateProgress = () => {
  progressSteps.forEach((step) => {
    const isActive = step.dataset.step === currentStep;
    step.classList.toggle('active', isActive);
  });
};

const setStep = (stepId) => {
  if (!sectionMap[stepId]) return;
  currentStep = stepId;
  sections.forEach((section) => {
    section.hidden = section.dataset.section !== stepId;
  });
  updateProgress();
};

const populateFrameworks = async () => {
  const frameworks = await DemoAPI.fetchFrameworks();
  state.frameworks = frameworks;
  frameworkSelect.innerHTML = '';

  const addPlaceholder = (select) => {
    if (!select) return;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = t('common.frameworkPlaceholder');
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
  };

  addPlaceholder(frameworkSelect);

  frameworks.forEach((fw) => {
    const option = document.createElement('option');
    option.value = fw.id;
    option.textContent = fw.name;
    option.dataset.description = fw.description;
    frameworkSelect.appendChild(option);
  });
  frameworkSelect.value = '';
  updateFrameworkDescription();
};

const updateFrameworkDescription = () => {
  const currentId = frameworkSelect.value;
  const meta = state.frameworks.find((fw) => fw.id === currentId);
  if (frameworkDescriptionNode) {
    frameworkDescriptionNode.textContent = meta?.description || t('common.frameworkDescription');
  }
};

const updateProjectBrief = () => {
  if (!briefTopic || !briefGoal) return;
  const topic = setupForm.topic.value || t('common.none');
  const goal = setupForm.goal.value || t('common.none');
  briefTopic.textContent = `${state.language === 'en' ? 'Topic' : '主题'}：${topic}`;
  briefGoal.textContent = `${state.language === 'en' ? 'Goal' : '目标'}：${goal}`;
};

const renderSampleMaterials = () => {
  if (!sampleMaterialsList || !sampleMaterialsBadge) return;
  const hasMaterials = state.uploads.length > 0;
  if (sampleMaterialsSection) sampleMaterialsSection.hidden = !hasMaterials;
  if (!hasMaterials) {
    sampleMaterialsBadge.textContent = '0';
    sampleMaterialsList.innerHTML = '';
    return;
  }
  const materials = state.uploads;
  sampleMaterialsBadge.textContent = String(materials.length);
  sampleMaterialsList.innerHTML = '';
  if (!materials.length) {
    return;
  }
  materials.forEach((material) => {
    const card = document.createElement('article');
    card.className = 'sample-material-card';
    const role = document.createElement('span');
    role.className = 'sample-material-meta';
    role.textContent = material.role || material.type || (state.language === 'en' ? 'User Uploaded Material' : '用户上传材料');
    const title = document.createElement('h5');
    title.textContent = material.name;
    const summary = document.createElement('p');
    summary.textContent =
      material.summary || t('common.materialLoadedSummary');
    card.appendChild(role);
    card.appendChild(title);
    card.appendChild(summary);
    sampleMaterialsList.appendChild(card);
  });
};

const renderParseStatus = () => {
  if (!parseStatusBadge || !parseStatusList) return;
  parseStatusBadge.textContent = state.parsing.running
    ? t('buttons.parsing')
    : state.parsing.completed
      ? t('common.completed')
      : t('common.notStarted');
  if (parseStatusCard) {
    parseStatusCard.classList.toggle('is-running', state.parsing.running);
    parseStatusCard.classList.toggle('is-complete', state.parsing.completed && !state.parsing.running);
  }
  parseStatusList.innerHTML = '';
  state.parsing.logs.forEach((log) => {
    const li = document.createElement('li');
    li.textContent = log;
    parseStatusList.appendChild(li);
  });
};

const renderCaseContext = () => {
  const values = getSetupFormState();
  const metadata = state.caseData?.project?.metadata || {};
  const brief = state.caseData?.project?.brief || {};
  const materials = state.caseData?.materials || {};
  const hasInput = hasSetupInput();
  const hasMaterialsLoaded = state.uploads.length > 0;
  const selectedFramework = state.frameworks.find((item) => item.id === values.framework);
  const samplePainPoints = state.language === 'en'
    ? [
        'Project goal: subscription-service growth and recognized-revenue targets',
        'Observation notes: delivery delays, non-standard processes, slow talent ramp-up',
        'Organization diagnosis: incentives are not effectively linked to performance outcomes'
      ]
    : [
        '项目目标：订阅服务增长与确认收入目标',
        '观察纪要：交付延期、流程不标准、人才培养慢',
        '组织诊断：激励机制与绩效结果未有效挂钩'
      ];

  if (setupDetailGrid) setupDetailGrid.hidden = !hasInput;
  if (setupContext) setupContext.hidden = !hasInput;

  if (!hasInput) {
    if (caseIndustryText) caseIndustryText.textContent = `${state.language === 'en' ? 'Industry' : '行业'}：${t('common.none')}`;
    if (caseDescriptionText) {
      caseDescriptionText.textContent = state.language === 'en'
        ? 'Fill in the project fields first, or click "Load Sample Project".'
        : '请先填写项目字段，或点击“载入样例项目”。';
    }
    if (selectionReasonText) {
      selectionReasonText.textContent = t('common.sampleRequired');
    }
    if (backgroundSummaryText) {
      backgroundSummaryText.textContent = state.language === 'en'
        ? 'No sample background loaded yet. You can also upload real materials on this page.'
        : '当前尚未载入样例背景，你也可以在此页面上传真实材料。';
    }
    if (observationCard) observationCard.hidden = true;
    if (observationList) {
      observationList.innerHTML = '';
    }
    if (painContextList) {
      painContextList.innerHTML = '';
      const empty = document.createElement('li');
      empty.textContent = state.language === 'en'
        ? 'Issue traceability appears here after material parsing is completed.'
        : '完成材料解析后，这里会展示问题提炼依据。';
      painContextList.appendChild(empty);
    }
    if (painContextIntro) {
      painContextIntro.textContent =
        state.language === 'en'
          ? 'This panel shows the rationale AI extracts from the background summary, observation notes, and organization diagnosis.'
          : '这里会展示 AI 从背景摘要、观察纪要与组织诊断中提炼出的判断依据。';
    }
    updateFrameworkDescription();
    updateProjectBrief();
    return;
  }

  if (caseIndustryText) {
    caseIndustryText.textContent =
      values.industry
        ? `${state.language === 'en' ? 'Industry' : '行业'}：${values.industry}`
        : state.setupSource === 'sample' && metadata.industry
          ? `${state.language === 'en' ? 'Industry' : '行业'}：${metadata.industry}`
          : `${state.language === 'en' ? 'Industry' : '行业'}：${state.language === 'en' ? 'To be added' : '待补充'}`;
  }
  if (caseDescriptionText) {
    caseDescriptionText.textContent =
      state.setupSource === 'sample'
        ? values.backgroundContext || metadata.companyDescription || brief.caseDescription || t('common.noBackground')
        : `${values.topic || (state.language === 'en' ? 'Current topic' : '当前主题')} ${state.language === 'en' ? 'project definition has started to take shape.' : '的项目定义已开始整理。'}${
            values.backgroundContext
              ? values.backgroundContext
              : values.goal
                ? `${state.language === 'en' ? 'Key objective for this analysis: ' : '本次希望重点解决：'}${values.goal}`
                : state.language === 'en' ? 'Please continue to refine the analysis goal.' : '请继续补充分析目标。'
          }`;
  }
  if (selectionReasonText) {
    selectionReasonText.textContent =
      state.setupSource === 'sample'
        ? brief.selectionReason || t('common.noFrameworkReason')
        : selectedFramework
          ? (state.language === 'en'
            ? `Selected ${selectedFramework.name}. ${selectedFramework.description}`
            : `已选择 ${selectedFramework.name}。${selectedFramework.description}`)
          : (state.language === 'en'
            ? 'Select a framework first to generate the corresponding analysis logic.'
            : '请先选择分析框架，以生成对应的分析逻辑。');
  }
  if (backgroundSummaryText) {
    backgroundSummaryText.textContent =
      (state.sampleProjectLoaded || state.sampleDocsLoaded)
        ? materials.backgroundSummary || t('common.noBackgroundSummary')
        : values.backgroundContext || (state.language === 'en'
          ? 'No sample background loaded yet. You can also upload real materials on this page.'
          : '当前尚未载入样例背景，你也可以在此页面上传真实材料。');
  }
  if (observationCard) observationCard.hidden = !hasMaterialsLoaded;
  if (observationList) {
    observationList.innerHTML = '';
    const bullets = hasMaterialsLoaded
      ? materials.observationBullets || []
      : [];
    if (!bullets.length) {
      if (hasMaterialsLoaded) {
        const empty = document.createElement('li');
        empty.textContent = t('common.noObservations');
        observationList.appendChild(empty);
      }
    } else {
      bullets.forEach((bullet) => {
        const li = document.createElement('li');
        li.textContent = bullet;
        observationList.appendChild(li);
      });
    }
  }
  if (painContextList) {
    painContextList.innerHTML = '';
    const items = state.sampleProjectLoaded ? samplePainPoints : [];
    if (!items.length) {
      const empty = document.createElement('li');
      empty.textContent = state.language === 'en'
        ? 'Issue traceability appears here after material parsing is completed.'
        : '完成材料解析后，这里会展示问题提炼依据。';
      painContextList.appendChild(empty);
    } else {
      items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        painContextList.appendChild(li);
      });
    }
  }
  if (painContextIntro) {
    painContextIntro.textContent = state.sampleProjectLoaded && brief.coreProblem
      ? (state.language === 'en'
        ? `Issue review is centered on "${brief.coreProblem}", with final prioritization confirmed by the consultant.`
        : `当前问题审核以“${brief.coreProblem}”为主线，由顾问确认最终优先级。`)
      : (state.language === 'en'
        ? 'These issues are generated from your selected framework and uploaded materials, then refined by the consultant.'
        : '这些问题会根据你选择的框架与上传材料自动生成，可由顾问继续筛选和调整。');
  }
  updateFrameworkDescription();
  updateProjectBrief();
};

const loadSampleProject = async () => {
  loadSampleProjectBtn.disabled = true;
  loadSampleProjectBtn.textContent = t('buttons.loading');
  const data = await DemoAPI.fetchSampleProject();
  loadSampleProjectBtn.disabled = false;
  loadSampleProjectBtn.textContent = t('buttons.loadSampleProject');
  state.setupSource = 'sample';
  state.sampleProjectLoaded = true;
  setupForm.projectName.value = data.projectName;
  setupForm.topic.value = data.topic;
  setupForm.industry.value = state.caseData?.project?.metadata?.industry || '';
  setupForm.goal.value = data.goal;
  frameworkSelect.value = data.framework;
  setupForm.backgroundContext.value =
    state.caseData?.project?.metadata?.companyDescription ||
    state.caseData?.project?.brief?.caseDescription ||
    '';
  renderCaseContext();
};

const loadSampleProjectFromLanding = async () => {
  await loadSampleProject();
  setStep('setup');
};

const handleSetupFieldChange = () => {
  if (!hasSetupInput()) {
    state.setupSource = 'blank';
    state.sampleProjectLoaded = false;
  } else {
    state.setupSource = 'manual';
    state.sampleProjectLoaded = false;
  }
  renderCaseContext();
};

const updateNextButtonState = () => {
  const hasData = state.uploads.length > 0 || Boolean(state.notes);
  toPainBtn.disabled = !hasData || state.parsing.running;
};

const renderFiles = () => {
  fileList.innerHTML = '';
  state.uploads.forEach((file, index) => {
    const li = document.createElement('li');
    const meta = document.createElement('span');
    meta.textContent = file.name;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = t('common.delete');
    removeBtn.className = 'ghost-btn';
    removeBtn.addEventListener('click', () => {
      state.uploads.splice(index, 1);
      renderFiles();
      updateNextButtonState();
    });
    li.appendChild(meta);
    li.appendChild(removeBtn);
    fileList.appendChild(li);
  });
  if (state.uploads.length === 0) {
    state.sampleDocsLoaded = false;
    state.parsing.completed = false;
    state.parsing.logs = [t('common.waitForMaterials')];
    renderParseStatus();
  }
  renderUploadedItems();
  renderSampleMaterials();
  renderCaseContext();
};

const trackFiles = (event) => {
  const files = [...event.target.files];
  files.forEach((file) => {
    state.uploads.push({ name: file.name, size: file.size });
  });
  state.parsing.completed = false;
  state.parsing.logs = [t('common.materialsUploaded')];
  renderFiles();
  renderParseStatus();
  updateNextButtonState();
  event.target.value = '';
};

const loadSampleDocs = async () => {
  useSampleDocsBtn.disabled = true;
  useSampleDocsBtn.textContent = t('buttons.loading');
  state.sampleDocsLoaded = true;
  const existingNames = new Set(state.uploads.map((item) => item.name));
  const materials = state.caseData?.materials?.sampleDocuments || [];
  if (materials.length) {
    materials.forEach((doc) =>
      {
        if (existingNames.has(doc.name)) return;
        state.uploads.push({
          name: doc.name,
          role: doc.role,
          summary: doc.summary,
          type: doc.type
        });
      }
    );
  } else {
    const docs = await DemoAPI.fetchSampleDocs();
    docs.forEach((doc) => {
      if (existingNames.has(doc)) return;
      state.uploads.push({ name: doc });
    });
  }
  state.parsing.completed = false;
  state.parsing.logs = [t('common.sampleMaterialsLoaded')];
  renderFiles();
  renderParseStatus();
  renderCaseContext();
  useSampleDocsBtn.disabled = false;
  useSampleDocsBtn.textContent = t('buttons.loadSampleMaterials');
  updateNextButtonState();
};

const renderUploadedItems = () => {
  if (!uploadedItemsList || !uploadedCountBadge) return;
  uploadedItemsList.innerHTML = '';
  const files = state.uploads.slice(0, 3);
  uploadedCountBadge.textContent = state.uploads.length;
  if (!files.length) {
    const empty = document.createElement('li');
    empty.textContent = t('common.noFiles');
    uploadedItemsList.appendChild(empty);
    return;
  }
  files.forEach((file, index) => {
    const li = document.createElement('li');
    li.textContent = file.role
      ? `${index + 1}. ${file.name} · ${file.role}`
      : `${index + 1}. ${file.name}`;
    uploadedItemsList.appendChild(li);
  });
};

const saveNotes = (event) => {
  event.preventDefault();
  state.notes = notesInput.value.trim();
  saveNotesBtn.textContent = t('buttons.saved');
  setTimeout(() => (saveNotesBtn.textContent = t('buttons.saveNotes')), 1200);
  updateNextButtonState();
};

const handleSetupSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(setupForm);
  state.project = Object.fromEntries(formData.entries());
  if (state.uploads.length === 0) {
    state.parsing.running = false;
    state.parsing.completed = false;
    state.parsing.logs = [t('common.waitForMaterials')];
  }
  setStep('upload');
  renderParseStatus();
  renderCaseContext();
};

const getIssueSourceForCurrentContext = async () => {
  const frameworkId = state.project?.framework || frameworkSelect.value;
  if (frameworkId === 'ogsm' && state.uploads.length > 0 && state.caseData?.keyQuestions?.length) {
    return state.caseData.keyQuestions.map((item) => ({
      id: item.id,
      title: item.title,
      impact: item.impact,
      description: item.description || item.question,
      question: item.question,
      source: item.source,
      evidence: item.evidence
    }));
  }
  return DemoAPI.fetchIssues(frameworkId);
};

const enterPainPointStep = async () => {
  setStep('pain');
  issuesGrid.innerHTML = `<p class="help-text">${t('common.generatingIssues')}</p>`;
  const issues = await getIssueSourceForCurrentContext();
  state.issues = issues;
  state.selectedIssueIds = issues.slice(0, 3).map((issue) => issue.id);
  renderIssues();
};

const startParsing = async () => {
  const hasData = state.uploads.length > 0 || Boolean(state.notes);
  if (!hasData || state.parsing.running) return;
  state.parsing.running = true;
  state.parsing.completed = false;
  state.parsing.logs = [t('common.parsePreparing')];
  toPainBtn.disabled = true;
  toPainBtn.textContent = t('buttons.parsing');
  renderParseStatus();

  const stages = [
    t('common.parseReading'),
    t('common.parseIssues'),
    t('common.parseOgsm')
  ];
  const stageDuration = 2800;

  for (const stage of stages) {
    state.parsing.logs = [stage];
    renderParseStatus();
    await wait(stageDuration);
  }

  const issues = await getIssueSourceForCurrentContext();
  state.issues = issues;
  state.selectedIssueIds = issues.slice(0, 3).map((issue) => issue.id);
  state.parsing.running = false;
  state.parsing.completed = true;
  state.parsing.logs = [t('common.parseDone')];
  renderParseStatus();
  toPainBtn.textContent = t('buttons.startParsing');
  updateNextButtonState();
  setStep('pain');
  renderIssues();
};

const renderIssues = () => {
  issuesGrid.innerHTML = '';
  state.issues.forEach((issue) => {
    const node = issueTemplate.content.cloneNode(true);
    const card = node.querySelector('.issue-card');
    card.querySelector('h4').textContent = issue.title;
    card.querySelector('.impact-tag').textContent = formatImpact(issue.impact);
    card.querySelector('.description').textContent = issue.description;
    const sourceNode = card.querySelector('.issue-source');
    const evidenceNode = card.querySelector('.issue-evidence');
    if (sourceNode) {
      sourceNode.textContent = `${t('common.sourcePrefix')}${issue.source || t('common.aiExtracted')}`;
    }
    if (evidenceNode) {
      evidenceNode.textContent = `${t('common.evidencePrefix')}${issue.evidence || issue.question || issue.description}`;
    }
    const checkbox = card.querySelector('input[type="checkbox"]');
    const priorityBadge = card.querySelector('.priority-badge');
    const upBtn = card.querySelector('[data-move="up"]');
    const downBtn = card.querySelector('[data-move="down"]');
    const priorityIndex = state.selectedIssueIds.indexOf(issue.id);
    checkbox.checked = priorityIndex !== -1;
    checkbox.addEventListener('change', () => toggleIssue(issue.id));
    if (priorityIndex !== -1) {
      card.classList.add('selected');
      priorityBadge.textContent = t('common.priority', { index: priorityIndex + 1 });
      upBtn.disabled = priorityIndex === 0;
      downBtn.disabled = priorityIndex === state.selectedIssueIds.length - 1;
      upBtn.addEventListener('click', () => reorderIssue(issue.id, -1));
      downBtn.addEventListener('click', () => reorderIssue(issue.id, 1));
    } else {
      card.classList.remove('selected');
      priorityBadge.textContent = t('common.unselected');
      upBtn.disabled = true;
      downBtn.disabled = true;
    }
    issuesGrid.appendChild(card);
  });
  updateIssueState();
};

const toggleIssue = (issueId) => {
  if (state.selectedIssueIds.includes(issueId)) {
    state.selectedIssueIds = state.selectedIssueIds.filter((id) => id !== issueId);
  } else {
    state.selectedIssueIds.push(issueId);
  }
  renderIssues();
};

const reorderIssue = (issueId, delta) => {
  const index = state.selectedIssueIds.indexOf(issueId);
  if (index === -1) return;
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= state.selectedIssueIds.length) return;
  const next = [...state.selectedIssueIds];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  state.selectedIssueIds = next;
  renderIssues();
};

const updateIssueState = () => {
  const count = state.selectedIssueIds.length;
  issueCount.textContent =
    count > 0 ? t('common.issueCountSelected', { count }) : t('common.issueCountEmpty');
  generateAnalysisBtn.disabled = count === 0;
  if (count === 0) {
    setGenerationError('');
  }
  if (summarySelected) summarySelected.textContent = String(count);
  if (summaryHigh || summaryMedium) {
    let high = 0;
    let medium = 0;
    state.selectedIssueIds.forEach((id) => {
      const issue = state.issues.find((item) => item.id === id);
      if (!issue) return;
      if ((issue.impact || '').toLowerCase() === 'high') high += 1;
      if ((issue.impact || '').toLowerCase() === 'medium') medium += 1;
    });
    if (summaryHigh) summaryHigh.textContent = String(high);
    if (summaryMedium) summaryMedium.textContent = String(medium);
  }
};

const selectAllIssues = () => {
  state.selectedIssueIds = state.issues.map((issue) => issue.id);
  renderIssues();
};

const clearIssues = () => {
  state.selectedIssueIds = [];
  renderIssues();
};

const addManualIssue = (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(manualIssueForm).entries());
  const issue = {
    id: `manual-${Date.now()}`,
    title: data.title,
    impact: data.impact || 'custom',
    description: data.description
  };
  state.issues.unshift(issue);
  state.selectedIssueIds.unshift(issue.id);
  manualIssueForm.reset();
  renderIssues();
};

const generateAnalysis = async () => {
  if (state.selectedIssueIds.length === 0) {
    generateAnalysisBtn.disabled = true;
    return;
  }
  setGenerationError('');
  generateAnalysisBtn.disabled = true;
  generateAnalysisBtn.textContent = t('buttons.generating');
  try {
    const selectedIssues = state.selectedIssueIds
      .map((id) => state.issues.find((issue) => issue.id === id))
      .filter(Boolean);
    const payload = {
      project: state.project,
      issues: selectedIssues,
      notes: state.notes,
      sampleMode: isSampleMode()
    };
    await wait(1200);
    const analysis = await DemoAPI.generateAnalysis(payload);
    const selectedIssuesSnapshot = selectedIssues.map((issue, index) =>
      `#${index + 1} ${issue.title}`
    );
    state.analysis = {
      ...analysis,
      selectedIssues,
      selectedIssuesSnapshot,
      issuesSnapshot: selectedIssuesSnapshot
    };
    setStep('results');
    renderResults();
  } catch (error) {
    console.error('Generate analysis failed', error);
    setGenerationError(t('common.generateError'));
  } finally {
    generateAnalysisBtn.textContent = t('buttons.generateResults');
    updateIssueState();
  }
};

const renderResults = () => {
  const data = state.analysis;
  if (!data) return;
  const selectedIssues = data.selectedIssues || [];
  const findings = buildResultFindings(selectedIssues, state.project || {});
  const frameworkParagraphs = getFrameworkExplanation(
    state.project || {},
    data.frameworkDetails?.description || ''
  );
  const reportHighlights = buildResultHighlights(selectedIssues);
  const frameworkMeta = state.frameworks.find((item) => item.id === state.project?.framework);
  const reportHeaderCopy = buildReportHeaderCopy(state.project || {}, frameworkMeta);
  const mountList = (target, items) => {
    target.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      target.appendChild(li);
    });
  };
  mountList(summaryList, data.summary);
  if (data.noteBlock?.length) {
    data.noteBlock.forEach((note) => {
      const li = document.createElement('li');
      li.textContent = `备注：${note}`;
      summaryList.appendChild(li);
    });
  }
  mountList(findingsList, findings);
  if (issuesSnapshot) {
    mountList(issuesSnapshot, data.selectedIssuesSnapshot || data.issuesSnapshot || []);
  }
  if (reportProjectName) {
    reportProjectName.textContent = state.project?.projectName || (state.language === 'en' ? 'Sample Project' : '样例项目');
  }
  if (reportTopic) {
    reportTopic.textContent = state.project?.topic || (state.language === 'en' ? 'Not provided' : '未填写');
  }
  if (reportFramework) {
    reportFramework.textContent = frameworkMeta?.name || state.project?.framework || '-';
  }
  if (reportDate) {
    reportDate.textContent = formatReportDate();
  }
  if (reportLabel) {
    reportLabel.textContent = reportHeaderCopy.label;
  }
  if (reportMainTitle) {
    reportMainTitle.textContent = reportHeaderCopy.title;
  }
  if (reportSubtitle) {
    reportSubtitle.textContent = reportHeaderCopy.subtitle;
  }
  if (coreConclusionText) {
    coreConclusionText.textContent = reportHighlights.coreConclusion;
  }
  if (priorityRecommendationText) {
    priorityRecommendationText.textContent = reportHighlights.priorityText;
  }
  if (executionTimelineText) {
    executionTimelineText.textContent = reportHighlights.timelineText;
  }
  if (priorityHighCount) {
    priorityHighCount.textContent = String(reportHighlights.high);
  }
  if (priorityMediumCount) {
    priorityMediumCount.textContent = String(reportHighlights.medium);
  }
  const totalPriority = Math.max(reportHighlights.high + reportHighlights.medium, 1);
  if (priorityHighBar) {
    priorityHighBar.style.width = `${(reportHighlights.high / totalPriority) * 100}%`;
  }
  if (priorityMediumBar) {
    priorityMediumBar.style.width = `${(reportHighlights.medium / totalPriority) * 100}%`;
  }
  if (ogsmFlowPath) {
    ogsmFlowPath.innerHTML = '';
    const flowSteps = state.language === 'en'
      ? ['Objective', 'Goal', 'Strategy', 'Measure']
      : ['Objective', 'Goal', 'Strategy', 'Measure'];
    flowSteps.forEach((step) => {
      const node = document.createElement('div');
      node.className = 'ogsm-flow-step';
      node.textContent = step;
      ogsmFlowPath.appendChild(node);
    });
  }
  frameworkBlock.innerHTML = '';
  frameworkParagraphs.forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    frameworkBlock.appendChild(p);
  });

  risksList.innerHTML = '';
  data.risks.forEach((risk) => {
    const li = document.createElement('li');
    li.textContent = risk.title;
    const badge = document.createElement('span');
    badge.textContent = risk.copy;
    badge.className = risk.badge;
    li.appendChild(badge);
    risksList.appendChild(li);
  });

  recommendationsList.innerHTML = '';
  data.recommendations.forEach((rec) => {
    const li = document.createElement('li');
    li.textContent = rec;
    recommendationsList.appendChild(li);
  });

  if (ogsmTableBlock) {
    ogsmTableBlock.innerHTML = '';
    const rows = isSampleMode() ? state.caseData?.ogsmTable || [] : [];
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'help-text';
      empty.textContent = isSampleMode()
        ? t('common.noOgsm')
        : t('common.ogsmSampleHint');
      ogsmTableBlock.appendChild(empty);
    } else {
      rows.forEach((row) => {
        const wrapper = document.createElement('article');
        wrapper.className = 'ogsm-row';
        const createCell = (label, title, items) => {
          const cell = document.createElement('div');
          cell.className = 'ogsm-cell';
          const small = document.createElement('p');
          small.className = 'ogsm-cell-label';
          small.textContent = label;
          const strong = document.createElement('strong');
          strong.textContent = title;
          cell.appendChild(small);
          cell.appendChild(strong);
          if (items?.length) {
            const list = document.createElement('ul');
            items.forEach((item) => {
              const li = document.createElement('li');
              li.textContent = item;
              list.appendChild(li);
            });
            cell.appendChild(list);
          }
          return cell;
        };
        wrapper.appendChild(createCell(state.language === 'en' ? 'Objective' : '目的（Objective）', row.objective));
        wrapper.appendChild(createCell(state.language === 'en' ? 'Goal' : '目标（Goal）', state.language === 'en' ? 'Goal Breakdown' : '目标拆解', row.goals));
        wrapper.appendChild(createCell(state.language === 'en' ? 'Strategy' : '策略（Strategy）', state.language === 'en' ? 'Strategic Actions' : '策略动作', row.strategies));
        const measureCell = createCell(state.language === 'en' ? 'Measure' : '衡量（Measure）', state.language === 'en' ? 'Metrics' : '衡量指标', row.measures);
        if (row.owners?.length) {
          const owners = document.createElement('div');
          owners.className = 'ogsm-owners';
          row.owners.forEach((owner) => {
            const badge = document.createElement('span');
            badge.className = 'ogsm-owner';
            badge.textContent = owner;
            owners.appendChild(badge);
          });
          measureCell.appendChild(owners);
        }
        wrapper.appendChild(measureCell);
        ogsmTableBlock.appendChild(wrapper);
      });
    }
  }
};

const restartDemoFlow = () => {
  state.project = null;
  state.setupSource = 'blank';
  state.sampleProjectLoaded = false;
  state.sampleDocsLoaded = false;
  state.uploads = [];
  state.notes = '';
  state.parsing = {
    running: false,
    completed: false,
    logs: [t('common.waitForMaterials')]
  };
  state.issues = [];
  state.selectedIssueIds = [];
  state.analysis = null;
  setGenerationError('');
  setupForm.reset();
  notesInput.value = '';
  fileInput.value = '';
  fileList.innerHTML = '';
  frameworkSelect.selectedIndex = 0;
  toPainBtn.textContent = t('buttons.startParsing');
  updateNextButtonState();
  updateProjectBrief();
  renderUploadedItems();
  renderSampleMaterials();
  renderParseStatus();
  renderCaseContext();
  updateFrameworkDescription();
  setStep('landing');
};

const copyPresenterScript = async () => {
  const text = presenterTemplate.textContent.trim();
  try {
    await navigator.clipboard.writeText(text);
    startScriptBtn.textContent = t('buttons.copied');
  } catch (error) {
    startScriptBtn.textContent = t('buttons.copyFailed');
  }
  setTimeout(() => (startScriptBtn.textContent = t('common.copiedDefault')), 1200);
};

const exportResultAsPdf = () => {
  if (currentStep !== 'results' || !state.analysis) return;
  window.print();
};

const init = async () => {
  state.caseData = await DemoAPI.fetchCaseData();
  await populateFrameworks();
  applyLanguage();
  updateProgress();
  renderCaseContext();
  renderUploadedItems();
  renderSampleMaterials();
  renderParseStatus();
  setupForm.addEventListener('submit', handleSetupSubmit);
  loadSampleProjectBtn.addEventListener('click', loadSampleProject);
  if (useSampleLandingBtn) {
    useSampleLandingBtn.addEventListener('click', loadSampleProjectFromLanding);
  }
  useSampleDocsBtn.addEventListener('click', loadSampleDocs);
  fileInput.addEventListener('change', trackFiles);
  saveNotesBtn.addEventListener('click', saveNotes);
  toPainBtn.addEventListener('click', startParsing);
  selectAllBtn.addEventListener('click', selectAllIssues);
  clearIssuesBtn.addEventListener('click', clearIssues);
  manualIssueForm.addEventListener('submit', addManualIssue);
  generateAnalysisBtn.addEventListener('click', generateAnalysis);
  restartBtn.addEventListener('click', restartDemoFlow);
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', exportResultAsPdf);
  }
  startDemoBtn.addEventListener('click', () => setStep('setup'));
  backToLanding.addEventListener('click', () => setStep('landing'));
  startScriptBtn.addEventListener('click', copyPresenterScript);
  langButtons.forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });
  startLinks.forEach((link) =>
    link.addEventListener('click', () => setStep(link.dataset.stepLink))
  );
  frameworkSelect.addEventListener('change', handleSetupFieldChange);
  setupForm.projectName.addEventListener('input', handleSetupFieldChange);
  setupForm.topic.addEventListener('input', handleSetupFieldChange);
  setupForm.industry.addEventListener('input', handleSetupFieldChange);
  setupForm.goal.addEventListener('input', handleSetupFieldChange);
  setupForm.backgroundContext.addEventListener('input', handleSetupFieldChange);
};

init();
