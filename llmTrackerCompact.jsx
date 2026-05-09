import { useState, useCallback } from "react";

const TIER_CONFIG = [
  { id:"T1", num:1, label:"Foundation", accent:"#22c55e", bg:"rgba(34,197,94,0.08)", border:"rgba(34,197,94,0.2)", head:"rgba(34,197,94,0.15)" },
  { id:"T2", num:2, label:"Agentic AI", accent:"#3b82f6", bg:"rgba(59,130,246,0.08)", border:"rgba(59,130,246,0.2)", head:"rgba(59,130,246,0.15)" },
  { id:"T3", num:3, label:"LLMOps", accent:"#a855f7", bg:"rgba(168,85,247,0.08)", border:"rgba(168,85,247,0.2)", head:"rgba(168,85,247,0.15)" },
  { id:"T4", num:4, label:"Fine-tuning", accent:"#f59e0b", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.2)", head:"rgba(245,158,11,0.15)" },
  { id:"T5", num:5, label:"Cloud & Infra", accent:"#06b6d4", bg:"rgba(6,182,212,0.08)", border:"rgba(6,182,212,0.2)", head:"rgba(6,182,212,0.15)" },
  { id:"T6", num:6, label:"Advanced", accent:"#f43f5e", bg:"rgba(244,63,94,0.08)", border:"rgba(244,63,94,0.2)", head:"rgba(244,63,94,0.15)" },
];

const S = {
  have:  { label:"Know it",  color:"#16a34a", bg:"rgba(22,163,74,0.18)",  border:"rgba(22,163,74,0.4)",  dot:"#22c55e" },
  learn: { label:"Learning", color:"#2563eb", bg:"rgba(37,99,235,0.18)",  border:"rgba(37,99,235,0.4)",  dot:"#3b82f6" },
  todo:  { label:"To learn", color:"#b91c1c", bg:"rgba(185,28,28,0.18)",  border:"rgba(185,28,28,0.4)",  dot:"#ef4444" },
};
const CYCLE = ["have","learn","todo"];

