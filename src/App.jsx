import { useState, useCallback, useEffect, useRef } from "react";
import { INIT } from "./data.js";

const OWNER  = "The-Anil";
const REPO   = "LLMLearningPathTracker";
const GH_API = "https://api.github.com";

const TIER_CONFIG = [
  { id:"T1", num:1, label:"Foundation",  accent:"#22c55e", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.2)",  head:"rgba(34,197,94,0.15)"  },
  { id:"T2", num:2, label:"Agentic AI",  accent:"#3b82f6", bg:"rgba(59,130,246,0.08)", border:"rgba(59,130,246,0.2)", head:"rgba(59,130,246,0.15)" },
  { id:"T3", num:3, label:"LLMOps",      accent:"#a855f7", bg:"rgba(168,85,247,0.08)", border:"rgba(168,85,247,0.2)", head:"rgba(168,85,247,0.15)" },
  { id:"T4", num:4, label:"Fine-tuning", accent:"#f59e0b", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.2)", head:"rgba(245,158,11,0.15)" },
  { id:"T5", num:5, label:"Cloud & Infra",accent:"#06b6d4", bg:"rgba(6,182,212,0.08)",  border:"rgba(6,182,212,0.2)",  head:"rgba(6,182,212,0.15)"  },
  { id:"T6", num:6, label:"Advanced",    accent:"#f43f5e", bg:"rgba(244,63,94,0.08)",  border:"rgba(244,63,94,0.2)",  head:"rgba(244,63,94,0.15)"  },
];

const S = {
  have:  { label:"Know it",  color:"#16a34a", bg:"rgba(22,163,74,0.18)",  border:"rgba(22,163,74,0.4)",  dot:"#22c55e" },
  learn: { label:"Learning", color:"#2563eb", bg:"rgba(37,99,235,0.18)",  border:"rgba(37,99,235,0.4)",  dot:"#3b82f6" },
  todo:  { label:"To learn", color:"#b91c1c", bg:"rgba(185,28,28,0.18)",  border:"rgba(185,28,28,0.4)",  dot:"#ef4444" },
};
const CYCLE = ["have","learn","todo"];

function deriveSkillStatus(topics) {
  const counts = { have:0, learn:0, todo:0 };
  topics.forEach(tp => counts[tp.s]++);
  if (counts.have === topics.length) return "have";
  if (counts.learn > 0 || (counts.have > 0 && counts.todo > 0)) return "learn";
  if (counts.have > 0 && counts.learn === 0 && counts.todo === 0) return "have";
  return "todo";
}

function exportMarkdown(skills) {
  const lines = ["# LLM Engineering — Learned Skills Export", `> As of ${new Date().toLocaleDateString("en-GB", {day:"numeric",month:"long",year:"numeric"})}\n`];
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
        cursor:"pointer", background: open ? "rgba(255,255,255,0.04)" : "transparent",
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
            fontFamily:"monospace", fontSize:10, color:accent,
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
  const haveSkills  = skills.filter(sk => deriveSkillStatus(sk.topics) === "have").length;
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

// ─── PAT Modal ────────────────────────────────────────────────────────────────
function PatModal({ onConfirm, onCancel }) {
  const [val, setVal] = useState("");
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:100,
    }}>
      <div style={{
        background:"#131929", border:"1px solid rgba(255,255,255,0.12)",
        borderRadius:12, padding:"24px 28px", width:420, maxWidth:"90vw",
      }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", marginBottom:8 }}>
          GitHub PAT required
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:16, lineHeight:1.6 }}>
          Create a <strong style={{color:"#94a3b8"}}>Fine-Grained PAT</strong> scoped to{" "}
          <code style={{color:"#60a5fa"}}>The-Anil/LLMLearningPathTracker</code> with:<br/>
          &nbsp;• <strong style={{color:"#94a3b8"}}>Actions:</strong> Read &amp; Write<br/>
          &nbsp;• <strong style={{color:"#94a3b8"}}>Contents:</strong> Read &amp; Write<br/><br/>
          Stored only in <em>your</em> browser's localStorage — never sent anywhere except{" "}
          <code style={{color:"#60a5fa"}}>api.github.com</code>.
        </div>
        <input
          type="password"
          placeholder="github_pat_..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && val.trim() && onConfirm(val.trim())}
          autoFocus
          style={{
            width:"100%", boxSizing:"border-box", padding:"8px 10px",
            borderRadius:7, border:"1px solid rgba(255,255,255,0.15)",
            background:"rgba(0,0,0,0.3)", color:"#e2e8f0", fontSize:12,
            outline:"none", marginBottom:12,
          }}
        />
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{
            padding:"6px 14px", borderRadius:7, border:"1px solid rgba(255,255,255,0.1)",
            background:"transparent", color:"#64748b", fontSize:11, cursor:"pointer",
          }}>Cancel</button>
          <button
            onClick={() => val.trim() && onConfirm(val.trim())}
            disabled={!val.trim()}
            style={{
              padding:"6px 14px", borderRadius:7, border:"none",
              background: val.trim() ? "#3b82f6" : "#1e3a5f",
              color: val.trim() ? "#fff" : "#64748b",
              fontSize:11, fontWeight:600, cursor: val.trim() ? "pointer" : "default",
            }}
          >Save &amp; Sync</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sync Overlay ─────────────────────────────────────────────────────────────
