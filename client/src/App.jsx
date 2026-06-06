import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "./api.js";

const ADMIN_PASSWORD = "admin2026";
const COLORS = ["#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#f97316","#06b6d4","#84cc16","#ef4444","#a78bfa","#fb923c","#34d399"];

export default function App() {
  const [data, setData] = useState({ participants: [], matches: [], predictions: {} });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("leaderboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [adminSub, setAdminSub] = useState("participants");
  const [newName, setNewName] = useState("");
  const [selParticipant, setSelParticipant] = useState(null);
  const [predInputs, setPredInputs] = useState({});
  const [resultInputs, setResultInputs] = useState({});
  const [dateFilter, setDateFilter] = useState("ALL");
  const [pubDateFilter, setPubDateFilter] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const loadData = useCallback(async () => {
    try {
      const d = await api.get("/api/data");
      setData(d);
    } catch { showToast("Eroare la încărcare date", "err"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const DATES = [...new Set(data.matches.map(m => m.datetime.split(",")[0].trim()))];
  const filteredMatches = (f) => f === "ALL" ? data.matches : data.matches.filter(m => m.datetime.startsWith(f));

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) { setIsAdmin(true); setPwError(false); setPwInput(""); setTab("admin"); }
    else { setPwError(true); setTimeout(() => setPwError(false), 1000); }
  };

  const addParticipant = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const id = Date.now().toString();
      const color = COLORS[data.participants.length % COLORS.length];
      const result = await api.post("/api/participants", { id, name, color });
      if (result.error) { showToast(result.error, "err"); return; }
      await loadData(); setNewName(""); showToast(`${name} adăugat!`);
    } catch { showToast("Eroare server", "err"); }
    finally { setSaving(false); }
  };

  const removeParticipant = async (pid) => {
    try {
      await api.del(`/api/participants/${pid}`);
      await loadData();
      setConfirmDel(null);
      if (selParticipant?.id === pid) setSelParticipant(null);
      showToast("Participant șters.");
    } catch { showToast("Eroare server", "err"); }
  };

  const savePredictions = async () => {
    if (!selParticipant) return;
    const pid = selParticipant.id;
    if (Object.keys(data.predictions[pid] || {}).length > 0) { showToast("Predicțiile sunt deja blocate!", "err"); return; }
    const valid = {};
    let count = 0;
    for (const [mid, val] of Object.entries(predInputs)) {
      if (val.home !== "" && val.away !== "") {
        const h = parseInt(val.home), a = parseInt(val.away);
        if (!isNaN(h) && !isNaN(a) && h >= 0 && a >= 0) { valid[mid] = { home: h, away: a }; count++; }
      }
    }
    if (count === 0) { showToast("Introdu cel puțin o predicție!", "err"); return; }
    setSaving(true);
    try {
      const result = await api.post(`/api/predictions/${pid}`, { predictions: valid });
      if (result.error) { showToast(result.error, "err"); return; }
      await loadData(); setPredInputs({});
      showToast(`${count} predicții salvate pentru ${selParticipant.name}! 🔒`);
    } catch { showToast("Eroare server", "err"); }
    finally { setSaving(false); }
  };

  const saveResult = async (matchId) => {
    const val = resultInputs[matchId];
    if (!val || val.home === "" || val.away === "") return;
    const h = parseInt(val.home), a = parseInt(val.away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    setSaving(true);
    try {
      await api.put(`/api/matches/${matchId}/result`, { homeScore: h, awayScore: a });
      await loadData();
      setResultInputs(prev => { const n = {...prev}; delete n[matchId]; return n; });
      showToast("Rezultat salvat! ✓");
    } catch { showToast("Eroare server", "err"); }
    finally { setSaving(false); }
  };

  const deleteResult = async (matchId) => {
    setSaving(true);
    try {
      await api.del(`/api/matches/${matchId}/result`);
      await loadData();
      showToast("Rezultat șters.");
    } catch { showToast("Eroare server", "err"); }
    finally { setSaving(false); }
  };

  const leaderboard = data.participants.map(p => {
    let correct = 0, total = 0;
    const preds = data.predictions[p.id] || {};
    data.matches.forEach(m => {
      if (!m.played) return;
      const pred = preds[m.id]; if (!pred) return;
      total++;
      if (pred.home === m.homeScore && pred.away === m.awayScore) correct++;
    });
    return { ...p, correct, wrong: total - correct, total };
  }).sort((a, b) => b.correct - a.correct || a.wrong - b.wrong);

  const playedCount = data.matches.filter(m => m.played).length;
  const MEDAL = ["🥇","🥈","🥉"];

  if (loading) return <LoadingScreen />;

  return (
    <div style={{minHeight:"100vh",background:"#080c14",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#e2e8f0"}}>

      <header style={{background:"linear-gradient(90deg,#0d1b2a,#1b2a3b,#0d1b2a)",borderBottom:"2px solid #f59e0b",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(245,158,11,0.2)"}}>
        <div>
          <div style={{fontSize:20,fontWeight:800}}>🏆 <span style={{color:"#f59e0b"}}>CM 2026</span> Predicții</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{playedCount}/{data.matches.length} meciuri · {data.participants.length} participanți</div>
        </div>
        {isAdmin && <button onClick={() => { setIsAdmin(false); setTab("leaderboard"); }} style={{padding:"7px 14px",background:"#1e293b",border:"1px solid #ef4444",borderRadius:8,color:"#ef4444",fontWeight:600,fontSize:12,cursor:"pointer"}}>Logout</button>}
      </header>

      <nav style={{display:"flex",background:"#0d1117",borderBottom:"1px solid #1a2332"}}>
        {[{key:"leaderboard",label:"🏅 Clasament"},{key:"public",label:"📋 Predicții"},{key:isAdmin?"admin":"login",label:isAdmin?"⚙️ Admin":"🔐 Admin"}].map(({key,label}) => (
          <button key={key} onClick={() => setTab(key)} style={{flex:1,padding:"12px 6px",background:tab===key||(tab==="admin"&&key==="admin")?"#f59e0b":"transparent",color:tab===key||(tab==="admin"&&key==="admin")?"#000":"#64748b",border:"none",cursor:"pointer",fontWeight:tab===key?700:500,fontSize:13,transition:"all 0.15s"}}>{label}</button>
        ))}
      </nav>

      <main style={{maxWidth:680,margin:"0 auto",padding:"16px 12px 100px"}}>

        {/* LOGIN */}
        {tab==="login" && (
          <div style={{maxWidth:320,margin:"60px auto",textAlign:"center"}}>
            <div style={{background:"#111827",borderRadius:16,padding:32,border:"1px solid #1f2937"}}>
              <div style={{fontSize:44,marginBottom:16}}>🔐</div>
              <h2 style={{margin:"0 0 20px",color:"#f1f5f9",fontSize:18}}>Acces Administrator</h2>
              <input type="password" placeholder="Parolă admin" value={pwInput} onChange={e=>setPwInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                style={{width:"100%",padding:"11px 14px",background:pwError?"#3f0a0a":"#0f172a",border:`2px solid ${pwError?"#ef4444":"#1f2937"}`,borderRadius:10,color:"#f1f5f9",fontSize:15,boxSizing:"border-box",outline:"none"}}/>
              {pwError && <div style={{color:"#ef4444",fontSize:12,marginTop:6}}>Parolă incorectă!</div>}
              <button onClick={handleLogin} style={{width:"100%",marginTop:14,padding:"12px",background:"linear-gradient(90deg,#f59e0b,#f97316)",border:"none",borderRadius:10,color:"#000",fontWeight:700,fontSize:15,cursor:"pointer"}}>Autentificare</button>
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        {tab==="leaderboard" && (
          <div>
            <h2 style={{textAlign:"center",color:"#f59e0b",marginBottom:20,fontSize:18}}>🏅 Clasament Live</h2>
            {leaderboard.length===0 ? <EmptyState icon="👥" text="Niciun participant încă." /> : (
              <>
                {leaderboard.map((p,i) => (
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,background:i===0?"linear-gradient(90deg,#1a1200,#2a1e00)":i===1?"linear-gradient(90deg,#0f1520,#1a2030)":"linear-gradient(90deg,#120a00,#1e1000)",border:`1px solid ${i===0?"#f59e0b33":i===1?"#94a3b833":"#92400e33"}`,borderRadius:12,padding:"13px 15px",marginBottom:9,transform:i===0?"scale(1.01)":"scale(1)"}}>
                    <div style={{fontSize:i<3?22:15,width:36,textAlign:"center",fontWeight:800,color:i>=3?"#64748b":"inherit"}}>{i<3?MEDAL[i]:`#${i+1}`}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:7}}>
                        <span style={{width:9,height:9,borderRadius:"50%",background:p.color,display:"inline-block",flexShrink:0}}/>{p.name}
                      </div>
                      <div style={{fontSize:11,color:"#475569",marginTop:2}}>{p.total} predicții introduse</div>
                    </div>
                    <div style={{textAlign:"right",minWidth:44}}>
                      <div style={{color:"#10b981",fontWeight:800,fontSize:20}}>{p.correct}</div>
                      <div style={{fontSize:10,color:"#475569"}}>corecte</div>
                    </div>
                    <div style={{textAlign:"right",minWidth:36}}>
                      <div style={{color:"#ef4444",fontWeight:700,fontSize:16}}>{p.wrong}</div>
                      <div style={{fontSize:10,color:"#475569"}}>greșite</div>
                    </div>
                  </div>
                ))}

                <div style={{background:"#111827",borderRadius:14,padding:"18px 14px",border:"1px solid #1f2937",marginTop:20,marginBottom:16}}>
                  <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>Predicții corecte vs greșite</div>
                  <div style={{fontSize:10,color:"#334155",marginBottom:14}}>↑ corecte &nbsp;·&nbsp; ↓ greșite</div>
                  <ResponsiveContainer width="100%" height={Math.max(220, leaderboard.length * 52)}>
                    <BarChart data={leaderboard.map(p=>({...p,firstName:p.name.split(" ")[0],wrongNeg:-p.wrong}))} margin={{left:-16,right:8,top:8,bottom:8}}>
                      <XAxis dataKey="firstName" tick={{fill:"#94a3b8",fontSize:11,fontWeight:500}} tickLine={false} axisLine={{stroke:"#1f2937"}}/>
                      <YAxis tick={{fill:"#64748b",fontSize:10}} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={v=>Math.abs(v)}/>
                      <Tooltip contentStyle={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:8,fontSize:12}} labelFormatter={(l)=>leaderboard.find(p=>p.name.startsWith(l))?.name||l} labelStyle={{color:"#f1f5f9",fontWeight:600}} formatter={(v,n)=>[Math.abs(v),n]}/>
                      <Bar dataKey="correct" name="Corecte" fill="#10b981" radius={[4,4,0,0]}/>
                      <Bar dataKey="wrongNeg" name="Greșite" fill="#ef4444" radius={[0,0,4,4]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{background:"#111827",borderRadius:14,padding:"18px 14px",border:"1px solid #1f2937"}}>
                  <div style={{fontSize:12,color:"#64748b",marginBottom:14}}>Rata de succes (%)</div>
                  {leaderboard.map(p => {
                    const pct = p.total>0?Math.round((p.correct/p.total)*100):0;
                    return (
                      <div key={p.id} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                          <span>{p.name}</span><span style={{color:p.color,fontWeight:700}}>{pct}%</span>
                        </div>
                        <div style={{background:"#0d1117",borderRadius:999,height:7,overflow:"hidden"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${p.color},${p.color}88)`,borderRadius:999,transition:"width 0.5s ease"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* PUBLIC */}
        {tab==="public" && (
          <div>
            <h2 style={{color:"#f59e0b",marginBottom:14,fontSize:18}}>📋 Predicții per meci</h2>
            <DateFilter dates={DATES} value={pubDateFilter} onChange={setPubDateFilter} accent="#3b82f6"/>
            {filteredMatches(pubDateFilter).map(match => (
              <PublicMatchCard key={match.id} match={match} participants={data.participants} predictions={data.predictions}/>
            ))}
          </div>
        )}

        {/* ADMIN */}
        {tab==="admin" && isAdmin && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {[{key:"participants",label:"👥 Participanți"},{key:"predictions",label:"✏️ Predicții"},{key:"results",label:"⚽ Rezultate"}].map(({key,label}) => (
                <button key={key} onClick={()=>setAdminSub(key)} style={{flex:1,padding:"10px 4px",borderRadius:10,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:adminSub===key?"#f59e0b":"#111827",color:adminSub===key?"#000":"#64748b"}}>{label}</button>
              ))}
            </div>

            {adminSub==="participants" && (
              <div>
                <div style={{background:"#111827",borderRadius:14,padding:18,border:"1px solid #1f2937",marginBottom:16}}>
                  <h3 style={{margin:"0 0 14px",fontSize:15}}>Adaugă participant</h3>
                  <div style={{display:"flex",gap:8}}>
                    <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addParticipant()} placeholder="Nume și prenume coleg"
                      style={{flex:1,padding:"10px 13px",background:"#0d1117",border:"1px solid #1f2937",borderRadius:10,color:"#f1f5f9",fontSize:14,outline:"none"}}/>
                    <button onClick={addParticipant} disabled={saving} style={{padding:"10px 16px",background:"#f59e0b",border:"none",borderRadius:10,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer",opacity:saving?0.6:1}}>{saving?"...":"Adaugă"}</button>
                  </div>
                </div>
                {data.participants.length===0 ? <EmptyState icon="👤" text="Niciun participant. Adaugă primul coleg!"/> : (
                  data.participants.map(p => {
                    const predCount = Object.keys(data.predictions[p.id]||{}).length;
                    return (
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,background:"#111827",borderRadius:12,padding:"13px 15px",border:"1px solid #1f2937",marginBottom:9}}>
                        <div style={{width:9,height:9,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:14}}>{p.name}</div>
                          <div style={{fontSize:11,color:"#475569"}}>{predCount>0?`${predCount} predicții 🔒`:"Fără predicții"}</div>
                        </div>
                        <button onClick={()=>setConfirmDel(p)} style={{padding:"6px 12px",background:"#1e293b",border:"1px solid #ef4444",borderRadius:8,color:"#ef4444",fontWeight:600,fontSize:12,cursor:"pointer"}}>Șterge</button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {adminSub==="predictions" && (
              <div>
                {data.participants.length===0 ? <EmptyState icon="👥" text="Adaugă participanți mai întâi!"/> : (
                  <>
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>Selectează participantul:</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                        {data.participants.map(p => {
                          const locked = Object.keys(data.predictions[p.id]||{}).length>0;
                          return <button key={p.id} onClick={()=>{setSelParticipant(p);setPredInputs({});setDateFilter("ALL");}} style={{padding:"7px 13px",borderRadius:999,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:selParticipant?.id===p.id?p.color:"#111827",color:selParticipant?.id===p.id?"#000":"#94a3b8",opacity:locked?0.65:1}}>{p.name} {locked?"🔒":""}</button>;
                        })}
                      </div>
                    </div>
                    {selParticipant && (()=>{
                      const locked = Object.keys(data.predictions[selParticipant.id]||{}).length>0;
                      const existing = data.predictions[selParticipant.id]||{};
                      return (
                        <div>
                          {locked && <div style={{background:"#1c1400",border:"1px solid #78350f",borderRadius:10,padding:"11px 14px",marginBottom:14,color:"#fbbf24",fontSize:12}}>🔒 Predicțiile lui <strong>{selParticipant.name}</strong> sunt blocate definitiv.</div>}
                          <DateFilter dates={DATES} value={dateFilter} onChange={setDateFilter} accent="#f59e0b"/>
                          {filteredMatches(dateFilter).map(match => {
                            const ep = existing[match.id];
                            const cur = predInputs[match.id]||{home:"",away:""};
                            return (
                              <div key={match.id} style={{background:"#111827",borderRadius:12,padding:"12px 14px",border:"1px solid #1f2937",marginBottom:9}}>
                                <div style={{fontSize:10,color:"#475569",marginBottom:7}}>{match.datetime}</div>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <div style={{flex:1,textAlign:"right",fontSize:13,fontWeight:600,lineHeight:1.3}}>{match.home}</div>
                                  {ep ? (
                                    <div style={{background:"#0d1117",borderRadius:8,padding:"7px 14px",border:"1px solid #1f2937",display:"flex",gap:4,alignItems:"center"}}>
                                      <span style={{color:"#f59e0b",fontWeight:700}}>{ep.home}</span><span style={{color:"#334155"}}>:</span><span style={{color:"#f59e0b",fontWeight:700}}>{ep.away}</span>
                                    </div>
                                  ) : locked ? <div style={{color:"#334155",fontSize:13,padding:"0 12px"}}>—</div> : (
                                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                                      <ScoreInput value={cur.home} onChange={v=>setPredInputs(p=>({...p,[match.id]:{...cur,home:v}}))}/>
                                      <span style={{color:"#334155"}}>-</span>
                                      <ScoreInput value={cur.away} onChange={v=>setPredInputs(p=>({...p,[match.id]:{...cur,away:v}}))}/>
                                    </div>
                                  )}
                                  <div style={{flex:1,fontSize:13,fontWeight:600,lineHeight:1.3}}>{match.away}</div>
                                </div>
                              </div>
                            );
                          })}
                          {!locked && <button onClick={savePredictions} disabled={saving} style={{width:"100%",padding:"13px",marginTop:10,background:"linear-gradient(90deg,#f59e0b,#f97316)",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:15,cursor:"pointer",opacity:saving?0.6:1}}>{saving?"Se salvează...":"💾 Blochează predicțiile lui "+selParticipant.name}</button>}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {adminSub==="results" && (
              <div>
                <div style={{background:"#0d1a12",border:"1px solid #14532d",borderRadius:10,padding:"11px 14px",marginBottom:14,color:"#86efac",fontSize:12}}>⚽ Introdu scorul final. Meciurile validate pot fi editate sau șterse.</div>
                <DateFilter dates={DATES} value={dateFilter} onChange={setDateFilter} accent="#10b981"/>
                {filteredMatches(dateFilter).map(match => {
                  const cur = resultInputs[match.id]||{home:"",away:""};
                  const isEditing = !!resultInputs[match.id];
                  return (
                    <div key={match.id} style={{background:match.played&&!isEditing?"#050f09":"#111827",borderRadius:12,padding:"12px 14px",border:`1px solid ${match.played&&!isEditing?"#14532d":"#1f2937"}`,marginBottom:9}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                        <span style={{fontSize:10,color:"#475569"}}>{match.datetime}</span>
                        {match.played && !isEditing && <span style={{fontSize:10,color:"#10b981",marginLeft:"auto"}}>✓ Validat</span>}
                        {isEditing && <span style={{fontSize:10,color:"#f59e0b",marginLeft:"auto"}}>✏️ Editare...</span>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,textAlign:"right",fontSize:13,fontWeight:600,lineHeight:1.3}}>{match.home}</div>

                        {match.played && !isEditing ? (
                          /* ── Validat: afișează scorul + butoane Edit/Delete ── */
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <div style={{background:"#071a0f",borderRadius:8,padding:"7px 12px",border:"1px solid #14532d",display:"flex",gap:4,alignItems:"center"}}>
                              <span style={{color:"#10b981",fontWeight:800,fontSize:16}}>{match.homeScore}</span>
                              <span style={{color:"#334155"}}>:</span>
                              <span style={{color:"#10b981",fontWeight:800,fontSize:16}}>{match.awayScore}</span>
                            </div>
                            <button
                              onClick={() => setResultInputs(p=>({...p,[match.id]:{home:match.homeScore,away:match.awayScore}}))}
                              style={{padding:"6px 10px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:8,color:"#60a5fa",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteResult(match.id)}
                              disabled={saving}
                              style={{padding:"6px 10px",background:"#3f0a0a",border:"1px solid #ef4444",borderRadius:8,color:"#f87171",fontWeight:700,fontSize:12,cursor:"pointer",opacity:saving?0.6:1}}>
                              🗑️
                            </button>
                          </div>
                        ) : (
                          /* ── Nevalidat sau în editare: inputs + salvare ── */
                          <div style={{display:"flex",gap:5,alignItems:"center"}}>
                            <ScoreInput value={cur.home} onChange={v=>setResultInputs(p=>({...p,[match.id]:{...cur,home:v}}))} green/>
                            <span style={{color:"#334155"}}>-</span>
                            <ScoreInput value={cur.away} onChange={v=>setResultInputs(p=>({...p,[match.id]:{...cur,away:v}}))} green/>
                            <button onClick={()=>saveResult(match.id)} disabled={saving}
                              style={{padding:"7px 11px",background:"#10b981",border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:12,cursor:"pointer",opacity:saving?0.6:1}}>✓</button>
                            {isEditing && (
                              <button onClick={()=>setResultInputs(p=>{const n={...p};delete n[match.id];return n;})}
                                style={{padding:"7px 10px",background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",fontWeight:700,fontSize:12,cursor:"pointer"}}>✕</button>
                            )}
                          </div>
                        )}

                        <div style={{flex:1,fontSize:13,fontWeight:600,lineHeight:1.3}}>{match.away}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {toast && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#7f1d1d":"#052e16",border:`1px solid ${toast.type==="err"?"#ef4444":"#16a34a"}`,color:"#f1f5f9",padding:"11px 20px",borderRadius:12,fontWeight:600,fontSize:13,zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,0.6)",whiteSpace:"nowrap"}}>
          {toast.msg}
        </div>
      )}

      {confirmDel && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#111827",borderRadius:16,padding:28,border:"1px solid #ef4444",maxWidth:300,width:"100%"}}>
            <div style={{fontSize:32,textAlign:"center",marginBottom:10}}>⚠️</div>
            <p style={{textAlign:"center",color:"#94a3b8",fontSize:14,margin:"0 0 20px"}}>Ștergi pe <strong style={{color:"#f1f5f9"}}>{confirmDel.name}</strong> și toate predicțiile sale?</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirmDel(null)} style={{flex:1,padding:11,background:"#1e293b",border:"none",borderRadius:10,color:"#f1f5f9",cursor:"pointer",fontWeight:600}}>Anulează</button>
              <button onClick={()=>removeParticipant(confirmDel.id)} style={{flex:1,padding:11,background:"#ef4444",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontWeight:700}}>Șterge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DateFilter({ dates, value, onChange, accent }) {
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
      {["ALL",...dates].map(d => (
        <button key={d} onClick={()=>onChange(d)} style={{padding:"5px 11px",borderRadius:999,border:"none",cursor:"pointer",background:value===d?accent:"#111827",color:value===d?"#000":"#64748b",fontWeight:value===d?700:400,fontSize:11,whiteSpace:"nowrap",flexShrink:0}}>
          {d==="ALL"?"Toate":d}
        </button>
      ))}
    </div>
  );
}

function PublicMatchCard({ match, participants, predictions }) {
  const [open, setOpen] = useState(false);
  const preds = participants.map(p => {
    const pred = (predictions[p.id]||{})[match.id];
    if (!pred) return null;
    const status = match.played ? (pred.home===match.homeScore && pred.away===match.awayScore ? "correct" : "wrong") : "pending";
    return { ...p, pred, status };
  }).filter(Boolean);

  return (
    <div style={{background:match.played?"#050f09":"#111827",borderRadius:12,marginBottom:10,border:`1px solid ${match.played?"#14532d":"#1a2332"}`,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",cursor:"pointer"}} onClick={()=>setOpen(!open)}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
          <span style={{fontSize:10,color:"#475569"}}>{match.datetime}</span>
          {match.played && <span style={{fontSize:10,color:"#10b981"}}>⚽ Final</span>}
          <span style={{marginLeft:"auto",fontSize:11,color:"#334155"}}>{preds.length} pred. {open?"▲":"▼"}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,textAlign:"right",fontWeight:600,fontSize:13,lineHeight:1.3}}>{match.home}</div>
          <div style={{background:match.played?"#071a0f":"#0d1117",border:`1px solid ${match.played?"#14532d":"#1f2937"}`,borderRadius:8,padding:"6px 12px",fontWeight:700,fontSize:15,color:match.played?"#10b981":"#334155",whiteSpace:"nowrap"}}>
            {match.played?`${match.homeScore} : ${match.awayScore}`:"? : ?"}
          </div>
          <div style={{flex:1,fontWeight:600,fontSize:13,lineHeight:1.3}}>{match.away}</div>
        </div>
      </div>
      {open && (
        <div style={{borderTop:"1px solid #1a2332",padding:"10px 14px"}}>
          {preds.length===0 ? <div style={{color:"#334155",fontSize:12,textAlign:"center"}}>Nicio predicție introdusă.</div>
          : preds.map(p => (
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:p.color,flexShrink:0}}/>
              <span style={{flex:1,fontSize:12}}>{p.name}</span>
              <span style={{fontSize:12,fontWeight:700,color:p.status==="correct"?"#10b981":p.status==="wrong"?"#ef4444":"#f59e0b"}}>{p.pred.home} : {p.pred.away}</span>
              <span style={{fontSize:14}}>{p.status==="correct"?"✅":p.status==="wrong"?"❌":"⏳"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return <div style={{textAlign:"center",padding:"44px 20px",color:"#334155"}}><div style={{fontSize:44,marginBottom:10}}>{icon}</div><div style={{fontSize:13}}>{text}</div></div>;
}

function ScoreInput({ value, onChange, green }) {
  return <input type="number" min="0" max="20" value={value} onChange={e=>onChange(e.target.value)} placeholder="0"
    style={{width:42,padding:"7px 4px",background:"#0d1117",border:`1px solid ${green?"#14532d":"#1f2937"}`,borderRadius:8,color:green?"#10b981":"#f59e0b",fontSize:15,fontWeight:700,textAlign:"center",outline:"none"}}/>;
}

function LoadingScreen() {
  const [dots, setDots] = useState(".");
  const [showSleepMsg, setShowSleepMsg] = useState(false);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? "." : d + ".");
    }, 500);
    // după 4 secunde, arată mesajul despre sleep
    const sleepTimer = setTimeout(() => setShowSleepMsg(true), 4000);
    return () => { clearInterval(dotsInterval); clearTimeout(sleepTimer); };
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"#080c14",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20,fontFamily:"sans-serif",padding:24,textAlign:"center"}}>
      <div style={{fontSize:56}}>🏆</div>
      <div style={{color:"#f59e0b",fontWeight:800,fontSize:20}}>CM 2026 Predicții</div>

      {/* spinner */}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:10, height:10, borderRadius:"50%", background:"#f59e0b",
            animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite alternate`,
          }}/>
        ))}
      </div>

      <div style={{color:"#475569",fontSize:14}}>Se încarcă{dots}</div>

      {showSleepMsg && (
        <div style={{
          background:"#111827", border:"1px solid #1f2937",
          borderRadius:14, padding:"16px 20px",
          maxWidth:320, marginTop:8,
        }}>
          <div style={{fontSize:22,marginBottom:8}}>😴</div>
          <div style={{color:"#94a3b8",fontSize:13,lineHeight:1.6}}>
            Serverul era în repaus.<br/>
            <span style={{color:"#f59e0b",fontWeight:600}}>Se trezește în ~20-30 secunde</span>
            <br/>
            <span style={{color:"#475569",fontSize:12}}>Toate datele sunt salvate, nu s-a pierdut nimic.</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.4; }
          to   { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