const INIT = {
  T1:[
    { id:"t1-1", name:"Python (advanced)", freq:5,
      topics:[
        {t:"Async / await patterns",s:"have"},{t:"Type hints & dataclasses",s:"have"},
        {t:"Packaging & virtual envs",s:"have"},{t:"Decorators, generators",s:"have"},
        {t:"Testing with pytest",s:"have"},
      ], tools:"fastapi · pydantic · asyncio · pytest" },
    { id:"t1-2", name:"LLM APIs & prompt engineering", freq:5,
      topics:[
        {t:"OpenAI, Anthropic, Gemini APIs",s:"have"},{t:"System prompts & roles",s:"have"},
        {t:"Few-shot & chain-of-thought",s:"have"},{t:"Structured outputs (JSON mode)",s:"have"},
        {t:"Token counting & cost control",s:"have"},
      ], tools:"openai · anthropic · tiktoken · litellm" },
    { id:"t1-3", name:"LangChain", freq:5,
      topics:[
        {t:"Chains & LCEL (pipe syntax)",s:"have"},{t:"Tools & agent executors",s:"have"},
        {t:"Memory & conversation history",s:"have"},{t:"Document loaders & splitters",s:"have"},
        {t:"Callbacks & tracing hooks",s:"have"},
      ], tools:"langchain · langchain-community · langchain-core" },
    { id:"t1-4", name:"LangGraph", freq:4,
      topics:[
        {t:"StateGraph nodes & edges",s:"have"},{t:"Conditional routing",s:"have"},
        {t:"Checkpointers & persistence",s:"have"},{t:"Subgraphs & parallelism",s:"learn"},
        {t:"Human-in-the-loop patterns",s:"learn"},
      ], tools:"langgraph · StateGraph · MemorySaver" },
    { id:"t1-5", name:"RAG pipelines", freq:5,
      topics:[
        {t:"Chunking strategies (fixed, semantic)",s:"have"},{t:"Embedding models selection",s:"have"},
        {t:"Retrieval (dense + sparse)",s:"have"},{t:"Re-ranking with cross-encoders",s:"learn"},
        {t:"Hybrid search & MMR",s:"learn"},
      ], tools:"langchain · llama-index · haystack · cohere rerank" },
    { id:"t1-6", name:"Vector databases", freq:5,
      topics:[
        {t:"Pinecone index ops & namespaces",s:"learn"},{t:"Weaviate schema & vectorizer",s:"todo"},
        {t:"pgvector with PostgreSQL",s:"todo"},{t:"Chroma for local dev",s:"learn"},
        {t:"HNSW index tuning",s:"todo"},
      ], tools:"pinecone · weaviate-client · pgvector · chromadb" },
    { id:"t1-7", name:"Embeddings & semantic search", freq:4,
      topics:[
        {t:"OpenAI text-embedding-3",s:"have"},{t:"Sentence-transformers (BGE, E5)",s:"have"},
        {t:"Cosine similarity & ANN",s:"have"},{t:"Fine-tuning embedding models",s:"todo"},
        {t:"Dimensionality & trade-offs",s:"todo"},
      ], tools:"sentence-transformers · faiss-cpu · openai embeddings" },
  ],
  T2:[
    { id:"t2-1", name:"Multi-agent orchestration", freq:5,
      topics:[
        {t:"Supervisor + worker patterns",s:"learn"},{t:"Agent-to-agent delegation",s:"learn"},
        {t:"Shared vs private state",s:"todo"},{t:"Interrupt & approval gates",s:"todo"},
        {t:"Parallel subgraph execution",s:"todo"},
      ], tools:"langgraph · autogen · crewai · google-adk" },
    { id:"t2-2", name:"Tool use & function calling", freq:5,
      topics:[
        {t:"OpenAI / Anthropic tool schemas",s:"have"},{t:"Pydantic output validation",s:"have"},
        {t:"Parallel tool calls",s:"have"},{t:"Tool error handling & retries",s:"learn"},
        {t:"Instructor library patterns",s:"learn"},
      ], tools:"openai tools · anthropic tools · instructor · pydantic" },
    { id:"t2-3", name:"Model Context Protocol (MCP)", freq:4,
      topics:[
        {t:"MCP server setup (FastMCP)",s:"todo"},{t:"Tool & resource registration",s:"todo"},
        {t:"MCP client integration",s:"todo"},{t:"Connecting to Claude Desktop",s:"todo"},
        {t:"Enterprise MCP patterns",s:"todo"},
      ], tools:"mcp · fastmcp · anthropic MCP SDK" },
    { id:"t2-4", name:"Memory systems", freq:4,
      topics:[
        {t:"Conversation window memory",s:"todo"},{t:"Vector long-term memory",s:"todo"},
        {t:"Episodic memory patterns",s:"todo"},{t:"mem0 architecture",s:"todo"},
        {t:"LangGraph checkpointer",s:"todo"},
      ], tools:"mem0 · zep · langgraph checkpointer · redis" },
    { id:"t2-5", name:"Agent evaluation & testing", freq:4,
      topics:[
        {t:"LLM-as-judge patterns",s:"todo"},{t:"RAGAS metrics",s:"todo"},
        {t:"Trajectory evaluation",s:"todo"},{t:"Regression test suites",s:"todo"},
        {t:"Dataset-driven eval loops",s:"todo"},
      ], tools:"RAGAS · deepeval · langsmith evals · promptfoo" },
    { id:"t2-6", name:"Autogen / CrewAI / ADK", freq:3,
      topics:[
        {t:"AutoGen ConversableAgent",s:"todo"},{t:"CrewAI role & task definition",s:"todo"},
        {t:"Google ADK agent setup",s:"todo"},{t:"Framework comparison",s:"todo"},
        {t:"When to use which framework",s:"todo"},
      ], tools:"autogen · crewai · google-adk · smolagents" },
  ],
  T3:[
    { id:"t3-1", name:"LangSmith / tracing", freq:5,
      topics:[
        {t:"Project setup & API keys",s:"todo"},{t:"Run tracing & span hierarchy",s:"todo"},
        {t:"Prompt versioning & datasets",s:"todo"},{t:"A/B evaluation in LangSmith",s:"todo"},
        {t:"Custom feedback & annotation",s:"todo"},
      ], tools:"langsmith · phoenix (Arize) · langfuse · opentelemetry" },
    { id:"t3-2", name:"MLflow / Weights & Biases", freq:4,
      topics:[
        {t:"Experiment tracking runs",s:"todo"},{t:"Model registry & versioning",s:"todo"},
        {t:"W&B prompts for LLMs",s:"todo"},{t:"Artifact logging",s:"todo"},
        {t:"Hyperparameter sweeps",s:"todo"},
      ], tools:"mlflow · wandb · clearml · neptune" },
    { id:"t3-3", name:"Model serving & deployment", freq:4,
      topics:[
        {t:"vLLM for high-throughput serving",s:"todo"},{t:"TGI (Text Generation Inference)",s:"todo"},
        {t:"Ollama for local dev",s:"todo"},{t:"SageMaker real-time endpoints",s:"todo"},
        {t:"Batching & continuous batching",s:"todo"},
      ], tools:"vllm · tgi · ollama · sagemaker · vertex ai" },
    { id:"t3-4", name:"Kubernetes & Docker for ML", freq:4,
      topics:[
        {t:"Dockerfile for LLM apps",s:"todo"},{t:"K8s Deployments & Services",s:"todo"},
        {t:"GPU node selectors",s:"todo"},{t:"Helm chart basics",s:"todo"},
        {t:"ArgoCD GitOps workflow",s:"todo"},
      ], tools:"docker · kubectl · helm · argocd · kubeflow" },
    { id:"t3-5", name:"CI/CD for ML pipelines", freq:3,
      topics:[
        {t:"GitHub Actions for model deploy",s:"todo"},{t:"Automated eval gates in CI",s:"todo"},
        {t:"DVC for data versioning",s:"todo"},{t:"Model promotion workflows",s:"todo"},
        {t:"Rollback strategies",s:"todo"},
      ], tools:"github-actions · argocd · dvc · jenkins" },
    { id:"t3-6", name:"Observability stack", freq:3,
      topics:[
        {t:"Prometheus metrics for LLM APIs",s:"todo"},{t:"Grafana dashboards",s:"todo"},
        {t:"Distributed tracing (Jaeger)",s:"todo"},{t:"Latency percentiles & SLOs",s:"todo"},
        {t:"Alert rules for degradation",s:"todo"},
      ], tools:"prometheus · grafana · opentelemetry · jaeger" },
  ],
  T4:[
    { id:"t4-1", name:"SFT (supervised fine-tuning)", freq:4,
      topics:[
        {t:"Instruction dataset formats",s:"learn"},{t:"Training loop with TRL SFTTrainer",s:"learn"},
        {t:"Loss curves & overfitting",s:"learn"},{t:"Chat template formatting",s:"todo"},
        {t:"Compute & VRAM requirements",s:"todo"},
      ], tools:"transformers · trl · axolotl · unsloth" },
    { id:"t4-2", name:"LoRA / QLoRA / PEFT", freq:4,
      topics:[
        {t:"LoRA rank & alpha selection",s:"learn"},{t:"QLoRA with 4-bit quantisation",s:"learn"},
        {t:"Target modules (q_proj, v_proj)",s:"learn"},{t:"Adapter merging & export",s:"todo"},
        {t:"Memory efficiency benchmarks",s:"todo"},
      ], tools:"peft · bitsandbytes · unsloth · mergekit" },
    { id:"t4-3", name:"RLHF & DPO", freq:3,
      topics:[
        {t:"Reward model training",s:"learn"},{t:"DPO preference dataset format",s:"learn"},
        {t:"DPOTrainer from TRL",s:"todo"},{t:"ORPO & SimPO variants",s:"todo"},
        {t:"When SFT beats RLHF",s:"todo"},
      ], tools:"trl · DPOTrainer · openrlhf · lm-human-preferences" },
    { id:"t4-4", name:"Quantisation & optimisation", freq:3,
      topics:[
        {t:"GGUF format & llama.cpp",s:"todo"},{t:"AWQ vs GPTQ vs GGUF",s:"todo"},
        {t:"Inference speed benchmarking",s:"todo"},{t:"Flash Attention 2",s:"todo"},
        {t:"Speculative decoding basics",s:"todo"},
      ], tools:"llama.cpp · auto-awq · optimum · exllama2" },
    { id:"t4-5", name:"Dataset curation & annotation", freq:3,
      topics:[
        {t:"Alpaca & ShareGPT formats",s:"todo"},{t:"Quality filtering heuristics",s:"todo"},
        {t:"Deduplication strategies",s:"todo"},{t:"Argilla annotation UI",s:"todo"},
        {t:"Synthetic data with LLMs",s:"todo"},
      ], tools:"datasets · argilla · label-studio · distilabel" },
    { id:"t4-6", name:"Eval frameworks for fine-tuned models", freq:3,
      topics:[
        {t:"lm-evaluation-harness tasks",s:"todo"},{t:"MT-Bench & AlpacaEval",s:"todo"},
        {t:"Custom domain eval design",s:"todo"},{t:"MMLU & HumanEval",s:"todo"},
        {t:"Regression vs capability evals",s:"todo"},
      ], tools:"lm-evaluation-harness · openai-evals · mt-bench" },
  ],
  T5:[
    { id:"t5-1", name:"AWS (Bedrock, Lambda, SageMaker)", freq:5,
      topics:[
        {t:"Bedrock model invocation API",s:"todo"},{t:"Lambda for serverless inference",s:"todo"},
        {t:"S3 for document storage (RAG)",s:"todo"},{t:"SageMaker training jobs",s:"todo"},
        {t:"IAM roles & least privilege",s:"todo"},
      ], tools:"boto3 · sagemaker-python-sdk · aws-cdk · langchain-aws" },
    { id:"t5-2", name:"Azure (OpenAI, ML, Cognitive Search)", freq:4,
      topics:[
        {t:"Azure OpenAI endpoint setup",s:"todo"},{t:"Azure Cognitive Search for RAG",s:"todo"},
        {t:"Azure ML pipelines",s:"todo"},{t:"Managed online endpoints",s:"todo"},
        {t:"Azure Key Vault for secrets",s:"todo"},
      ], tools:"azure-ai-inference · azure-search · azure-identity" },
    { id:"t5-3", name:"GCP (Vertex AI, BigQuery ML)", freq:3,
      topics:[
        {t:"Vertex AI model garden",s:"todo"},{t:"Gemini API in Vertex",s:"todo"},
        {t:"BigQuery ML for embeddings",s:"todo"},{t:"Vertex pipelines (Kubeflow)",s:"todo"},
        {t:"Cloud Run for LLM APIs",s:"todo"},
      ], tools:"google-cloud-aiplatform · vertexai · bigquery-ml" },
    { id:"t5-4", name:"REST API design", freq:5,
      topics:[
        {t:"FastAPI route & dependency injection",s:"have"},{t:"Request/response models with Pydantic",s:"have"},
        {t:"Auth middleware (OAuth2, API keys)",s:"have"},{t:"Rate limiting & throttling",s:"have"},
        {t:"API versioning strategies",s:"have"},
      ], tools:"fastapi · uvicorn · pydantic · slowapi" },
    { id:"t5-5", name:"Authentication (OAuth2, JWT)", freq:3,
      topics:[
        {t:"JWT creation & validation",s:"have"},{t:"OAuth2 password & bearer flow",s:"have"},
        {t:"FastAPI security utilities",s:"have"},{t:"Token refresh patterns",s:"have"},
        {t:"Secret management (env, vault)",s:"have"},
      ], tools:"python-jose · authlib · fastapi-security · passlib" },
  ],
  T6:[
    { id:"t6-1", name:"Guardrails & safety", freq:4,
      topics:[
        {t:"Guardrails-ai validators",s:"todo"},{t:"NeMo Guardrails dialog flows",s:"todo"},
        {t:"Output schema validation",s:"todo"},{t:"PII detection & redaction",s:"todo"},
        {t:"Toxicity & hallucination filters",s:"todo"},
      ], tools:"guardrails-ai · nemo-guardrails · llm-guard · presidio" },
    { id:"t6-2", name:"Knowledge graphs", freq:2,
      topics:[
        {t:"Neo4j graph schema design",s:"todo"},{t:"GraphRAG (Microsoft)",s:"todo"},
        {t:"Entity extraction for graphs",s:"todo"},{t:"Graph + vector hybrid retrieval",s:"todo"},
        {t:"LLM-to-Cypher query generation",s:"todo"},
      ], tools:"neo4j · networkx · graphrag · py2neo" },
    { id:"t6-3", name:"Semantic Kernel", freq:3,
      topics:[
        {t:"SK kernel & plugin setup",s:"todo"},{t:"Memory & planner components",s:"todo"},
        {t:"Copilot Stack integration",s:"todo"},{t:"Azure OpenAI with SK",s:"todo"},
        {t:"Function calling via SK",s:"todo"},
      ], tools:"semantic-kernel · sk-python · copilot-sdk" },
    { id:"t6-4", name:"System design for AI scale", freq:4,
      topics:[
        {t:"Caching (Redis) for LLM responses",s:"have"},{t:"Async task queues (Celery, RQ)",s:"have"},
        {t:"Kafka for event-driven AI",s:"have"},{t:"Latency budgeting & P99",s:"have"},
        {t:"Horizontal scaling patterns",s:"have"},
      ], tools:"redis · celery · kafka · rabbitmq · dramatiq" },
    { id:"t6-5", name:"NLP fundamentals", freq:3,
      topics:[
        {t:"Transformer architecture (attention)",s:"have"},{t:"BPE & WordPiece tokenisation",s:"have"},
        {t:"Positional encodings",s:"have"},{t:"Self-attention vs cross-attention",s:"have"},
        {t:"Pre-training vs fine-tuning",s:"have"},
      ], tools:"transformers · tokenizers · datasets · einops" },
    { id:"t6-6", name:"Data pipelines for LLMs", freq:3,
      topics:[
        {t:"Airflow DAGs for RAG ingestion",s:"todo"},{t:"Prefect flows & tasks",s:"todo"},
        {t:"Ray for distributed processing",s:"todo"},{t:"Document parsing (PDFs, HTML)",s:"todo"},
        {t:"Pipeline monitoring & alerting",s:"todo"},
      ], tools:"apache-airflow · prefect · ray · unstructured · docling" },
  ],
};

