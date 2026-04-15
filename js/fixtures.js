export const frameworkOptions = [
  {
    id: 'swot',
    name: 'SWOT 战略扫描',
    description: '适合快速识别业务的优势、短板、机会与风险。'
  },
  {
    id: 'ogsm',
    name: 'OGSM 战略解码',
    description: '适合把目标拆解为目标、策略和衡量指标。'
  },
  {
    id: 'process',
    name: '流程审计（Process Audit）',
    description: '适合发现流程堵点、协作断点和效率问题。'
  },
  {
    id: 'valuechain',
    name: '价值链诊断（Value Chain Pulse）',
    description: '适合从端到端视角评估价值链表现与协同问题。'
  }
];

export const sampleProject = {
  projectName: 'Alpha Robotics 服务增长优化项目',
  topic: 'Alpha Robotics 服务业务',
  goal: '明确服务业务的增长引擎，并形成未来 12 个月的执行型 OGSM 路线图。',
  framework: 'ogsm'
};

export const sampleDocuments = [
  'Alpha_战略复盘.pdf',
  '第一季度访谈纪要.docx',
  '客户反馈汇总.xlsx'
];

export const issueLibrary = {
  swot: [
    {
      id: 'swot-1',
      title: '市场定位模糊导致销售漏斗瓶颈',
      impact: 'High',
      description: '同类机器人厂商打法一致，客户无法区分价值主张，30% 线索被竞品抢走。'
    },
    {
      id: 'swot-2',
      title: '服务交付成本高',
      impact: 'Medium',
      description: '维保团队出勤效率低，每单成本高出行业基准 18%。'
    },
    {
      id: 'swot-3',
      title: '渠道伙伴关系脆弱',
      impact: 'Medium',
      description: '缺少激励模型与共创机制，新行业伙伴拓展缓慢。'
    },
    {
      id: 'swot-4',
      title: '硬件依赖单一供应商',
      impact: 'High',
      description: '关键零部件只有一家合格供应商，供应中断风险高。'
    }
  ],
  ogsm: [
    {
      id: 'ogsm-1',
      title: 'Objectives 未与财年 North Star 对齐',
      impact: 'High',
      description: '前线 KPI 只衡量签单量，未覆盖续费与服务收入，导致策略分散。'
    },
    {
      id: 'ogsm-2',
      title: 'GTM 关键战役不清晰',
      impact: 'High',
      description: '没有“必须打赢的仗”列表，项目优先级取决于个人偏好。'
    },
    {
      id: 'ogsm-3',
      title: '部门 KPI 缺少量化追踪',
      impact: 'Medium',
      description: 'OKR 模板存在但是未更新，季度复盘无法定位责任人。'
    },
    {
      id: 'ogsm-4',
      title: '管理节奏与共创会议缺失',
      impact: 'Low',
      description: '战略共创会只开过一次，后续没有跟踪会议。'
    }
  ],
  process: [
    {
      id: 'proc-1',
      title: 'L2-L3 流程角色模糊',
      impact: 'High',
      description: '交付流程泳道图缺少责任定义，交接时间被动延长。'
    },
    {
      id: 'proc-2',
      title: 'SOP 未和 KPI 绑定',
      impact: 'Medium',
      description: '流程执行检查清单不与绩效挂钩，合规性下降。'
    },
    {
      id: 'proc-3',
      title: '工具链碎片化',
      impact: 'Medium',
      description: '不同团队使用独立表格，缺乏单一数据源。'
    }
  ],
  valuechain: [
    {
      id: 'vc-1',
      title: '薪酬激励与战略脱节',
      impact: 'High',
      description: '薪酬方案仍围绕硬件销售，服务营收缺少激励。'
    },
    {
      id: 'vc-2',
      title: '人才盘点没有形成 Success Profile',
      impact: 'Medium',
      description: '核心岗位能力模型缺失，招聘与培养方向不明。'
    },
    {
      id: 'vc-3',
      title: '绩效复盘机制弱',
      impact: 'Medium',
      description: '红绿灯仪表盘停留在概念，没有数据支撑复盘。'
    }
  ]
};

export const riskTemplates = [
  {
    id: 'ops',
    title: '执行节奏失衡',
    badge: 'badge-medium',
    copy: '流程梳理后如未配套 KPI/激励，改进计划会流于形式。'
  },
  {
    id: 'data',
    title: '数据可信度',
    badge: 'badge-high',
    copy: '模拟数据可用于演示，但上线前必须梳理合规与版权。'
  },
  {
    id: 'people',
    title: '组织变更疲劳',
    badge: 'badge-low',
    copy: '多次计划变更导致团队厌倦，需要节奏化沟通。'
  }
];

export const recommendationPool = [
  '建立 OGSM 共创 + 双周 Rhythm 会议，将 North Star 级联到部门 KPI。',
  '搭建流程泳道 + 权责矩阵，用于上线后的培训与审计。',
  '发布关键问题行动清单，联合产品与销售制定 6 周冲刺。',
  '以 PDF/PPT 模板输出标准交付件，并链接真实数据源。'
];
