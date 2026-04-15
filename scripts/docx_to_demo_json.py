#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


DEFAULT_FRAMEWORKS = [
    {
        "id": "swot",
        "name": "SWOT 战略扫描",
        "description": "适合快速识别业务的优势、短板、机会与风险。",
    },
    {
        "id": "ogsm",
        "name": "OGSM 战略解码",
        "description": "适合把目标拆解为目标、策略和衡量指标。",
    },
    {
        "id": "process",
        "name": "流程审计（Process Audit）",
        "description": "适合发现流程堵点、协作断点和效率问题。",
    },
    {
        "id": "valuechain",
        "name": "价值链诊断（Value Chain Pulse）",
        "description": "适合从端到端视角评估价值链表现与协同问题。",
    },
]


def read_docx_text(path: Path) -> str:
    with ZipFile(path) as archive:
        xml = archive.read("word/document.xml")
    root = ET.fromstring(xml)
    paragraphs = []
    for paragraph in root.findall(".//w:p", NS):
        texts = [node.text or "" for node in paragraph.findall(".//w:t", NS)]
        text = "".join(texts).strip()
        if text:
            paragraphs.append(text)
    return "\n".join(paragraphs)


def extract_first_json_blob(text: str) -> dict:
    match = re.search(r"\{.*\}", text, flags=re.S)
    if not match:
        raise ValueError("未在文档中找到 JSON 片段")
    return json.loads(match.group(0))


def build_ogsm_issues(case_json: dict) -> list[dict]:
    questions = case_json.get("step3_key_questions", [])
    titles = [
        "订阅服务增长目标如何落地",
        "核心区域渠道伙伴如何构建",
        "交付与人才体系如何支撑增长",
        "激励机制如何与战略结果挂钩",
    ]
    impacts = ["High", "High", "Medium", "Medium"]
    descriptions = [
        "围绕年度不少于 60 个订阅服务合同、4000 万确认收入和 15% 净利润率目标，建立从季度目标到负责人动作的拆解机制。",
        "在北上广深等核心市场建立不少于 10 个战略渠道伙伴，并形成可复制的市场渗透打法。",
        "围绕交付延期、新人上手周期长和跨部门协同成本高的问题，建立员工全生命周期管理与标准化交付流程。",
        "重构销售与交付团队的奖金和股权激励方案，使绩效结果与确认收入、交付表现直接挂钩。",
    ]
    issues = []
    for idx, _question in enumerate(questions[:4]):
        issues.append(
            {
                "id": f"ogsm-{idx + 1}",
                "title": titles[idx],
                "impact": impacts[idx],
                "description": descriptions[idx],
            }
        )
    return issues


def split_numbered_text(text: str) -> list[str]:
    if not text:
        return []
    normalized = re.sub(r"\s*\d+[.．、]\s*", "|", text.strip())
    return [part.strip("；; ") for part in normalized.split("|") if part.strip("；; ")]


def build_key_question_records(case_json: dict) -> list[dict]:
    questions = case_json.get("step3_key_questions", [])
    titles = [
        "订阅服务增长目标缺乏可执行抓手",
        "核心区域渠道建设路径不清晰",
        "交付效率与人才培养体系支撑不足",
        "激励机制与业绩目标未有效挂钩",
    ]
    priorities = ["high", "high", "medium", "medium"]
    descriptions = [
        "年度订阅服务增长目标已经提出，但缺少拆解到季度节奏、负责人与执行动作的落地抓手。",
        "核心市场的渠道目标明确，但招募标准、激活方式和区域打法仍不清晰。",
        "交付延期、流程不稳和新人培养慢的问题并存，组织能力尚不足以支撑业务扩张。",
        "当前奖金与股权激励未直接反映订阅业务和确认收入目标，团队主动性难以被放大。",
    ]
    sources = [
        "OGSM 关键问题提炼 / 结果页原型",
        "关键问题提炼 / 观察纪要",
        "观察纪要 / 组织诊断",
        "观察纪要 / 关键问题提炼",
    ]
    evidence = [
        "年度实现不少于60个订阅服务合同签署，并支撑4000万的确认收入目标。",
        "在北上广深等核心区域，如何建立不少于10个战略渠道伙伴以加速市场渗透。",
        "现场交付与计划脱节导致延期；招聘速度跟不上业务增长，缺乏清晰的员工职业发展路径。",
        "如何设计与OGSM目标直接挂钩的奖金及股权激励方案，以激发销售与交付团队的主动性。",
    ]
    strategy_hints = [
        "把年度签约、确认收入和利润率目标拆解为季度目标、区域负责人和 review 节点。",
        "围绕北上广深核心市场设计渠道招募标准、联合打法和激活机制。",
        "同步补齐标准化交付流程、员工体验地图和新人培养路径。",
        "让奖金池、股权激励和确认收入、交付表现形成直接联动。",
    ]
    measure_hints = [
        "重点跟踪订阅服务合同数、确认收入、净利润率。",
        "重点跟踪战略渠道伙伴数量、渠道签约占比和区域渗透率。",
        "重点跟踪新人胜任周期、交付节点准时率和跨部门协同效率。",
        "重点跟踪奖金挂钩比例、绩效谈话完成率和团队主动性指标。",
    ]

    records = []
    for idx, question in enumerate(questions[:4]):
        records.append(
            {
                "id": f"kq-{idx + 1}",
                "title": titles[idx],
                "question": question,
                "priority": priorities[idx],
                "impact": "High" if priorities[idx] == "high" else "Medium",
                "description": descriptions[idx],
                "source": sources[idx],
                "evidence": evidence[idx],
                "strategyHint": strategy_hints[idx],
                "measureHint": measure_hints[idx],
            }
        )
    return records