function deriveSkillStatus(topics) {
  const counts = { have:0, learn:0, todo:0 };
  topics.forEach(tp => counts[tp.s]++);
  if (counts.have === topics.length) return "have";
  if (counts.learn > 0 || (counts.have > 0 && counts.todo > 0)) return "learn";
  if (counts.have > 0 && counts.learn === 0 && counts.todo === 0) return "have";
  return "todo";
}

function exportMarkdown(skills) {
  const lines = ["# LLM Engineering — Learned Skills Export", `> As of 9 May 2026\n`];
  TIER_CONFIG.forEach(tier => {
    const tierSkills = skills[tier.id];
    const learned = tierSkills.filter(sk => deriveSkillStatus(sk.topics) === "have");
    if (!learned.length) return;
    lines.push(`## Tier ${tier.num} — ${tier.label}`);
    learned.forEach(sk => {
      lines.push(`\n### ${sk.name}`);
      const knownTopics = sk.topics.filter(tp => tp.s === "have");
      if (knownTopics.length) {
        lines.push("**Topics mastered:**");
        knownTopics.forEach(tp => lines.push(`- ${tp.t}`));
      }
      lines.push(`**Tools:** \`${sk.tools}\``);
    });
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type:"text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "learned_skills.md";
  a.click();
}

function TopicChip({ topic, onChange }) {
  const st = S[topic.s];
  const next = () => onChange(CYCLE[(CYCLE.indexOf(topic.s) + 1) % 3]);
  return (
    <button onClick={next} title={`Click to cycle: ${st.label}`} style={{
      padding:"3px 9px", borderRadius:999, border:`1px solid ${st.border}`,
      background:st.bg, color:st.color, fontSize:11, cursor:"pointer",
      fontWeight:500, transition:"all 0.15s", whiteSpace:"nowrap",
    }}>{topic.t}</button>
  );
}

function SkillRow({ skill, accent, onTopicChange }) {
  const [open, setOpen] = useState(false);
  const status = deriveSkillStatus(skill.topics);
  const st = S[status];
  const haveCount = skill.topics.filter(tp => tp.s === "have").length;

  return (
    <div style={{ borderRadius:8, border:`1px solid ${open ? accent+"55" : "rgba(255,255,255,0.07)"}`, overflow:"hidden", transition:"border-color 0.2s" }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
        cursor:"pointer", background: open ? `rgba(255,255,255,0.04)` : "transparent",
        userSelect:"none",
      }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:st.dot, flexShrink:0 }}/>
        <span style={{ flex:1, fontSize:12, fontWeight:500, color:"#e2e8f0", lineHeight:1.3 }}>{skill.name}</span>
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{haveCount}/{skill.topics.length}</span>
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginLeft:2 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"8px 10px 10px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
            {skill.topics.map((tp, i) => (
              <TopicChip key={i} topic={tp} onChange={s => onTopicChange(i, s)} />
            ))}
          </div>
          <div style={{
            fontFamily:"monospace", fontSize:10, color: accent,
            background:"rgba(0,0,0,0.25)", borderRadius:5, padding:"5px 8px",
            lineHeight:1.6, wordBreak:"break-word",
          }}>{skill.tools}</div>
        </div>
      )}
    </div>
  );
}

