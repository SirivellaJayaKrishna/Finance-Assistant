import { useState, useEffect, useCallback } from 'react'
import { api } from './api.js'

// ── Category palette & icons ───────────────────────────────────────────────
const PALETTE = ['#2dd4bf','#a78bfa','#fb923c','#f472b6','#facc15','#4ade80','#60a5fa','#e879f9','#f87171','#34d399']
const CAT_ICON = { food:'🍜', transport:'🚗', shopping:'🛍️', utilities:'⚡', entertainment:'🎬', health:'💊', others:'💳', income:'💰' }
const getIcon  = (s='') => { const k=s.toLowerCase(); for(const [key,ico] of Object.entries(CAT_ICON)) if(k.includes(key)) return ico; return '💳' }
const getColor = i => PALETTE[i % PALETTE.length]
const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN')
const ago = d => { try { return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) } catch { return d } }

// ── Skeleton ───────────────────────────────────────────────────────────────
const Skel = ({ w='100%', h=16, r=6 }) => (
  <div style={{ width:w, height:h, borderRadius:r, flexShrink:0,
    background:'linear-gradient(90deg,var(--bg3) 25%,#1c2638 50%,var(--bg3) 75%)',
    backgroundSize:'600px 100%', animation:'shimmer 1.5s infinite linear' }} />
)

// ── Animated counter ───────────────────────────────────────────────────────
function Counter({ to=0, prefix='₹', dur=1000 }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, t0
    const step = ts => { if(!t0)t0=ts; const p=Math.min((ts-t0)/dur,1); setV(to*(1-Math.pow(1-p,3))); if(p<1)raf=requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, dur])
  return <>{prefix}{Math.round(v).toLocaleString('en-IN')}</>
}