function SyncOverlay({ state, msg, onRetry, onCancel }) {
  const isActive = state === "triggering" || state === "polling-update" || state === "polling-deploy";
  const isError  = state === "error";
  const isDone   = state === "done";

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(10,15,30,0.88)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:90,
    }}>
      <div style={{
        background:"#131929", border:"1px solid rgba(255,255,255,0.12)",
        borderRadius:14, padding:"32px 36px", textAlign:"center", minWidth:320,
      }}>
        {isActive && (
          <div style={{ marginBottom:20 }}>
            <Spinner />
          </div>
        )}
        {isDone && (
          <div style={{ fontSize:32, marginBottom:16 }}>✓</div>
        )}
        {isError && (
          <div style={{ fontSize:28, marginBottom:16 }}>✗</div>
        )}
        <div style={{
          fontSize:13, fontWeight:600,
          color: isError ? "#f87171" : isDone ? "#4ade80" : "#e2e8f0",
          marginBottom:6,
        }}>
          {isError ? "Sync failed" : isDone ? "Sync complete!" : "Syncing to GitHub…"}
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginBottom:20 }}>{msg}</div>
        {(isError || isDone) && (
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            {isError && (
              <>
                <button onClick={onRetry} style={{
                  padding:"6px 14px", borderRadius:7, border:"none",
                  background:"#3b82f6", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer",
                }}>Retry</button>
                <button onClick={() => { localStorage.removeItem("llm-tracker-pat"); onCancel(); }} style={{
                  padding:"6px 14px", borderRadius:7, border:"1px solid rgba(255,255,255,0.1)",
                  background:"transparent", color:"#64748b", fontSize:11, cursor:"pointer",
                }}>Clear PAT &amp; cancel</button>
              </>
            )}
            {isDone && (
              <button onClick={onCancel} style={{
                padding:"6px 14px", borderRadius:7, border:"1px solid rgba(255,255,255,0.1)",
                background:"transparent", color:"#94a3b8", fontSize:11, cursor:"pointer",
              }}>Close</button>
            )}
          </div>
        )}
        {isActive && (
          <button onClick={onCancel} style={{
            padding:"4px 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.08)",
            background:"transparent", color:"#475569", fontSize:10, cursor:"pointer",
          }}>Cancel</button>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width:36, height:36, borderRadius:"50%",
      border:"3px solid rgba(59,130,246,0.2)",
      borderTopColor:"#3b82f6",
      animation:"spin 0.8s linear infinite",
      margin:"0 auto",
    }}/>
  );
}