function TierColumn({ tier, skills, onTopicChange }) {
  const allTopics = skills.flatMap(sk => sk.topics);
  const haveTopics = allTopics.filter(tp => tp.s === "have").length;
  const pct = Math.round((haveTopics / allTopics.length) * 100);
  const haveSkills = skills.filter(sk => deriveSkillStatus(sk.topics) === "have").length;
  const learnSkills = skills.filter(sk => deriveSkillStatus(sk.topics) === "learn").length;

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      background:tier.bg, border:`1px solid ${tier.border}`,
      borderRadius:12, overflow:"hidden", flex:1, minWidth:0,
    }}>
      <div style={{ background:tier.head, padding:"10px 12px 8px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
          <span style={{
            width:22, height:22, borderRadius:"50%", background:tier.accent,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:800, color:"#0a0f1e", flexShrink:0,
          }}>{tier.num}</span>
          <span style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", lineHeight:1.2 }}>{tier.label}</span>
          <span style={{ marginLeft:"auto", fontSize:13, fontWeight:800, color:tier.accent }}>{pct}%</span>
        </div>
        <div style={{ height:3, borderRadius:2, background:"rgba(0,0,0,0.2)", overflow:"hidden" }}>
          <div style={{ height:"100%", borderRadius:2, background:tier.accent, width:`${pct}%`, transition:"width 0.4s" }}/>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:5 }}>
          <span style={{ fontSize:9, color:S.have.dot }}>● {haveSkills} done</span>
          <span style={{ fontSize:9, color:S.learn.dot }}>● {learnSkills} learning</span>
          <span style={{ fontSize:9, color:S.todo.dot }}>● {skills.length-haveSkills-learnSkills} todo</span>
        </div>
      </div>
      <div style={{ padding:"8px 8px", display:"flex", flexDirection:"column", gap:5, flex:1, overflowY:"auto" }}>
        {skills.map(skill => (
          <SkillRow key={skill.id} skill={skill} accent={tier.accent}
            onTopicChange={(topicIdx, newStatus) => onTopicChange(tier.id, skill.id, topicIdx, newStatus)}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [skills, setSkills] = useState(INIT);

  const handleTopicChange = useCallback((tierId, skillId, topicIdx, newStatus) => {
    setSkills(prev => {
      const next = { ...prev, [tierId]: prev[tierId].map(sk =>
        sk.id !== skillId ? sk : {
          ...sk, topics: sk.topics.map((tp, i) => i === topicIdx ? { ...tp, s: newStatus } : tp)
        }
      )};
      return next;
    });
  }, []);

  const allTopics = Object.values(skills).flatMap(t => t.flatMap(sk => sk.topics));
  const totalHave = allTopics.filter(tp => tp.s === "have").length;
  const totalLearn = allTopics.filter(tp => tp.s === "learn").length;
  const overallPct = Math.round((totalHave / allTopics.length) * 100);

  return (
    <div style={{
      width:"100vw", height:"100vh", background:"#0a0f1e",
      display:"flex", flexDirection:"column",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      color:"#e2e8f0", overflow:"hidden", boxSizing:"border-box",
    }}>
      {/* Header */}
      <div style={{
        padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", gap:16, flexShrink:0,
      }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
            <span style={{
              fontSize:15, fontWeight:800,
              background:"linear-gradient(135deg,#60a5fa,#a78bfa,#34d399)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>LLM Engineering Roadmap</span>
            <span style={{ fontSize:10, color:"#475569" }}>Skills as of 9 May 2026</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
            <div style={{ display:"flex", gap:8 }}>
              {[
                {label:`${totalHave} topics mastered`, color:S.have.dot},
                {label:`${totalLearn} learning`, color:S.learn.dot},
                {label:`${allTopics.length-totalHave-totalLearn} to learn`, color:S.todo.dot},
              ].map(c => (
                <span key={c.label} style={{ fontSize:10, color:c.color }}>● {c.label}</span>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:100, height:4, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:2, width:`${overallPct}%`, transition:"width 0.4s",
                  background:"linear-gradient(90deg,#3b82f6,#a855f7)" }}/>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa" }}>{overallPct}%</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {[S.have,S.learn,S.todo].map(st => (
            <div key={st.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:st.dot, display:"inline-block" }}/>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{st.label}</span>
            </div>
          ))}
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginLeft:4 }}>click topic chips to cycle</span>
        </div>

        <button onClick={() => exportMarkdown(skills)} style={{
          padding:"6px 14px", borderRadius:8,
          border:"1px solid rgba(255,255,255,0.15)",
          background:"rgba(255,255,255,0.05)", color:"#94a3b8",
          fontSize:11, fontWeight:600, cursor:"pointer",
          display:"flex", alignItems:"center", gap:5, flexShrink:0,
          transition:"all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#e2e8f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#94a3b8"; }}
        >
          ↓ Export learned skills
        </button>
      </div>

      {/* 6-column grid */}
      <div style={{
        flex:1, display:"flex", gap:8, padding:"10px 12px",
        overflow:"hidden", minHeight:0,
      }}>
        {TIER_CONFIG.map(tier => (
          <TierColumn key={tier.id} tier={tier} skills={skills[tier.id]}
            onTopicChange={handleTopicChange}
          />
        ))}
      </div>
    </div>
  );
}