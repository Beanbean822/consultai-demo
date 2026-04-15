export const frameworkOptions = [
  {
    id: 'swot',
    name: 'SWOT Scan',
    description: 'Best for quickly identifying strengths, weaknesses, opportunities, and risks.'
  },
  {
    id: 'ogsm',
    name: 'OGSM Mapping',
    description: 'Best for breaking objectives into goals, strategies, and measures.'
  },
  {
    id: 'process',
    name: 'Process Audit',
    description: 'Best for identifying process bottlenecks, collaboration gaps, and efficiency issues.'
  },
  {
    id: 'valuechain',
    name: 'Value Chain Pulse',
    description: 'Best for evaluating end-to-end value-chain performance and coordination issues.'
  }
];

export const sampleProject = {
  projectName: 'JM Smart Building Energy Efficiency Program',
  topic: 'JM Subscription-Service Growth and Operating Model Shift',
  goal: 'Close the gap between strategic ambition and execution by strengthening enterprise sales capability, delivery efficiency, and incentive alignment.',
  framework: 'ogsm'
};

export const sampleDocuments = [
  'Interview-to-OGSM Strategy Extraction.docx',
  'JM OGSM Integrated Case Pack.docx'
];

export const issueLibrary = {
  swot: [
    {
      id: 'swot-1',
      title: 'The value proposition is not differentiated enough to unlock enterprise demand',
      impact: 'High',
      description: 'Clients see limited differentiation versus alternative energy-saving offers, which weakens conversion in strategic accounts.'
    },
    {
      id: 'swot-2',
      title: 'Service delivery cost remains too high',
      impact: 'Medium',
      description: 'Field efficiency is below benchmark, pushing service cost per project above target levels.'
    },
    {
      id: 'swot-3',
      title: 'The partner ecosystem is not yet resilient',
      impact: 'Medium',
      description: 'The current partner model lacks incentive alignment and a repeatable co-sell motion.'
    },
    {
      id: 'swot-4',
      title: 'Critical capabilities still rely on a narrow supplier base',
      impact: 'High',
      description: 'Concentration of key technical dependencies increases operational and scaling risk.'
    }
  ],
  ogsm: [
    {
      id: 'ogsm-1',
      title: 'Subscription-service growth targets lack executable levers',
      impact: 'High',
      description: 'The annual growth ambition exists, but quarterly pacing, ownership, and execution mechanisms are still unclear.'
    },
    {
      id: 'ogsm-2',
      title: 'The path for building channels in core regions remains unclear',
      impact: 'High',
      description: 'Core market priorities are known, but partner qualification, activation, and regional playbooks are not fully defined.'
    },
    {
      id: 'ogsm-3',
      title: 'Delivery efficiency and talent development are not strong enough to support scale',
      impact: 'Medium',
      description: 'Delivery slippage and slow talent ramp-up suggest the organization is not yet ready for the targeted scale-up.'
    },
    {
      id: 'ogsm-4',
      title: 'Incentives are not tightly linked to business outcomes',
      impact: 'Medium',
      description: 'Current bonus and equity mechanisms do not sufficiently reinforce subscription growth and recognized revenue targets.'
    }
  ],
  process: [
    {
      id: 'proc-1',
      title: 'Role ownership across the delivery flow is unclear',
      impact: 'High',
      description: 'Handoffs stretch because responsibilities are not fully defined across major delivery stages.'
    },
    {
      id: 'proc-2',
      title: 'Standard operating routines are not linked to performance',
      impact: 'Medium',
      description: 'Execution checklists exist, but they are not reinforced through performance management.'
    },
    {
      id: 'proc-3',
      title: 'The tool chain is fragmented across teams',
      impact: 'Medium',
      description: 'Teams still rely on separate files and local trackers instead of a shared operating view.'
    }
  ],
  valuechain: [
    {
      id: 'vc-1',
      title: 'Compensation design still reflects the old business model',
      impact: 'High',
      description: 'The incentive model still overweights traditional project wins and underweights subscription economics.'
    },
    {
      id: 'vc-2',
      title: 'Talent review has not produced a clear success profile',
      impact: 'Medium',
      description: 'Core roles still lack a shared capability model to guide hiring and development.'
    },
    {
      id: 'vc-3',
      title: 'Performance review routines are still weak',
      impact: 'Medium',
      description: 'Management dashboards remain conceptual and do not yet drive disciplined business review.'
    }
  ]
};

export const riskTemplates = [
  {
    id: 'strategy',
    title: 'Strategy and execution remain disconnected',
    badge: 'badge-high',
    copy: 'If annual targets are defined without owners, cadence, and review discipline, OGSM will remain a planning artifact rather than an operating system.'
  },
  {
    id: 'delivery',
    title: 'Channel growth could outpace delivery capability',
    badge: 'badge-medium',
    copy: 'If market expansion accelerates before delivery standards are stabilized, client experience and renewal conversion will suffer.'
  },
  {
    id: 'incentive',
    title: 'The incentive system may fail to support the business shift',
    badge: 'badge-low',
    copy: 'If bonus and equity design continue to reflect the old model, teams will not fully commit to the subscription transition.'
  }
];

export const recommendationPool = [
  'Build a single OGSM master plan that breaks 60 subscription contracts, RMB 40 million recognized revenue, and margin targets into quarterly operating reviews.',
  'Stand up a dedicated enterprise-sales motion and pilot a strategic channel-partner model first in the top-tier cities.',
  'Stabilize delivery by defining standard work, role ownership, and review checkpoints for the major implementation stages.',
  'Tie bonus pools directly to recognized revenue, on-time delivery milestones, and completion of quarterly performance conversations.',
  'Use an employee-journey map and capability-building path to shorten new-hire ramp time and strengthen organization capacity.'
];