// ── Donut chart ────────────────────────────────────────────────────────────
function Donut({ cats, total }) {
  const [hov, setHov] = useState(null)
  const R=68, cx=90, cy=90
  let cum=0
  const segs = cats.map((c,i) => {
    const p=total?c.amount/total:0, s=cum, e=cum+p; cum=e
    const a1=(s*2*Math.PI)-Math.PI/2, a2=(e*2*Math.PI)-Math.PI/2
    const x1=cx+R*Math.cos(a1),y1=cy+R*Math.sin(a1),x2=cx+R*Math.cos(a2),y2=cy+R*Math.sin(a2)
    return { ...c, d:`M${cx} ${cy}L${x1} ${y1}A${R} ${R} 0 ${p>.5?1:0} 1 ${x2} ${y2}Z`, p, i }
  })
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width={180} height={180} style={{ flexShrink:0, filter:'drop-shadow(0 4px 16px #000a)' }}>
        {segs.map(s=>(
          <path key={s.i} d={s.d} fill={getColor(s.i)}
            opacity={hov===null||hov===s.i ? .9 : .2}
            style={{ cursor:'pointer', transition:'all .15s', transformOrigin:`${cx}px ${cy}px`, transform:hov===s.i?'scale(1.06)':'scale(1)' }}
            onMouseEnter={()=>setHov(s.i)} onMouseLeave={()=>setHov(null)} />
        ))}
        <circle cx={cx} cy={cy} r={48} fill="var(--bg2)" />
        <text x={cx} y={cy-5} textAnchor="middle" fill="var(--muted)" fontSize={8} fontFamily="var(--mono)" letterSpacing="1">TOTAL</text>
        <text x={cx} y={cy+11} textAnchor="middle" fill="var(--text)" fontSize={13} fontFamily="var(--sans)" fontWeight="700">
          {hov!==null ? `${(segs[hov].p*100).toFixed(1)}%` : '100%'}
        </text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:7, flex:1, minWidth:0 }}>
        {cats.map((c,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer',
            opacity:hov===null||hov===i ? 1 : .3, transition:'opacity .15s' }}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:getColor(i), flexShrink:0 }} />
            <span style={{ fontSize:10, color:'var(--muted2)', flex:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{c.name}</span>
            <span style={{ fontSize:10, color:'var(--text)', whiteSpace:'nowrap' }}>{fmt(c.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pipeline visualiser ────────────────────────────────────────────────────
const PIPE_STEPS = [
  { id:'parser',     label:'Parser',   icon:'🔍' },
  { id:'category',   label:'Category', icon:'🏷️' },
  { id:'budget',     label:'Budget',   icon:'📊' },
  { id:'alert',      label:'Alert',    icon:'🔔' },
  { id:'insight',    label:'Insight',  icon:'💡' },
  { id:'prediction', label:'Predict',  icon:'🔮' },
  { id:'advisor',    label:'Advisor',  icon:'🤖' },
]

function Pipeline({ active }) {
  return (
    <div style={{ display:'flex', alignItems:'center', flexWrap:'nowrap', overflowX:'auto', padding:'4px 0 8px' }}>
      {PIPE_STEPS.map((s,i)=>(
        <div key={s.id} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{
              width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, transition:'all .3s',
              background: active===s.id ? 'rgba(45,212,191,.15)' : active==='done' ? 'rgba(74,222,128,.08)' : 'var(--bg3)',
              border:`1px solid ${active===s.id?'rgba(45,212,191,.4)':active==='done'?'rgba(74,222,128,.2)':'var(--border)'}`,
              boxShadow: active===s.id ? '0 0 12px rgba(45,212,191,.2)' : 'none',
              transform: active===s.id ? 'scale(1.1)' : 'scale(1)',
            }}>{s.icon}</div>
            <span style={{ fontSize:8, color:active===s.id?'var(--teal)':'var(--muted)', letterSpacing:'.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{s.label}</span>
          </div>
          {i < PIPE_STEPS.length-1 && (
            <div style={{ width:20, height:1, background:active==='done'?'rgba(74,222,128,.3)':'var(--border)', margin:'0 2px', marginTop:-12, flexShrink:0 }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({ tx, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'var(--bg2)', border:'1px solid rgba(248,113,113,.25)', borderRadius:16, padding:28, maxWidth:360, width:'90%', animation:'fadeUp .2s ease both' }}>
        <div style={{ fontSize:28, textAlign:'center', marginBottom:12 }}>🗑️</div>
        <div style={{ fontFamily:'var(--sans)', fontSize:16, fontWeight:700, textAlign:'center', marginBottom:8 }}>Delete Transaction?</div>
        <div style={{ fontSize:11, color:'var(--muted2)', textAlign:'center', lineHeight:1.6, marginBottom:20 }}>
          <strong style={{ color:'var(--text)' }}>{tx.merchant}</strong><br />
          {fmt(tx.amount)} · {tx.category} · {ago(tx.date)}<br />
          <span style={{ color:'var(--red)' }}>This cannot be undone.</span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'10px', background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:10, color:'var(--muted2)', fontSize:11, fontFamily:'var(--mono)', cursor:'pointer', fontWeight:600 }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex:1, padding:'10px', background:'rgba(248,113,113,.12)', border:'1px solid rgba(248,113,113,.3)', borderRadius:10, color:'var(--red)', fontSize:11, fontFamily:'var(--mono)', cursor:'pointer', fontWeight:700 }}>
            ✕ Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab,       setTab]       = useState('dashboard')
  const [summary,   setSummary]   = useState(null)
  const [stats,     setStats]     = useState(null)
  const [txns,      setTxns]      = useState([])
  const [alerts,    setAlerts]    = useState([])
  const [budgets,   setBudgets]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [apiOk,     setApiOk]     = useState(true)

  // delete modal
  const [delTx,     setDelTx]     = useState(null)   // transaction to delete
  const [deleting,  setDeleting]  = useState(false)

  // SMS tab
  const [sms,        setSms]        = useState('')
  const [processing, setProcessing] = useState(false)
  const [pipeStep,   setPipeStep]   = useState(null)
  const [result,     setResult]     = useState(null)

  // Budget tab
  const [budCat,   setBudCat]   = useState('Food')
  const [budLimit, setBudLimit] = useState('')
  const [budSaved, setBudSaved] = useState(false)

  // ── fetch all data ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [sum, st, tx, al, bud] = await Promise.all([
        api.getSummary(), api.getStats(), api.getTransactions(),
        api.getAlerts(), api.getBudgets(),
      ])
      setSummary(sum); setStats(st); setTxns(tx.transactions||[])
      setAlerts(al.alerts||[]); setBudgets(bud.budgets||[])
      setApiOk(true)
    } catch { setApiOk(false) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── delete transaction ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!delTx) return
    setDeleting(true)
    try {
      await api.deleteTransaction(delTx.id)
      setDelTx(null)
      fetchAll()
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    } finally {
      setDeleting(false)
    }
  }

  // ── SMS pipeline ──────────────────────────────────────────────────────────
  const runPipeline = useCallback(async () => {
    if (!sms.trim()) return
    setProcessing(true); setResult(null); setPipeStep('parser')
    const steps = PIPE_STEPS.map(s=>s.id)
    let i=0
    const tick = setInterval(() => {
      i++; if(i < steps.length) setPipeStep(steps[i]); else clearInterval(tick)
    }, 300)
    try {
      const res = await api.processSMS(sms)
      clearInterval(tick); setPipeStep('done')
      setResult(res)
      if (res.ok) setTimeout(fetchAll, 400)
    } catch(e) {
      clearInterval(tick); setPipeStep(null)
      setResult({ ok:false, error: e.message })
    } finally { setProcessing(false) }
  }, [sms, fetchAll])

  const saveBudget = async () => {
    if (!budCat || !budLimit) return
    await api.setBudget(budCat, parseFloat(budLimit))
    setBudSaved(true); setTimeout(()=>setBudSaved(false), 2000)
    fetchAll()
  }

  const total   = summary?.monthly_total ?? 0
  const cats    = summary?.category_summary ?? []
  const BUDGET  = 50000
  const budgPct = Math.min((total/BUDGET)*100, 100)

  const card = (delay=0, extra={}) => ({
    background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:22,
    animation:`fadeUp .45s ease ${delay}s both`, ...extra
  })
  const label = { fontSize:9, color:'var(--muted)', letterSpacing:'.16em', textTransform:'uppercase', marginBottom:8, display:'block' }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', position:'relative', overflow:'hidden' }}>

      {/* delete modal */}
      {delTx && (
        <DeleteModal
          tx={delTx}
          onConfirm={handleDelete}
          onCancel={() => setDelTx(null)}
        />
      )}

      {/* bg layers */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(45,212,191,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,.02) 1px,transparent 1px)',
        backgroundSize:'52px 52px' }} />
      <div style={{ position:'fixed', top:'-15%', right:'-10%', width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(167,139,250,.05) 0%,transparent 65%)', pointerEvents:'none', animation:'glow 6s ease infinite' }} />
      <div style={{ position:'fixed', bottom:'-20%', left:'-8%', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(45,212,191,.04) 0%,transparent 65%)', pointerEvents:'none', animation:'glow 8s ease 2s infinite' }} />

      <div style={{ maxWidth:1240, margin:'0 auto', padding:'0 28px', position:'relative', zIndex:1 }}>

        {/* ── HEADER ── */}
        <header style={{ padding:'24px 0 0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:13,
              background:'linear-gradient(135deg,var(--teal),var(--purple))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--sans)', fontSize:22, fontWeight:800,
              boxShadow:'0 4px 20px rgba(45,212,191,.3)' }}>₹</div>
            <div>
              <div style={{ fontFamily:'var(--sans)', fontSize:20, fontWeight:800, letterSpacing:'.04em' }}>FINTRACK</div>
              <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:'.2em', textTransform:'uppercase' }}>AI Personal Finance</div>
            </div>
          </div>

          <nav style={{ display:'flex', gap:3, padding:3, background:'rgba(255,255,255,.02)', borderRadius:12, border:'1px solid var(--border)' }}>
            {[['dashboard','⬡ Dashboard'],['sms','＋ Add Expense'],['budgets','◎ Budgets'],['alerts','🔔 Alerts']].map(([id,lbl])=>(
              <button key={id} onClick={()=>{ setTab(id); setResult(null) }} style={{
                padding:'7px 16px', borderRadius:9, border:'none', cursor:'pointer',
                fontSize:10, letterSpacing:'.07em', fontWeight:600, fontFamily:'var(--mono)',
                transition:'all .18s',
                background: tab===id ? 'linear-gradient(135deg,rgba(45,212,191,.12),rgba(167,139,250,.12))' : 'transparent',
                color: tab===id ? 'var(--teal)' : 'var(--muted)',
                boxShadow: tab===id ? 'inset 0 0 0 1px rgba(45,212,191,.2)' : 'none',
              }}>{lbl}</button>
            ))}
          </nav>

          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:apiOk?'var(--green)':'var(--red)', animation:apiOk?'pulse 2.5s infinite':'none' }} />
            <span style={{ fontSize:9, color:'var(--muted)', letterSpacing:'.12em', textTransform:'uppercase' }}>{apiOk?'Live':'API offline'}</span>
            {!apiOk && <button onClick={fetchAll} style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', borderRadius:6, color:'var(--yellow)', fontSize:9, padding:'3px 8px', cursor:'pointer', fontFamily:'var(--mono)' }}>Retry</button>}
          </div>
        </header>

        {/* ══ DASHBOARD ══ */}
        {tab==='dashboard' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'24px 0 14px' }}>
              {[
                { label:'Monthly Spend',   val:total,                        color:'var(--teal)',   bar:true },
                { label:'Transactions',    val:stats?.transaction_count??0,  color:'var(--blue)',   noCurr:true },
                { label:'Avg Transaction', val:stats?.avg_transaction??0,    color:'var(--purple)' },
                { label:'Active Alerts',   val:stats?.alert_count??0,        color:stats?.alert_count?'var(--red)':'var(--green)', noCurr:true },
              ].map((m,i)=>(
                <div key={i} style={{ ...card(i*.07), position:'relative', overflow:'hidden', cursor:'default' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
                    background:`linear-gradient(90deg,transparent,${m.color},transparent)` }} />
                  <div style={label}>{m.label}</div>
                  {loading
                    ? <Skel h={32} w={120} />
                    : <div style={{ fontFamily:'var(--sans)', fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-.02em' }}>
                        {m.noCurr ? m.val : <Counter to={m.val} />}
                      </div>}
                  {m.bar && !loading && (
                    <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,.05)', marginTop:14, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:2, width:`${budgPct}%`, background:`linear-gradient(90deg,${m.color}88,${m.color})`, transition:'width 1.2s ease', boxShadow:`0 0 6px ${m.color}44` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:12, paddingBottom:32 }}>

              {/* ── Transactions list with delete ── */}
              <div style={card(.1)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                  <span style={{ ...label, marginBottom:0 }}>Recent Transactions</span>
                  <span style={{ fontSize:9, color:'var(--muted)' }}>{txns.length} records</span>
                </div>
                {loading
                  ? Array.from({length:6},(_,i)=>(
                      <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.03)', alignItems:'center' }}>
                        <Skel w={36} h={36} r={10} />
                        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}><Skel h={11} w='55%' /><Skel h={9} w='30%' /></div>
                        <Skel h={11} w={55} />
                      </div>))
                  : txns.length===0
                    ? <div style={{ padding:'30px 0', textAlign:'center', color:'var(--muted)', fontSize:11 }}>No transactions yet.<br/>Add one via SMS parser →</div>
                    : txns.map((tx,i)=>(
                        <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.03)', animation:`slideIn .3s ease ${i*.05}s both` }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>
                            {getIcon(tx.category??tx.merchant)}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, color:'var(--text)', fontWeight:600, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{tx.merchant}</div>
                            <div style={{ fontSize:9, color:'var(--muted)', marginTop:2 }}>{tx.category} · {ago(tx.date)} · {tx.payment_mode}</div>
                          </div>
                          <div style={{ fontSize:12, fontWeight:700, color:'var(--red)', whiteSpace:'nowrap' }}>
                            -{fmt(tx.amount)}
                          </div>
                          {/* ── DELETE BUTTON ── */}
                          <button
                            onClick={() => setDelTx(tx)}
                            title="Delete transaction"
                            style={{
                              width:28, height:28, borderRadius:7, flexShrink:0,
                              background:'rgba(248,113,113,.06)',
                              border:'1px solid rgba(248,113,113,.12)',
                              color:'var(--red)', fontSize:12, cursor:'pointer',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              transition:'all .15s', fontFamily:'var(--mono)',
                            }}
                            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(248,113,113,.18)'; e.currentTarget.style.borderColor='rgba(248,113,113,.35)' }}
                            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(248,113,113,.06)'; e.currentTarget.style.borderColor='rgba(248,113,113,.12)' }}>
                            ✕
                          </button>
                        </div>
                      ))}
              </div>

              {/* ── Category donut + insight ── */}
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={card(.15)}>
                  <div style={label}>Spend by Category</div>
                  {loading
                    ? <div style={{ display:'flex', gap:20, alignItems:'center' }}>
                        <Skel w={180} h={180} r={90} />
                        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:9 }}>
                          {Array.from({length:5},(_,i)=><Skel key={i} h={9} />)}
                        </div>
                      </div>
                    : cats.length===0
                      ? <div style={{ padding:'30px 0', textAlign:'center', color:'var(--muted)', fontSize:11 }}>No data yet</div>
                      : <Donut cats={cats} total={total} />}
                </div>

                {!loading && stats && (
                  <div style={{ ...card(.2), background:'linear-gradient(135deg,rgba(45,212,191,.04),rgba(167,139,250,.04))', borderColor:'rgba(45,212,191,.12)' }}>
                    <div style={label}>Quick Insight</div>
                    <div style={{ fontSize:11, color:'var(--muted2)', lineHeight:1.7 }}>
                      {cats.length>0
                        ? <>🏆 Highest spend: <strong style={{ color:'var(--text)' }}>{cats[0]?.name}</strong> at {fmt(cats[0]?.amount)}</>
                        : 'Start adding expenses to see insights.'}
                    </div>
                    {stats.max_transaction>0 && (
                      <div style={{ fontSize:11, color:'var(--muted2)', lineHeight:1.7, marginTop:6 }}>
                        📌 Largest transaction: {fmt(stats.max_transaction)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══ ADD EXPENSE ══ */}
        {tab==='sms' && (
          <div style={{ maxWidth:580, margin:'28px auto', paddingBottom:40 }}>
            <div style={{ ...card(0), borderRadius:20, padding:30 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize:22, fontWeight:800, marginBottom:6 }}>Parse SMS Transaction</div>
              <p style={{ fontSize:11, color:'var(--muted)', lineHeight:1.75, marginBottom:26 }}>
                Paste a bank/UPI SMS. The LangGraph pipeline will extract, categorise, and save the expense automatically.
              </p>

              <div style={{ marginBottom:20 }}>
                <span style={label}>Pipeline</span>
                <Pipeline active={pipeStep} />
              </div>

              <span style={label}>SMS Content</span>
              <textarea value={sms} onChange={e=>setSms(e.target.value)}
                placeholder={'Dear Customer, INR 499.00 debited from A/c XX4521\nVia UPI to Swiggy on 24-02-25.\nAvail Bal: INR 22,000.00 — HDFC Bank'}
                style={{ width:'100%', minHeight:140, background:'rgba(255,255,255,.02)', border:'1px solid var(--border)',
                  borderRadius:12, padding:'14px 16px', color:'var(--text)', fontFamily:'var(--mono)', fontSize:11,
                  lineHeight:1.7, resize:'vertical', outline:'none', transition:'border-color .2s', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='rgba(45,212,191,.4)'}
                onBlur={e =>e.target.style.borderColor='var(--border)'}
              />

              <button onClick={runPipeline} disabled={processing} style={{
                width:'100%', padding:13, marginTop:10, borderRadius:12, border:'1px solid rgba(45,212,191,.25)',
                background: processing ? 'rgba(45,212,191,.05)' : 'linear-gradient(135deg,#0f3d30,#1e1057)',
                color:'var(--text)', fontSize:11, letterSpacing:'.1em', fontWeight:700, fontFamily:'var(--mono)',
                textTransform:'uppercase', cursor:processing?'not-allowed':'pointer', transition:'all .2s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}
                onMouseEnter={e=>{ if(!processing){ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(45,212,191,.12)' } }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
                {processing
                  ? <><span style={{ width:11, height:11, border:'2px solid rgba(45,212,191,.2)', borderTopColor:'var(--teal)', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }} />Processing pipeline…</>
                  : '⚡  Run Pipeline'}
              </button>

              {result && (
                result.ok
                  ? <div style={{ background:'rgba(74,222,128,.05)', border:'1px solid rgba(74,222,128,.2)', borderRadius:12, padding:16, marginTop:12 }}>
                      <div style={{ fontSize:12, color:'#86efac', fontWeight:600, marginBottom:result.advisor?8:0 }}>✓ Expense saved to database</div>
                      {result.advisor && (
                        <div style={{ background:'rgba(45,212,191,.04)', border:'1px solid rgba(45,212,191,.15)', borderRadius:10, padding:14, fontSize:11, lineHeight:1.75, color:'#7dd3fc' }}>
                          🤖 <strong>AI Advisor:</strong> {result.advisor}
                        </div>
                      )}
                    </div>
                  : <div style={{ background:'rgba(248,113,113,.05)', border:'1px solid rgba(248,113,113,.2)', borderRadius:12, padding:14, marginTop:12, fontSize:12, color:'#fca5a5', fontWeight:600 }}>
                      ✗ {result.error || 'Something went wrong'}
                    </div>
              )}

              <div style={{ marginTop:24, borderTop:'1px solid var(--border)', paddingTop:18 }}>
                <span style={label}>Example SMS — click to fill</span>
                {[
                  'INR 349.00 debited from A/c XX4521 via UPI to Zomato on 24-02-25. Avail Bal: 24,651 -HDFC',
                  'Your A/c XX7890 debited ₹1,299 for Amazon on 23-Feb-25. Avail Bal: ₹18,450. -SBI',
                  'Rs.125 debited from AC XX1234 at Uber on 24-Feb. Bal:Rs.9,875. -ICICI Bank',
                ].map((ex,i)=>(
                  <button key={i} onClick={()=>setSms(ex)} style={{
                    width:'100%', textAlign:'left', padding:'9px 14px', background:'rgba(255,255,255,.015)',
                    border:'1px solid var(--border)', borderRadius:8, fontSize:10, color:'var(--muted)',
                    cursor:'pointer', lineHeight:1.6, transition:'all .15s', marginBottom:6, fontFamily:'var(--mono)', display:'block',
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(45,212,191,.25)'; e.currentTarget.style.color='var(--muted2)' }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)' }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ BUDGETS ══ */}
        {tab==='budgets' && (
          <div style={{ maxWidth:680, margin:'28px auto', paddingBottom:40 }}>
            <div style={{ ...card(0), borderRadius:20, padding:30, marginBottom:14 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize:20, fontWeight:800, marginBottom:6 }}>Set Category Budgets</div>
              <p style={{ fontSize:11, color:'var(--muted)', lineHeight:1.7, marginBottom:24 }}>
                The BudgetAgent checks these limits on every transaction. Exceeding a limit triggers an alert and routes to the AI Advisor.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:10, alignItems:'end' }}>
                <div>
                  <span style={label}>Category</span>
                  <select value={budCat} onChange={e=>setBudCat(e.target.value)} style={{
                    width:'100%', padding:'10px 12px', background:'var(--bg3)', border:'1px solid var(--border)',
                    borderRadius:10, color:'var(--text)', fontFamily:'var(--mono)', fontSize:11, outline:'none',
                  }}>
                    {['Food','Transport','Shopping','Utilities','Entertainment','Health','Others'].map(c=>(
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span style={label}>Monthly Limit (₹)</span>
                  <input type="number" value={budLimit} onChange={e=>setBudLimit(e.target.value)}
                    placeholder="e.g. 5000"
                    style={{ width:'100%', padding:'10px 12px', background:'var(--bg3)', border:'1px solid var(--border)',
                      borderRadius:10, color:'var(--text)', fontFamily:'var(--mono)', fontSize:11, outline:'none', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor='rgba(45,212,191,.4)'}
                    onBlur={e =>e.target.style.borderColor='var(--border)'} />
                </div>
                <button onClick={saveBudget} style={{
                  padding:'10px 20px', background:'linear-gradient(135deg,#0f3d30,#1e1057)',
                  border:'1px solid rgba(45,212,191,.25)', borderRadius:10, color:'var(--text)',
                  fontSize:10, fontWeight:700, fontFamily:'var(--mono)', cursor:'pointer', letterSpacing:'.08em',
                  textTransform:'uppercase', transition:'all .2s', whiteSpace:'nowrap',
                }}>
                  {budSaved ? '✓ Saved' : 'Set Budget'}
                </button>
              </div>
            </div>

            <div style={card(.1)}>
              <div style={label}>Current Budgets</div>
              {loading
                ? Array.from({length:3},(_,i)=>(
                    <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.03)', alignItems:'center' }}>
                      <Skel h={12} w='40%' /><Skel h={12} w='25%' />
                    </div>))
                : budgets.length===0
                  ? <div style={{ padding:'24px 0', textAlign:'center', color:'var(--muted)', fontSize:11 }}>No budgets set yet.</div>
                  : budgets.map((b,i)=>{
                      const catSpend = cats.find(c=>c.name.toLowerCase()===b.category.toLowerCase())?.amount ?? 0
                      const pct = Math.min((catSpend/b.monthly_limit)*100, 100)
                      const over = catSpend > b.monthly_limit
                      return (
                        <div key={i} style={{ padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                            <span style={{ fontSize:12, color:'var(--text)', fontWeight:600 }}>{getIcon(b.category)} {b.category}</span>
                            <span style={{ fontSize:11, color:over?'var(--red)':'var(--muted2)' }}>
                              {fmt(catSpend)} / {fmt(b.monthly_limit)} {over && '⚠️'}
                            </span>
                          </div>
                          <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,.05)', overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:3, width:`${pct}%`, transition:'width 1s ease',
                              background: over ? 'linear-gradient(90deg,var(--red),#ff4444)' : `linear-gradient(90deg,${getColor(i)}88,${getColor(i)})`,
                              boxShadow: over ? '0 0 8px rgba(248,113,113,.4)' : `0 0 6px ${getColor(i)}44`,
                            }} />
                          </div>
                        </div>)
                    })}
            </div>
          </div>
        )}

        {/* ══ ALERTS ══ */}
        {tab==='alerts' && (
          <div style={{ maxWidth:640, margin:'28px auto', paddingBottom:40 }}>
            <div style={card(0)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div style={{ fontFamily:'var(--sans)', fontSize:20, fontWeight:800 }}>Alerts</div>
                <div style={{ fontSize:10, color:'var(--muted)', letterSpacing:'.1em' }}>{alerts.length} total</div>
              </div>
              {loading
                ? Array.from({length:5},(_,i)=>(
                    <div key={i} style={{ padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', gap:12 }}>
                      <Skel w={32} h={32} r={8} />
                      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}><Skel h={12} w='70%' /><Skel h={9} w='30%' /></div>
                    </div>))
                : alerts.length===0
                  ? <div style={{ padding:'40px 0', textAlign:'center' }}>
                      <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
                      <div style={{ fontSize:13, color:'var(--muted)' }}>No alerts. Your budgets are on track!</div>
                    </div>
                  : alerts.map((a,i)=>(
                      <div key={a.id} style={{ display:'flex', gap:12, padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,.04)', animation:`slideIn .3s ease ${i*.05}s both` }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>⚠️</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, color:'var(--text)', lineHeight:1.5 }}>{a.message}</div>
                          <div style={{ fontSize:9, color:'var(--muted)', marginTop:4 }}>{ago(a.created_at)}</div>
                        </div>
                      </div>))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