def build_ogsm_table_rows(case_json: dict) -> list[dict]:
    rows = []
    for idx, row in enumerate(case_json["step4_result_mockup"]["ogsm_table"], start=1):
        owners = row.get("owners", "")
        rows.append(
            {
                "id": f"ogsm-row-{idx}",
                "objective": row["objective"],
                "goals": split_numbered_text(row.get("goals", "")),
                "strategies": row.get("strategies", []),
                "measures": row.get("measures", []),
                "owners": [item.strip() for item in re.split(r"[、，,]", owners) if item.strip()],
            }
        )
    return rows


def build_demo_case(interview_doc: Path, ogsm_doc: Path) -> dict:
    interview_json = extract_first_json_blob(read_docx_text(interview_doc))
    ogsm_json = extract_first_json_blob(read_docx_text(ogsm_doc))

    brief = ogsm_json["step1_brief"]
    metadata = ogsm_json["project_metadata"]
    ogsm_table = build_ogsm_table_rows(ogsm_json)
    key_questions = build_key_question_records(ogsm_json)
    observation_bullets = ogsm_json["step2_input_materials"]["observation_bullets"]
    background_summary = ogsm_json["step2_input_materials"]["background_summary"]
    sample_documents = [
        {
            "name": interview_doc.name,
            "type": "docx",
            "role": "访谈转 OGSM Prompt 设计",
            "summary": "沉淀了访谈转 OGSM 的 Prompt 协议、语义映射方式和 JSON 输出要求。",
        },
        {
            "name": ogsm_doc.name,
            "type": "docx",
            "role": "案例初始化材料包",
            "summary": "包含案例背景、观察纪要、关键问题和 OGSM 原型表，可直接作为演示输入。",
        },
    ]
    issue_library = {
        "swot": [
            {
                "id": "swot-1",
                "title": "市场定位模糊导致销售漏斗瓶颈",
                "impact": "High",
                "description": "同类机器人厂商打法一致，客户无法区分价值主张，30% 线索被竞品抢走。",
            },
            {
                "id": "swot-2",
                "title": "服务交付成本高",
                "impact": "Medium",
                "description": "维保团队出勤效率低，每单成本高出行业基准 18%。",
            },
            {
                "id": "swot-3",
                "title": "渠道伙伴关系脆弱",
                "impact": "Medium",
                "description": "缺少激励模型与共创机制，新行业伙伴拓展缓慢。",
            },
            {
                "id": "swot-4",
                "title": "硬件依赖单一供应商",
                "impact": "High",
                "description": "关键零部件只有一家合格供应商，供应中断风险高。",
            },
        ],
        "ogsm": [
            {
                "id": item["id"].replace("kq", "ogsm"),
                "title": item["title"],
                "impact": item["impact"],
                "description": item["description"],
            }
            for item in key_questions
        ],
        "process": [
            {
                "id": "proc-1",
                "title": "L2-L3 流程角色模糊",
                "impact": "High",
                "description": "交付流程泳道图缺少责任定义，交接时间被动延长。",
            },
            {
                "id": "proc-2",
                "title": "SOP 未和 KPI 绑定",
                "impact": "Medium",
                "description": "流程执行检查清单不与绩效挂钩，合规性下降。",
            },
            {
                "id": "proc-3",
                "title": "工具链碎片化",
                "impact": "Medium",
                "description": "不同团队使用独立表格，缺乏单一数据源。",
            },
        ],
        "valuechain": [
            {
                "id": "vc-1",
                "title": "薪酬激励与战略脱节",
                "impact": "High",
                "description": "薪酬方案仍围绕硬件销售，服务营收缺少激励。",
            },
            {
                "id": "vc-2",
                "title": "人才盘点没有形成 Success Profile",
                "impact": "Medium",
                "description": "核心岗位能力模型缺失，招聘与培养方向不明。",
            },
            {
                "id": "vc-3",
                "title": "绩效复盘机制弱",
                "impact": "Medium",
                "description": "红绿灯仪表盘停留在概念，没有数据支撑复盘。",
            },
        ],
    }
    risk_templates = [
        {
            "id": "strategy",
            "title": "战略目标与执行路径脱节",
            "badge": "badge-high",
            "copy": "如果只定义年度目标而不补齐负责人、节奏和 review 机制，OGSM 很容易停留在纸面。",
        },
        {
            "id": "delivery",
            "title": "渠道与交付能力错配",
            "badge": "badge-medium",
            "copy": "市场拓展速度如果快于交付标准化建设，会直接影响客户口碑与续约转化。",
        },
        {
            "id": "incentive",
            "title": "激励机制无法支撑转型",
            "badge": "badge-low",
            "copy": "若奖金和股权激励仍围绕旧业务模式设计，订阅制转型的主动性会明显不足。",
        },
    ]
    recommendation_pool = [
        "建立年度 OGSM 总表，把 60 个订阅服务合同、4000 万确认收入和 15% 净利润率拆解到季度节奏。",
        "设置大客户销售专岗，并在北上广深优先试点战略渠道伙伴打法。",
        "围绕交付延期问题补齐标准化交付流程、泳道责任和 review 节点。",
        "将奖金池与确认收入、交付节点准时率和季度绩效谈话完成率直接挂钩。",
        "用员工体验地图和文化宣导手册缩短新人胜任周期，形成组织能力闭环。",
    ]
    summary = [
        "jm 公司正处于从项目制向订阅服务制转型的关键阶段，当前核心问题不是缺少机会，而是战略、执行和激励尚未完全拉通。",
        "从材料看，增长目标、渠道建设、交付能力和激励机制是最需要优先对齐的四条主线。",
        "建议以 OGSM 为主框架，把年度硬仗拆解为季度目标、负责人和复盘节点，先在重点区域验证打法，再逐步复制。",
    ]
    findings = [
        "战略层：年度目标已出现，但资源分配、优先级和 review 节奏尚未完全拉通。",
        "市场层：核心区域渠道拓展目标明确，但对应的招募标准、激活机制和打法设计仍需补齐。",
        "组织层：交付流程、人才培养和绩效应用机制尚未形成闭环，难以支撑业务扩张。",
        "激励层：奖金与股权激励尚未与订阅业务和确认收入目标形成直接挂钩。",
    ]

    return {
        "schemaVersion": "2.1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceDocs": [
            {"role": "interview_prompt", "name": interview_doc.name},
            {"role": "ogsm_case", "name": ogsm_doc.name},
        ],
        "project": {
            "metadata": {
                "caseName": metadata["case_name"],
                "industry": metadata["industry"],
                "framework": metadata["framework"],
                "companyDescription": brief["case_description"],
            },
            "brief": {
                "caseDescription": brief["case_description"],
                "coreProblem": brief["core_problem"],
                "selectionReason": brief["selection_reason"],
            },
            "setupDefaults": {
                "projectName": metadata["case_name"],
                "topic": f"{metadata['case_name']}与订阅业务转型",
                "goal": brief["core_problem"],
                "framework": "ogsm",
            },
        },
        "materials": {
            "backgroundSummary": background_summary,
            "observationBullets": observation_bullets,
            "sampleDocuments": sample_documents,
        },
        "keyQuestions": key_questions,
        "ogsmTable": ogsm_table,
        "frameworkOptions": DEFAULT_FRAMEWORKS,
        "sampleProject": {
            "projectName": metadata["case_name"],
            "topic": f"{metadata['case_name']}与订阅业务转型",
            "goal": brief["core_problem"],
            "framework": "ogsm",
        },
        "sampleDocuments": [item["name"] for item in sample_documents],
        "issueLibrary": issue_library,
        "riskTemplates": risk_templates,
        "recommendationPool": recommendation_pool,
        "analysisTemplate": {
            "summary": summary,
            "findings": findings,
            "frameworkDetails": {
                "title": metadata["framework"],
                "description": brief["selection_reason"],
                "highlights": [
                    {
                        "label": "目的（Objective）",
                        "text": ogsm_table[0]["objective"],
                    },
                    {
                        "label": "目标（Goal）",
                        "text": "；".join(ogsm_table[0]["goals"]),
                    },
                    {
                        "label": "策略（Strategy）",
                        "text": "；".join(ogsm_table[0]["strategies"]),
                    },
                    {
                        "label": "衡量（Measure）",
                        "text": "；".join(ogsm_table[0]["measures"]),
                    },
                ],
            },
        },
        "sourcePrompt": interview_json,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="从两份 docx 生成 ConsultAI demo JSON")
    parser.add_argument("--interview", required=True, help="访谈转 OGSM prompt 文档路径")
    parser.add_argument("--ogsm", required=True, help="OGSM 案例文档路径")
    parser.add_argument("--output", required=True, help="输出 JSON 路径")
    args = parser.parse_args()

    interview_doc = Path(args.interview).expanduser().resolve()
    ogsm_doc = Path(args.ogsm).expanduser().resolve()
    output = Path(args.output).expanduser().resolve()

    demo_case = build_demo_case(interview_doc, ogsm_doc)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(demo_case, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"已生成: {output}")


if __name__ == "__main__":
    main()
