import {
  Bot,
  Brain,
  Database,
  Eye,
  GitBranch,
  Layers,
  LineChart,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export const services = [
  {
    icon: Bot,
    title: "Agentic AI Systems",
    desc: "Autonomous agents that plan, use tools, and execute multi-step workflows safely in production.",
    points: ["LangGraph & custom orchestration", "Tool/function calling", "Human-in-the-loop"],
  },
  {
    icon: Brain,
    title: "LLM Applications",
    desc: "Production LLM apps with grounded retrieval, evals, guardrails, and observability built in.",
    points: ["Chat & copilots", "Structured outputs", "Streaming + low-latency"],
  },
  {
    icon: Database,
    title: "RAG & Knowledge",
    desc: "Hybrid retrieval over your enterprise data — vector + keyword + graph, with reranking.",
    points: ["Vector DBs", "Hybrid search", "Knowledge graphs"],
  },
  {
    icon: Eye,
    title: "Computer Vision",
    desc: "Detection, segmentation, OCR and multimodal pipelines tuned for your domain and devices.",
    points: ["Edge & cloud inference", "OCR & document AI", "Vision-language models"],
  },
  {
    icon: Workflow,
    title: "AI Automation",
    desc: "Replace busy work with reliable automations: forms, documents, tickets, emails, ops.",
    points: ["Document understanding", "Process orchestration", "Integrations"],
  },
  {
    icon: LineChart,
    title: "Predictive ML",
    desc: "Forecasting, ranking, recommendations and classification — calibrated and monitored.",
    points: ["Tabular & time-series", "Feature stores", "A/B and uplift"],
  },
  {
    icon: GitBranch,
    title: "MLOps & Platforms",
    desc: "End-to-end ML platforms: training, serving, evals, registries, CI/CD for models.",
    points: ["Cloud Run / GKE / Vertex", "Model registry", "Experiment tracking"],
  },
  {
    icon: ShieldCheck,
    title: "AI Safety & Governance",
    desc: "Red-teaming, evaluations, policy controls, PII handling and compliance baked in.",
    points: ["Eval harnesses", "Guardrails", "Audit & lineage"],
  },
  {
    icon: Layers,
    title: "Strategy & Advisory",
    desc: "From AI roadmap to org design — we help leaders pick the right bets and ship them.",
    points: ["AI maturity audits", "Build/buy decisions", "Team enablement"],
  },
];

export const solutions = [
  {
    title: "AI Customer Support Copilot",
    desc: "Cuts handle time 40%+ with a grounded, multilingual copilot that drafts replies, summarizes tickets, and escalates safely.",
    tags: ["LLM", "RAG", "Voice"],
  },
  {
    title: "Document Intelligence Platform",
    desc: "Extract, classify and reason over contracts, invoices and forms with auditable confidence scores.",
    tags: ["OCR", "Doc AI", "Workflow"],
  },
  {
    title: "Sales & Marketing Agents",
    desc: "Autonomous agents that research accounts, draft outreach, score leads and update your CRM.",
    tags: ["Agents", "CRM", "Automation"],
  },
  {
    title: "Internal Knowledge Assistant",
    desc: "A secure assistant trained on your wikis, code and tickets — with row-level access controls.",
    tags: ["RAG", "SSO", "Guardrails"],
  },
  {
    title: "Computer Vision QA",
    desc: "Real-time defect detection on the line — runs on edge devices with cloud retraining loops.",
    tags: ["Vision", "Edge", "MLOps"],
  },
  {
    title: "Forecasting & Optimization",
    desc: "Demand forecasting, dynamic pricing and routing optimization tied to business KPIs.",
    tags: ["Forecasting", "Optimization"],
  },
];

export const cases = [
  {
    client: "Global FinServ",
    title: "Agentic operations copilot",
    metric: "−62% manual triage time",
    desc: "Replaced manual SOPs with an agent that reads alerts, queries systems and drafts responses for analysts.",
    tags: ["Agents", "LLM", "Cloud Run"],
  },
  {
    client: "Healthcare Provider",
    title: "Clinical document AI",
    metric: "98.2% extraction F1",
    desc: "HIPAA-compliant pipeline extracting structured data from referrals, prior-auths and discharge notes.",
    tags: ["Doc AI", "OCR", "PHI"],
  },
  {
    client: "Retail Group",
    title: "Personalization engine",
    metric: "+18% revenue per user",
    desc: "Hybrid recommender combining sequential models, LLM rerankers and live business rules.",
    tags: ["Reco", "Ranking", "MLOps"],
  },
  {
    client: "Industrial OEM",
    title: "Edge vision QA",
    metric: "−74% defect leakage",
    desc: "On-device vision models with continuous retraining from labeled production samples.",
    tags: ["Vision", "Edge", "Active learning"],
  },
];