// ─── GitHub sync helpers ───────────────────────────────────────────────────────
async function triggerWorkflow(pat, skillsJson) {
  const res = await fetch(
    `${GH_API}/repos/${OWNER}/${REPO}/actions/workflows/update-data.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref:"main", inputs:{ skills_json: skillsJson } }),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
}

async function pollForRun(pat, event, workflowName, afterIso, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(5000);
    const res = await fetch(
      `${GH_API}/repos/${OWNER}/${REPO}/actions/runs?event=${event}&per_page=10`,
      { headers: { Authorization:`Bearer ${pat}`, Accept:"application/vnd.github+json" } }
    );
    if (!res.ok) continue;
    const { workflow_runs } = await res.json();
    const run = workflow_runs.find(r => r.name === workflowName && new Date(r.created_at) >= new Date(afterIso));
    if (run) return run.id;
  }
  throw new Error("Timed out waiting for workflow run to appear.");
}

async function waitForRunCompletion(pat, runId, timeoutMs = 300_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(6000);
    const res = await fetch(
      `${GH_API}/repos/${OWNER}/${REPO}/actions/runs/${runId}`,
      { headers: { Authorization:`Bearer ${pat}`, Accept:"application/vnd.github+json" } }
    );
    if (!res.ok) continue;
    const run = await res.json();
    if (run.status === "completed") return run.conclusion;
  }
  throw new Error("Timed out waiting for workflow to complete.");
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [skills, setSkills] = useState(() => {
    try { return JSON.parse(localStorage.getItem("llm-tracker")) || INIT; }
    catch { return INIT; }
  });

  useEffect(() => {
    localStorage.setItem("llm-tracker", JSON.stringify(skills));
  }, [skills]);

  const [syncState, setSyncState] = useState("idle");
  const [syncMsg,   setSyncMsg]   = useState("");
  const cancelRef = useRef(false);

  const handleTopicChange = useCallback((tierId, skillId, topicIdx, newStatus) => {
    setSkills(prev => ({
      ...prev,
      [tierId]: prev[tierId].map(sk =>
        sk.id !== skillId ? sk : {
          ...sk,
          topics: sk.topics.map((tp, i) => i === topicIdx ? { ...tp, s: newStatus } : tp),
        }
      ),
    }));
  }, []);

  const startSync = useCallback(async (pat) => {
    cancelRef.current = false;
    const skillsSnap = JSON.parse(localStorage.getItem("llm-tracker") || "{}");
    const skillsJson = JSON.stringify(skillsSnap);

    try {
      setSyncState("triggering");
      setSyncMsg("Triggering GitHub Actions workflow…");
      const triggerTime = new Date().toISOString();
      await triggerWorkflow(pat, skillsJson);

      if (cancelRef.current) return;
      setSyncState("polling-update");
      setSyncMsg("Waiting for skill data update…");
      const updateRunId = await pollForRun(pat, "workflow_dispatch", "Update Skill Data", triggerTime);
      if (cancelRef.current) return;

      const updateConclusion = await waitForRunCompletion(pat, updateRunId);
      if (cancelRef.current) return;
      if (updateConclusion !== "success") throw new Error(`Update workflow ended with: ${updateConclusion}`);

      setSyncState("polling-deploy");
      setSyncMsg("Waiting for GitHub Pages deploy…");
      try {
        // 45s timeout: if no deploy run appears, update-data.yml made no commit
        // (data was unchanged). Reload is still correct — localStorage has the right state.
        const deployRunId = await pollForRun(pat, "push", "Deploy to GitHub Pages", triggerTime, 45_000);
        if (cancelRef.current) return;

        const deployConclusion = await waitForRunCompletion(pat, deployRunId);
        if (cancelRef.current) return;
        if (deployConclusion !== "success") throw new Error(`Deploy workflow ended with: ${deployConclusion}`);
      } catch (err) {
        if (!err.message.startsWith("Timed out waiting for workflow run")) throw err;
        // No deploy triggered — data was already up to date. Fall through to reload.
      }

      setSyncState("done");
      setSyncMsg("Skills saved to repo. Reloading page…");
      setTimeout(() => window.location.reload(), 2500);

    } catch (err) {
      if (!cancelRef.current) {
        setSyncState("error");
        setSyncMsg(err.message);
      }
    }
  }, []);

  const handleSyncClick = useCallback(() => {
    const pat = localStorage.getItem("llm-tracker-pat") || "";
    if (!pat) {
      setSyncState("waiting-pat");
    } else {
      startSync(pat);
    }
  }, [startSync]);

  const handlePatConfirm = useCallback((pat) => {
    localStorage.setItem("llm-tracker-pat", pat);
    setSyncState("idle");
    startSync(pat);
  }, [startSync]);

  const cancelSync = useCallback(() => {
    cancelRef.current = true;
    setSyncState("idle");
    setSyncMsg("");
  }, []);

  const clearPat = useCallback(() => {
    localStorage.removeItem("llm-tracker-pat");
  }, []);

  const allTopics  = Object.values(skills).flatMap(t => t.flatMap(sk => sk.topics));
  const totalHave  = allTopics.filter(tp => tp.s === "have").length;
  const totalLearn = allTopics.filter(tp => tp.s === "learn").length;
  const overallPct = Math.round((totalHave / allTopics.length) * 100);

  const hasPat = !!localStorage.getItem("llm-tracker-pat");

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
              <span style={{ fontSize:10, color:"#475569" }}>
                Skills tracker · {new Date().getFullYear()}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
              <div style={{ display:"flex", gap:8 }}>
                {[
                  { label:`${totalHave} topics mastered`,  color:S.have.dot  },
                  { label:`${totalLearn} learning`,        color:S.learn.dot },
                  { label:`${allTopics.length-totalHave-totalLearn} to learn`, color:S.todo.dot },
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
            {[S.have, S.learn, S.todo].map(st => (
              <div key={st.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:st.dot, display:"inline-block" }}/>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{st.label}</span>
              </div>
            ))}
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginLeft:4 }}>click topic chips to cycle</span>
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
            <button onClick={() => exportMarkdown(skills)} style={{
              padding:"6px 14px", borderRadius:8,
              border:"1px solid rgba(255,255,255,0.15)",
              background:"rgba(255,255,255,0.05)", color:"#94a3b8",
              fontSize:11, fontWeight:600, cursor:"pointer",
              display:"flex", alignItems:"center", gap:5,
              transition:"all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#e2e8f0"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#94a3b8"; }}
            >↓ Export .md</button>

            <button onClick={handleSyncClick} style={{
              padding:"6px 14px", borderRadius:8,
              border:"1px solid rgba(59,130,246,0.4)",
              background:"rgba(59,130,246,0.12)", color:"#60a5fa",
              fontSize:11, fontWeight:600, cursor:"pointer",
              display:"flex", alignItems:"center", gap:5,
              transition:"all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(59,130,246,0.25)"; e.currentTarget.style.color="#93c5fd"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(59,130,246,0.12)"; e.currentTarget.style.color="#60a5fa"; }}
              title="Sync progress to GitHub repo (requires PAT)"
            >⬆ Sync to GitHub</button>

            {hasPat && (
              <button onClick={clearPat} title="Clear saved GitHub PAT" style={{
                padding:"5px 8px", borderRadius:7,
                border:"1px solid rgba(255,255,255,0.08)",
                background:"transparent", color:"rgba(255,255,255,0.25)",
                fontSize:11, cursor:"pointer",
              }}>⚙</button>
            )}
          </div>
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

      {/* Modals / overlays */}
      {syncState === "waiting-pat" && (
        <PatModal
          onConfirm={handlePatConfirm}
          onCancel={cancelSync}
        />
      )}
      {["triggering","polling-update","polling-deploy","done","error"].includes(syncState) && (
        <SyncOverlay
          state={syncState}
          msg={syncMsg}
          onRetry={handleSyncClick}
          onCancel={cancelSync}
        />
      )}
    </>
  );
}
