import { useState, useEffect, useRef, useCallback } from "react";

// ── FONTS ─────────────────────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap";
_fl.rel = "stylesheet"; document.head.appendChild(_fl);

// ── CSS ───────────────────────────────────────────────────────────────────────
const _css = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
body{background:#f0f4f8;font-family:'Outfit',sans-serif;overscroll-behavior:none;}
::-webkit-scrollbar{width:0;}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
input,button{font-family:'Outfit',sans-serif;}

@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
@keyframes slideLeft{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes ping{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.4);opacity:0}}
@keyframes glow{0%,100%{box-shadow:0 0 16px #00e67640}50%{box-shadow:0 0 45px #00e676b0}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes pop{0%{transform:scale(.4);opacity:0}65%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes rippleAnim{to{transform:scale(5);opacity:0}}
@keyframes scoreFlash{0%,100%{background:transparent}35%,65%{background:rgba(0,230,118,.2)}}
@keyframes oddFlash{0%,100%{background:rgba(255,215,0,0)}40%{background:rgba(255,215,0,.2)}}
@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
@keyframes notifIn{0%{transform:translateX(110%);opacity:0}12%,80%{transform:translateX(0);opacity:1}100%{transform:translateX(110%);opacity:0}}
@keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.18)}28%{transform:scale(1)}42%{transform:scale(1.1)}}
@keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes barFill{from{width:0}to{width:var(--w,100%)}}
@keyframes carouselSlide{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}

.fu0{animation:fadeUp .38s ease both}
.fu1{animation:fadeUp .38s .06s ease both}
.fu2{animation:fadeUp .38s .12s ease both}
.fu3{animation:fadeUp .38s .18s ease both}
.fu4{animation:fadeUp .38s .24s ease both}
.fu5{animation:fadeUp .38s .30s ease both}

.obt{transition:all .16s cubic-bezier(.34,1.56,.64,1);cursor:pointer;position:relative;overflow:hidden;}
.obt:active{transform:scale(.88)!important;}
.obt.sel{background:linear-gradient(135deg,rgba(0,48,135,.12),rgba(0,71,200,.06))!important;border-color:#003087!important;}
.obt.sel .ov{color:#003087!important;text-shadow:0 0 10px rgba(0,48,135,.2);}
.obt.flash{animation:oddFlash .7s ease;}
.obt.lock{opacity:.45;cursor:not-allowed;}

.mc{transition:all .2s;cursor:pointer;}
.mc:hover{transform:translateY(-2px);border-color:rgba(0,48,135,.3)!important;box-shadow:0 8px 24px rgba(0,0,0,.1)!important;}
.bpress{transition:all .14s cubic-bezier(.34,1.56,.64,1);cursor:pointer;}
.bpress:active{transform:scale(.93);}
.score-flash{animation:scoreFlash .9s ease;}
.heartbeat{animation:heartbeat 1.8s ease infinite;}
.float-a{animation:float 3s ease-in-out infinite;}
`;
const _se = document.createElement("style"); _se.textContent = _css; document.head.appendChild(_se);

// ── TEAMS DATA ────────────────────────────────────────────────────────────────
export const T = {
  haiti:     {n:"Haïti",     img:"https://flagcdn.com/w80/ht.png",c:"#003087"},
  jamaica:   {n:"Jamaica",   img:"https://flagcdn.com/w80/jm.png",c:"#FFD700"},
  brazil:    {n:"Brésil",    img:"https://flagcdn.com/w80/br.png",c:"#009C3B"},
  argentina: {n:"Argentine", img:"https://flagcdn.com/w80/ar.png",c:"#74ACDF"},
  france:    {n:"France",    img:"https://flagcdn.com/w80/fr.png",c:"#002395"},
  spain:     {n:"Espagne",   img:"https://flagcdn.com/w80/es.png",c:"#c60b1e"},
  senegal:   {n:"Sénégal",   img:"https://flagcdn.com/w80/sn.png",c:"#00853F"},
  nigeria:   {n:"Nigéria",   img:"https://flagcdn.com/w80/ng.png",c:"#008751"},
  colombia:  {n:"Colombie",  img:"https://flagcdn.com/w80/co.png",c:"#FCD116"},
  portugal:  {n:"Portugal",  img:"https://flagcdn.com/w80/pt.png",c:"#006600"},
  england:   {n:"Angleterre",img:"https://flagcdn.com/w80/gb-eng.png",c:"#CF081F"},
  germany:   {n:"Allemagne", img:"https://flagcdn.com/w80/de.png",c:"#FDD835"},
  realmadrid:{n:"Real Madrid",img:"https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",c:"#FEBE10",svg:1},
  barcelona: {n:"Barcelona", img:"https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",c:"#004D98",svg:1},
  psg:       {n:"PSG",       img:"https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",c:"#004170",svg:1},
  marseille: {n:"Marseille", img:"https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_de_Marseille_logo.svg",c:"#2CBFEB",svg:1},
  arsenal:   {n:"Arsenal",   img:"https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",c:"#EF0107",svg:1},
  chelsea:   {n:"Chelsea",   img:"https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",c:"#034694",svg:1},
  lakers:    {n:"Lakers",    img:"https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg",c:"#552583",svg:1},
  warriors:  {n:"Warriors",  img:"https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg",c:"#1D428A",svg:1},
  celtics:   {n:"Celtics",   img:"https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg",c:"#007A33",svg:1},
  heat:      {n:"Heat",      img:"https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg",c:"#98002E",svg:1},
};

// ── MATCHES DATA ──────────────────────────────────────────────────────────────
export const INIT_MATCHES = [
  {id:1,cat:"carib",lg:"Caribbean Nations Cup 🌊",home:"haiti",away:"jamaica",ho:2.40,dr:3.10,aw:2.80,live:true,min:67,hs:1,as:1,hot:true,feat:true,date:"Jodi a",time:"20:00",
   markets:{ou:[{l:"+ 2.5 Gòl",o:1.85},{l:"- 2.5 Gòl",o:1.95}],dc:[{l:"1 oswa X",o:1.35},{l:"X oswa 2",o:1.60},{l:"1 oswa 2",o:1.20}],btts:[{l:"Wi",o:2.10},{l:"Non",o:1.65}]}},
  {id:2,cat:"intl",lg:"CONMEBOL Éliminatoires",home:"brazil",away:"argentina",ho:2.10,dr:3.30,aw:3.50,live:true,min:34,hs:0,as:0,hot:true,feat:false,date:"Jodi a",time:"22:30",
   markets:{ou:[{l:"+ 2.5 Gòl",o:1.75},{l:"- 2.5 Gòl",o:2.05}],dc:[{l:"1 oswa X",o:1.25},{l:"X oswa 2",o:1.80},{l:"1 oswa 2",o:1.15}],btts:[{l:"Wi",o:1.95},{l:"Non",o:1.80}]}},
  {id:3,cat:"euro",lg:"La Liga — El Clásico 🔥",home:"realmadrid",away:"barcelona",ho:1.95,dr:3.50,aw:3.80,live:false,hot:true,feat:false,date:"Jodi a",time:"21:00",
   markets:{ou:[{l:"+ 2.5 Gòl",o:1.65},{l:"- 2.5 Gòl",o:2.20}],dc:[{l:"1 oswa X",o:1.22},{l:"X oswa 2",o:1.85},{l:"1 oswa 2",o:1.12}],btts:[{l:"Wi",o:1.80},{l:"Non",o:1.90}]}},
  {id:4,cat:"nba",lg:"NBA 🏀",home:"lakers",away:"warriors",ho:1.85,dr:null,aw:1.95,live:true,min:3,qtr:"Q3",hs:88,as:91,hot:false,feat:false,date:"Jodi a",time:"01:30",
   markets:{ou:[{l:"+ 220.5 Pt",o:1.90},{l:"- 220.5 Pt",o:1.90}],dc:[],btts:[]}},
  {id:5,cat:"euro",lg:"Premier League",home:"arsenal",away:"chelsea",ho:2.00,dr:3.40,aw:3.60,live:false,hot:false,feat:false,date:"Demen",time:"16:30",
   markets:{ou:[{l:"+ 2.5 Gòl",o:1.80},{l:"- 2.5 Gòl",o:2.00}],dc:[{l:"1 oswa X",o:1.28},{l:"X oswa 2",o:1.75},{l:"1 oswa 2",o:1.18}],btts:[{l:"Wi",o:1.85},{l:"Non",o:1.88}]}},
  {id:6,cat:"euro",lg:"Ligue 1",home:"psg",away:"marseille",ho:1.55,dr:4.00,aw:5.50,live:false,hot:false,feat:false,date:"Demen",time:"21:00",
   markets:{ou:[{l:"+ 2.5 Gòl",o:1.60},{l:"- 2.5 Gòl",o:2.30}],dc:[{l:"1 oswa X",o:1.10},{l:"X oswa 2",o:2.50},{l:"1 oswa 2",o:1.08}],btts:[{l:"Wi",o:2.00},{l:"Non",o:1.75}]}},
  {id:7,cat:"intl",lg:"UEFA Nations League",home:"france",away:"spain",ho:2.20,dr:3.20,aw:3.10,live:false,hot:false,feat:false,date:"Demen",time:"20:45",
   markets:{ou:[{l:"+ 2.5 Gòl",o:1.78},{l:"- 2.5 Gòl",o:2.02}],dc:[{l:"1 oswa X",o:1.30},{l:"X oswa 2",o:1.72},{l:"1 oswa 2",o:1.16}],btts:[{l:"Wi",o:1.88},{l:"Non",o:1.85}]}},
  {id:8,cat:"intl",lg:"Éliminatoires Africa",home:"senegal",away:"nigeria",ho:2.30,dr:3.00,aw:2.90,live:false,hot:false,feat:false,date:"Sam",time:"19:00",
   markets:{ou:[{l:"+ 2.5 Gòl",o:1.95},{l:"- 2.5 Gòl",o:1.85}],dc:[{l:"1 oswa X",o:1.35},{l:"X oswa 2",o:1.55},{l:"1 oswa 2",o:1.22}],btts:[{l:"Wi",o:2.05},{l:"Non",o:1.70}]}},
  {id:9,cat:"nba",lg:"NBA 🏀",home:"celtics",away:"heat",ho:1.70,dr:null,aw:2.10,live:false,hot:false,feat:false,date:"Demen",time:"00:00",
   markets:{ou:[{l:"+ 215.5 Pt",o:1.90},{l:"- 215.5 Pt",o:1.90}],dc:[],btts:[]}},
  {id:10,cat:"intl",lg:"Copa America",home:"colombia",away:"portugal",ho:3.20,dr:3.40,aw:2.10,live:false,hot:false,feat:false,date:"Sam",time:"21:00",
   markets:{ou:[{l:"+ 2.5 Gòl",o:1.82},{l:"- 2.5 Gòl",o:1.98}],dc:[{l:"1 oswa X",o:1.60},{l:"X oswa 2",o:1.42},{l:"1 oswa 2",o:1.30}],btts:[{l:"Wi",o:1.92},{l:"Non",o:1.82}]}},
];

export const htg = n => new Intl.NumberFormat("fr").format(Math.round(n)) + " HTG";

// ── HOOKS ─────────────────────────────────────────────────────────────────────
export function useRipple() {
  return (e, color="rgba(255,255,255,.18)") => {
    const btn = e.currentTarget;
    const d = Math.max(btn.offsetWidth, btn.offsetHeight);
    const r = btn.getBoundingClientRect();
    const c = document.createElement("span");
    c.style.cssText = `position:absolute;width:${d}px;height:${d}px;border-radius:50%;background:${color};transform:scale(0);animation:rippleAnim .5s ease;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px;pointer-events:none;z-index:10;`;
    btn.appendChild(c); setTimeout(() => c.remove(), 500);
  };
}

// ── CONFETTI ──────────────────────────────────────────────────────────────────
export function Confetti({ active }) {
  if (!active) return null;
  const cols = ["#00e676","#ffd700","#ff6b6b","#60a5fa","#a78bfa","#fb923c","#34d399"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {Array.from({length:70},(_,i) => (
        <div key={i} style={{
          position:"absolute",
          left:`${Math.random()*100}%`, top:0,
          width: 6+Math.random()*8, height: 6+Math.random()*8,
          background: cols[Math.floor(Math.random()*cols.length)],
          borderRadius: i%3===0?"50%":"2px",
          animation:`confettiFall ${1.5+Math.random()*1.5}s ${Math.random()*1.2}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
export function Toast({ toasts }) {
  const colors = {goal:"rgba(0,230,118,.4)",odds:"rgba(255,215,0,.4)",bet:"rgba(96,165,250,.4)",win:"rgba(0,230,118,.5)",info:"rgba(148,163,184,.3)"};
  const bgs = {goal:"linear-gradient(135deg,#1a3a20,#0d2015)",odds:"linear-gradient(135deg,#2a2510,#1a1a08)",bet:"linear-gradient(135deg,#1a2535,#0d1520)",win:"linear-gradient(135deg,#0d3020,#0a2018)",info:"linear-gradient(135deg,#1a2030,#10151e)"};
  return (
    <div style={{position:"fixed",top:72,right:10,zIndex:998,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none",maxWidth:280}}>
      {toasts.map(t => (
        <div key={t.id} style={{background:bgs[t.type]||bgs.info,border:`1px solid ${colors[t.type]||colors.info}`,borderRadius:14,padding:"11px 14px",animation:"notifIn 4.2s ease forwards",boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
          <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
            <span style={{fontSize:22,flexShrink:0}}>{t.icon}</span>
            <div><div style={{color:"#0f172a",fontWeight:700,fontSize:13,lineHeight:1.3}}>{t.title}</div><div style={{color:"#6b7280",fontSize:11,marginTop:2,lineHeight:1.4}}>{t.body}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LOGO ──────────────────────────────────────────────────────────────────────
export function Logo({k,sz=38}) {
  const t=T[k]; const [err,setErr]=useState(false);
  if(!t) return <div style={{width:sz,height:sz,borderRadius:"50%",background:"#1a2030",flexShrink:0}}/>;
  if(err) return <div style={{width:sz,height:sz,borderRadius:"50%",background:`linear-gradient(135deg,${t.c}33,${t.c}11)`,border:`2px solid ${t.c}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.36,fontWeight:800,color:t.c,fontFamily:"'Bebas Neue',cursive",flexShrink:0}}>{t.n.slice(0,2)}</div>;
  return <img src={t.img} alt={t.n} onError={()=>setErr(true)} style={{width:sz,height:sz,objectFit:t.svg?"contain":"cover",borderRadius:t.svg?0:"50%",border:t.svg?"none":"2px solid rgba(255,255,255,.1)",filter:"drop-shadow(0 2px 8px rgba(0,0,0,.6))",flexShrink:0}}/>;
}

export function LiveBadge({min,qtr}) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(239,68,68,.13)",border:"1px solid rgba(239,68,68,.32)",color:"#ef4444",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:20,letterSpacing:.4}}>
    <span style={{width:5,height:5,borderRadius:"50%",background:"#ef4444",animation:"pulse 1s infinite"}}/>
    {qtr?`${qtr} ${min}'`:`${min}'`}
  </span>;
}

export const IS = {width:"100%",padding:"13px 15px",background:"#f1f5f9",border:"1px solid rgba(0,0,0,.12)",borderRadius:12,color:"#0f172a",fontSize:15,outline:"none",fontFamily:"'Outfit',sans-serif",transition:"border-color .2s"};

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [pct,setPct]=useState(0);
  useEffect(()=>{const iv=setInterval(()=>setPct(p=>{if(p>=100){clearInterval(iv);setTimeout(onDone,250);return 100;}return p+2;}),40);return()=>clearInterval(iv);},[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"#f0f4f8",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:0}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 50% 38%,rgba(0,230,118,.1) 0%,transparent 62%)"}}/>
      <div style={{position:"absolute",inset:0,opacity:.025,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 34px,#fff 34px,#fff 35px),repeating-linear-gradient(90deg,transparent,transparent 34px,#fff 34px,#fff 35px)"}}/>
      <div className="fu0" style={{marginBottom:22,position:"relative"}}>
        <div style={{width:100,height:100,borderRadius:"50%",background:"linear-gradient(135deg,#00e676,#00b85a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:50,animation:"glow 2s ease-in-out infinite",boxShadow:"0 0 60px rgba(0,230,118,.35)"}}>🎯</div>
        <div style={{position:"absolute",inset:-5,borderRadius:"50%",border:"2px solid rgba(0,230,118,.28)",animation:"ping 2s ease-out infinite"}}/>
        <div style={{position:"absolute",inset:-15,borderRadius:"50%",border:"1px solid rgba(0,230,118,.12)",animation:"ping 2s .5s ease-out infinite"}}/>
      </div>
      <div className="fu1" style={{fontFamily:"'Bebas Neue',cursive",fontSize:64,color:"#0f172a",letterSpacing:10,lineHeight:1,textShadow:"0 0 50px rgba(0,230,118,.22)",marginBottom:5}}>RIVAYO PARYAJ</div>
      <div className="fu2" style={{color:"#00e676",fontSize:12,fontWeight:700,letterSpacing:4,marginBottom:50,opacity:.75}}>PARYAJ AYISYEN #1</div>
      <div className="fu3" style={{width:200,marginBottom:10}}>
        <div style={{height:3,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00e676,#69ffb4)",borderRadius:4,transition:"width .04s linear",boxShadow:"0 0 10px rgba(0,230,118,.5)"}}/>
        </div>
      </div>
      <div style={{color:"#252f40",fontSize:11,fontWeight:700,letterSpacing:2}}>{pct}%</div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",height:5}}>
        <div style={{flex:1,background:"#003087"}}/><div style={{flex:1,background:"#D21034"}}/>
      </div>
    </div>
  );
}

// ── ONBOARDING MODAL (apre enskripsyon) ───────────────────────────────────────
function OnboardingModal({ name, onClose }) {
  const [step,setStep]=useState(0);
  const steps=[
    {icon:"🎁",title:"Byenveni RIVAYO PARYAJ!",body:"Kont ou kreye avèk siksè. Ou resevwa 50 HTG bonus gratis pou kòmanse.",btn:"Kontinye"},
    {icon:"🎯",title:"Kijan Paryaj Fonksyone?",body:"Chwazi yon match → Klike sou kou a → Mete montan → Valide. Se tout!",btn:"Kontinye"},
    {icon:"💰",title:"Bonus 50 HTG ou a",body:"Parye gratis. Si ou genyen → kòb reyèl antre. Pa ka retire bonus dirèkteman.",btn:"Kontinye"},
    {icon:"🇭🇹",title:"Prèt pou Kòmanse!",body:"Sipòte Ayiti ak chak paryaj. Bon chans!",btn:"Kòmanse →"},
  ];
  const s=steps[step];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}>
      <div style={{background:"linear-gradient(160deg,#0e1420,#0a0f18)",border:"1px solid rgba(0,0,0,.09)",borderRadius:24,padding:32,width:"100%",maxWidth:360,animation:"pop .4s cubic-bezier(.34,1.56,.64,1)",textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:24}}>
          {steps.map((_,i)=><div key={i} style={{width:i===step?24:6,height:6,borderRadius:3,background:i===step?"#00e676":"rgba(255,255,255,.12)",transition:"all .3s"}}/>)}
        </div>
        <div style={{fontSize:60,marginBottom:16,animation:"float 2s ease-in-out infinite"}}>{s.icon}</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:"#0f172a",letterSpacing:2,marginBottom:12}}>{s.title}</div>
        <div style={{color:"#64748b",fontSize:14,lineHeight:1.7,marginBottom:28}}>{s.body}</div>
        <button className="bpress" onClick={()=>{if(step<steps.length-1)setStep(step+1);else onClose();}} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#00e676,#00cc5e)",border:"none",borderRadius:14,color:"#000",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 28px rgba(0,230,118,.28)"}}>
          {s.btn}
        </button>
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function Auth({ onLogin }) {
  const ripple=useRipple();
  const [mode,setMode]=useState("login");const[name,setName]=useState("");const[phone,setPhone]=useState("");const[pin,setPin]=useState("");
  const [loading,setLoading]=useState(false);const[err,setErr]=useState("");const[foc,setFoc]=useState("");
  const API = "https://rivayo-paryaj-production.up.railway.app/api";
  const fS=k=>({...IS,borderColor:foc===k?"rgba(0,230,118,.45)":"rgba(255,255,255,.1)"});
  const go=async e=>{
    ripple(e,"rgba(0,230,118,.3)");setErr("");
    if(!phone||phone.length<8)return setErr("Nimewo pa kòrèk — 8 chif obligatwa");
    if(!pin||pin.length<4)return setErr("PIN dwe gen 4 chif omwen");
    if(mode==="register"&&!name.trim())return setErr("Mete non ou tanpri");
    setLoading(true);
    try {
      const endpoint = mode==="register" ? `${API}/auth/register` : `${API}/auth/login`;
      const body = mode==="register" ? {name:name.trim(),phone,pin} : {phone,pin};
      const res = await fetch(endpoint, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if(!res.ok) return setErr(data.error || "Erè koneksyon");
      // Sove token nan localStorage
      localStorage.setItem("rivayo_token", data.token);
      onLogin({...data.user, isNew: mode==="register"});
    } catch(err) {
      setErr("Sèvè pa reponn — verifye backend ap koure");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{minHeight:"100vh",background:"#f0f4f8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse at 50% 0%,rgba(0,230,118,.08) 0%,transparent 52%)"}}/>
      <img src="https://flagcdn.com/w640/ht.png" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.04,filter:"grayscale(1) blur(2px)"}}/>
      <div className="fu0" style={{width:"100%",maxWidth:400,position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:30,filter:"drop-shadow(0 0 12px rgba(0,230,118,.4))"}}>🎯</span>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:44,color:"#0f172a",letterSpacing:6}}>RIVAYO PARYAJ</span>
          </div>
          <div style={{color:"#cbd5e1",fontSize:13}}>Platfòm Paryaj Ayisyen #1</div>
        </div>
        <div style={{background:"#f8fafc",border:"1px solid rgba(0,0,0,.08)",borderRadius:24,padding:26,backdropFilter:"blur(20px)",boxShadow:"0 24px 64px rgba(0,0,0,.5)"}}>
          <div style={{display:"flex",background:"rgba(0,0,0,.5)",borderRadius:14,padding:4,marginBottom:22,gap:4}}>
            {["login","register"].map(m=><button key={m} className="bpress" onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"11px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,transition:"all .25s cubic-bezier(.34,1.56,.64,1)",background:mode===m?"#00e676":"transparent",color:mode===m?"#000":"#444",boxShadow:mode===m?"0 4px 16px rgba(0,230,118,.28)":"none"}}>{m==="login"?"Konekte":"Enskri Gratis"}</button>)}
          </div>
          {mode==="register"&&<div className="fu0" style={{marginBottom:14}}><label style={{display:"block",color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:1.1}}>👤 Non Konplè</label><input style={fS("name")} placeholder="Jean Baptiste" value={name} onChange={e=>setName(e.target.value)} onFocus={()=>setFoc("name")} onBlur={()=>setFoc("")}/></div>}
          <div style={{marginBottom:14}}><label style={{display:"block",color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:1.1}}>📱 Nimewo Telefòn</label>
            <div style={{display:"flex"}}><div style={{...IS,width:"auto",padding:"0 12px",display:"flex",alignItems:"center",gap:6,borderTopRightRadius:0,borderBottomRightRadius:0,borderRight:"none",color:"#64748b",fontSize:14,flexShrink:0}}><img src="https://flagcdn.com/w40/ht.png" style={{width:20,height:14,objectFit:"cover",borderRadius:2}} alt=""/>+509</div><input style={{...fS("phone"),flex:1,borderTopLeftRadius:0,borderBottomLeftRadius:0}} placeholder="4xxx xxxx" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/,""))} maxLength={8} onFocus={()=>setFoc("phone")} onBlur={()=>setFoc("")}/></div>
          </div>
          <div style={{marginBottom:18}}><label style={{display:"block",color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:1.1}}>🔒 PIN Sekrè (4-6 chif)</label><input style={fS("pin")} type="password" placeholder="••••••" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/,""))} maxLength={6} onFocus={()=>setFoc("pin")} onBlur={()=>setFoc("")}/></div>
          {err&&<div style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.22)",borderRadius:11,padding:"10px 14px",color:"#ef4444",fontSize:13,marginBottom:14,animation:"shake .4s ease"}}>⚠️ {err}</div>}
          {mode==="register"&&<div style={{background:"linear-gradient(135deg,rgba(0,230,118,.07),rgba(255,215,0,.03))",border:"1px solid rgba(0,230,118,.15)",borderRadius:13,padding:"12px 15px",marginBottom:18,display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:28,animation:"float 2s ease-in-out infinite"}}>🎁</span><div><div style={{color:"#00e676",fontWeight:800,fontSize:15}}>50 HTG GRATIS!</div><div style={{color:"#94a3b8",fontSize:12}}>Zéro risk — teste sèvis la</div></div></div>}
          <button className="bpress" onClick={go} disabled={loading} style={{width:"100%",padding:"15px",background:loading?"rgba(0,230,118,.07)":"linear-gradient(135deg,#00e676,#00cc5e)",border:`1px solid ${loading?"rgba(0,230,118,.15)":"transparent"}`,borderRadius:14,color:loading?"#00e676":"#000",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:loading?"none":"0 8px 28px rgba(0,230,118,.25)",transition:"all .3s",position:"relative",overflow:"hidden"}}>
            {loading?<span style={{display:"inline-flex",alignItems:"center",gap:10}}><span style={{width:18,height:18,border:"2px solid rgba(0,230,118,.2)",borderTop:"2px solid #00e676",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block"}}/><span>Ap chaje...</span></span>:mode==="login"?"→ Konekte":"→ Kreye Kont Mwen"}
          </button>
          <div style={{textAlign:"center",marginTop:14,color:"#cbd5e1",fontSize:12}}>
            {mode==="login"?"Pa gen kont? ":"Gen kont? "}
            <span style={{color:"#00e676",cursor:"pointer",fontWeight:600}} onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}}>
              {mode==="login"?"Enskri →":"Konekte →"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TICKER ────────────────────────────────────────────────────────────────────
function Ticker({ matches }) {
  const live = matches.filter(m=>m.live);
  const items = [
    ...live.map(m=>`${T[m.home]?.n} ${m.hs??""}-${m.as??""} ${T[m.away]?.n} — ${m.qtr||m.min+`'`}`),
    "🎯 Bonus 50 HTG pou nouvo manm!","🏆 El Clásico Jodi a 21:00","🔥 Cote k ap monte!","📊 5,200+ paryaj jodi a","🇭🇹 Sipòte Ayiti!",
  ];
  const d=[...items,...items];
  return (
    <div style={{background:"rgba(0,48,135,.06)",borderBottom:"1px solid rgba(0,48,135,.12)",overflow:"hidden",height:30,display:"flex",alignItems:"center"}}>
      <div style={{display:"flex",animation:"ticker 32s linear infinite",whiteSpace:"nowrap"}}>
        {d.map((x,i)=><span key={i} style={{color:"#003087",fontSize:11,fontWeight:600,paddingRight:44,opacity:.9}}>{x}</span>)}
      </div>
    </div>
  );
}

// ── MATCH CARD ────────────────────────────────────────────────────────────────
function MatchCard({ m, slip, onPick, big=false, flashGoal=false, onViewDetail, favs, onToggleFav }) {
  const ripple = useRipple();
  const inSlip = t => slip.some(b=>b.matchId===m.id&&b.type===t&&b.marketKey==="1x2");
  const isFav = favs?.includes(m.id);

  const OB = ({type,label,odd,marketKey="1x2"}) => {
    if(!odd) return <div style={{flex:1}}/>;
    const sel = slip.some(b=>b.matchId===m.id&&b.type===type&&b.marketKey===marketKey);
    return (
      <button className={`obt${sel?" sel":""}`} onClick={e=>{ripple(e,"rgba(0,230,118,.28)");onPick(m,type,odd,label,marketKey);}} style={{flex:1,padding:big?"11px 4px":"9px 4px",borderRadius:10,border:`1px solid ${sel?"#00e676":"rgba(255,255,255,.09)"}`,background:sel?"linear-gradient(135deg,rgba(0,230,118,.18),rgba(0,200,100,.07))":"rgba(255,255,255,.04)",display:"flex",flexDirection:"column",alignItems:"center",gap:3,overflow:"hidden",position:"relative"}}>
        {sel&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00e676,#00ff99)"}}/>}
        <span style={{fontSize:10,color:sel?"#00e676":"#555",fontWeight:700,letterSpacing:.3}}>{label}</span>
        <span className="ov" style={{fontSize:big?17:15,fontWeight:800,color:sel?"#00e676":"#fff",fontFamily:"'Bebas Neue',cursive",letterSpacing:1}}>{odd}</span>
        {sel&&<span style={{fontSize:9,color:"rgba(0,230,118,.65)",fontWeight:700}}>✓</span>}
      </button>
    );
  };

  if(big) return (
    <div className="mc" style={{background:"linear-gradient(160deg,#ffffff,#f0fdf4)",border:"1px solid rgba(0,230,118,.18)",borderRadius:22,padding:20,marginBottom:12,position:"relative",overflow:"hidden",boxShadow:m.live?"0 0 50px rgba(239,68,68,.07)":"0 8px 40px rgba(0,0,0,.4)"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse at 25% 50%,rgba(0,230,118,.04) 0%,transparent 55%),radial-gradient(ellipse at 75% 50%,rgba(0,48,135,.04) 0%,transparent 55%)",pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{color:"#00e676",fontWeight:700,fontSize:12}}>{m.lg}</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {m.live?<LiveBadge min={m.min} qtr={m.qtr}/>:<span style={{color:"#94a3b8",fontSize:12}}>{m.date} · {m.time}</span>}
          {onToggleFav&&<button onClick={e=>{e.stopPropagation();onToggleFav(m.id);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",opacity:.7}}>{isFav?"⭐":"☆"}</button>}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,flex:1}}>
          <div className={m.live?"heartbeat":""} style={{filter:`drop-shadow(0 0 14px ${T[m.home]?.c}44)`}}><Logo k={m.home} sz={58}/></div>
          <span style={{color:"#0f172a",fontWeight:700,fontSize:13,textAlign:"center"}}>{T[m.home]?.n}</span>
        </div>
        <div style={{textAlign:"center",padding:"0 10px",minWidth:90}}>
          {m.live?<div className={flashGoal?"score-flash":""} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.22)",borderRadius:14,padding:"10px 14px",transition:"all .3s"}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:"#0f172a",letterSpacing:6,lineHeight:1}}>{m.hs} - {m.as}</div>
            <div style={{fontSize:9,color:"#ef4444",fontWeight:800,letterSpacing:2,marginTop:2}}>EN DIRECT</div>
          </div>:<div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:"rgba(255,255,255,.12)",letterSpacing:4}}>VS</div>
            <div style={{fontSize:13,color:"#cbd5e1",marginTop:4}}>{m.time}</div>
          </div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,flex:1}}>
          <div className={m.live?"heartbeat":""} style={{filter:`drop-shadow(0 0 14px ${T[m.away]?.c}44)`}}><Logo k={m.away} sz={58}/></div>
          <span style={{color:"#0f172a",fontWeight:700,fontSize:13,textAlign:"center"}}>{T[m.away]?.n}</span>
        </div>
      </div>
      {m.live&&<div style={{marginBottom:14}}>
        <div style={{height:3,background:"#ffffff",borderRadius:4,overflow:"hidden",position:"relative"}}>
          <div style={{height:"100%",width:`${Math.min((m.qtr?m.min/12:m.min/90)*100,100)}%`,background:"linear-gradient(90deg,#00e676,#ffd700)",borderRadius:4,transition:"width 1s"}}/>
        </div>
      </div>}
      {/* 1X2 */}
      <div style={{display:"flex",gap:8,marginBottom:8}}><OB type="home" label="1" odd={m.ho}/>{m.dr&&<OB type="draw" label="X" odd={m.dr}/>}<OB type="away" label="2" odd={m.aw}/></div>
      {/* Extra markets */}
      {m.markets?.ou?.length>0&&<div>
        <div style={{color:"#94a3b8",fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",margin:"8px 0 5px"}}>Over / Under</div>
        <div style={{display:"flex",gap:6}}>{m.markets.ou.map((mk,i)=><OB key={i} type={`ou_${i}`} label={mk.l} odd={mk.o} marketKey="ou"/>)}</div>
      </div>}
      {m.markets?.dc?.length>0&&<div>
        <div style={{color:"#94a3b8",fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",margin:"8px 0 5px"}}>Double Chans</div>
        <div style={{display:"flex",gap:6}}>{m.markets.dc.map((mk,i)=><OB key={i} type={`dc_${i}`} label={mk.l} odd={mk.o} marketKey="dc"/>)}</div>
      </div>}
      {onViewDetail&&<button className="bpress" onClick={()=>onViewDetail(m)} style={{width:"100%",marginTop:12,padding:"9px",background:"#ffffff",border:"1px solid rgba(0,0,0,.09)",borderRadius:11,color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>📊 Plis Mache →</button>}
    </div>
  );

  return (
    <div className="mc" style={{background:"#ffffff",border:"1px solid rgba(0,0,0,.08)",borderRadius:16,padding:"13px 14px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}>
        <span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{m.lg}</span>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {m.hot&&<span style={{fontSize:10,color:"#ff6b35",fontWeight:700,background:"rgba(255,107,53,.09)",border:"1px solid rgba(255,107,53,.18)",padding:"1px 7px",borderRadius:10}}>🔥</span>}
          {m.live?<LiveBadge min={m.min} qtr={m.qtr}/>:<span style={{color:"#94a3b8",fontSize:11}}>{m.date} {m.time}</span>}
          {onToggleFav&&<button onClick={e=>{e.stopPropagation();onToggleFav(m.id);}} style={{background:"none",border:"none",fontSize:14,cursor:"pointer",opacity:.5}}>{isFav?"⭐":"☆"}</button>}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}><Logo k={m.home} sz={30}/><span style={{color:"#1e293b",fontWeight:700,fontSize:13}}>{T[m.home]?.n}</span></div>
        <div style={{padding:"0 8px",minWidth:55,textAlign:"center"}}>
          {m.live?<span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:"#0f172a",letterSpacing:3}}>{m.hs}-{m.as}</span>:<span style={{color:"#e2e8f0",fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:2}}>VS</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,justifyContent:"flex-end"}}><span style={{color:"#1e293b",fontWeight:700,fontSize:13}}>{T[m.away]?.n}</span><Logo k={m.away} sz={30}/></div>
      </div>
      <div style={{display:"flex",gap:6}}><OB type="home" label="1" odd={m.ho}/>{m.dr&&<OB type="draw" label="X" odd={m.dr}/>}<OB type="away" label="2" odd={m.aw}/></div>
      {onViewDetail&&<button className="bpress" onClick={()=>onViewDetail(m)} style={{width:"100%",marginTop:8,padding:"7px",background:"#f8fafc",border:"1px solid rgba(0,0,0,.08)",borderRadius:9,color:"#94a3b8",cursor:"pointer",fontSize:11,fontWeight:600}}>Plis Mache ›</button>}
    </div>
  );
}

// ── MATCH DETAIL MODAL ────────────────────────────────────────────────────────
function MatchDetail({ m, slip, onPick, onClose }) {
  const ripple = useRipple();
  const [tab,setTab] = useState("markets");

  const OBM = ({type,label,odd,marketKey,sublabel}) => {
    const sel = slip.some(b=>b.matchId===m.id&&b.type===type&&b.marketKey===marketKey);
    return (
      <button className={`obt${sel?" sel":""}`} onClick={e=>{ripple(e,"rgba(0,230,118,.28)");onPick(m,type,odd,label,marketKey);}} style={{flex:1,padding:"11px 8px",borderRadius:11,border:`1px solid ${sel?"#00e676":"rgba(255,255,255,.09)"}`,background:sel?"rgba(0,230,118,.12)":"rgba(255,255,255,.04)",display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:0}}>
        <span style={{fontSize:11,color:sel?"#00e676":"#777",fontWeight:700,textAlign:"center",lineHeight:1.3}}>{label}</span>
        {sublabel&&<span style={{fontSize:9,color:"#94a3b8",textAlign:"center"}}>{sublabel}</span>}
        <span className="ov" style={{fontSize:18,fontWeight:800,color:sel?"#00e676":"#fff",fontFamily:"'Bebas Neue',cursive",letterSpacing:1}}>{odd}</span>
        {sel&&<span style={{fontSize:10,color:"rgba(0,230,118,.6)",fontWeight:700}}>✓ Seleksyone</span>}
      </button>
    );
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#ffffff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:480,maxHeight:"88vh",display:"flex",flexDirection:"column",animation:"slideUp .35s cubic-bezier(.34,1.56,.64,1)",boxShadow:"0 -8px 30px rgba(0,0,0,.12)"}}>
        {/* Header */}
        <div style={{padding:"14px 16px 0",flexShrink:0}}>
          <div style={{width:40,height:4,background:"#1e2840",borderRadius:2,margin:"0 auto 16px"}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{color:"#00e676",fontSize:11,fontWeight:700}}>{m.lg}</div>
              <div style={{color:"#0f172a",fontWeight:800,fontSize:16}}>{T[m.home]?.n} vs {T[m.away]?.n}</div>
            </div>
            <button onClick={onClose} style={{background:"#f1f5f9",border:"1px solid rgba(0,0,0,.12)",borderRadius:9,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b",fontSize:14}}>✕</button>
          </div>
          {/* Score if live */}
          {m.live&&<div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.18)",borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><Logo k={m.home} sz={32}/><span style={{color:"#0f172a",fontWeight:700}}>{T[m.home]?.n}</span></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,color:"#0f172a",letterSpacing:6,lineHeight:1}}>{m.hs} - {m.as}</div><LiveBadge min={m.min} qtr={m.qtr}/></div>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#0f172a",fontWeight:700}}>{T[m.away]?.n}</span><Logo k={m.away} sz={32}/></div>
          </div>}
          {/* Tabs */}
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[["markets","Mache"],["stats","Stat"],["info","Info"]].map(([id,l])=><button key={id} className="bpress" onClick={()=>setTab(id)} style={{padding:"8px 14px",borderRadius:20,border:`1.5px solid ${tab===id?"#00e676":"rgba(255,255,255,.08)"}`,background:tab===id?"rgba(0,230,118,.1)":"rgba(255,255,255,.03)",color:tab===id?"#00e676":"#555",fontWeight:700,fontSize:12,cursor:"pointer"}}>{l}</button>)}
          </div>
        </div>
        {/* Body */}
        <div style={{overflowY:"auto",padding:"0 16px 30px",flex:1}}>
          {tab==="markets"&&<>
            <div style={{marginBottom:16}}>
              <div style={{color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>🎯 Rezilta Match (1X2)</div>
              <div style={{display:"flex",gap:8}}>
                <OBM type="home" label={`${T[m.home]?.n}`} odd={m.ho} marketKey="1x2"/>
                {m.dr&&<OBM type="draw" label="Match Nul" odd={m.dr} marketKey="1x2"/>}
                <OBM type="away" label={`${T[m.away]?.n}`} odd={m.aw} marketKey="1x2"/>
              </div>
            </div>
            {m.markets?.ou?.length>0&&<div style={{marginBottom:16}}>
              <div style={{color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>📊 Over / Under Gòl</div>
              <div style={{display:"flex",gap:8}}>{m.markets.ou.map((mk,i)=><OBM key={i} type={`ou_${i}`} label={mk.l} odd={mk.o} marketKey="ou"/>)}</div>
            </div>}
            {m.markets?.dc?.length>0&&<div style={{marginBottom:16}}>
              <div style={{color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>🔄 Double Chans</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{m.markets.dc.map((mk,i)=><OBM key={i} type={`dc_${i}`} label={mk.l} odd={mk.o} marketKey="dc"/>)}</div>
            </div>}
            {m.markets?.btts?.length>0&&<div style={{marginBottom:16}}>
              <div style={{color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>⚽ Tou De Ekip Make Gòl?</div>
              <div style={{display:"flex",gap:8}}>{m.markets.btts.map((mk,i)=><OBM key={i} type={`btts_${i}`} label={mk.l} odd={mk.o} marketKey="btts"/>)}</div>
            </div>}
          </>}
          {tab==="stats"&&<div style={{padding:"8px 0"}}>
            {[[T[m.home]?.n,52,T[m.away]?.n,"Posesyon Boul (%)"],[T[m.home]?.n,6,T[m.away]?.n,"Tir oswa Cadre"],[T[m.home]?.n,4,T[m.away]?.n,"Kou Dwat"],[T[m.home]?.n,3,T[m.away]?.n,"Kou Kwen"]].map(([h,v,a,label],i)=>(
              <div key={i} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:"#64748b",fontSize:12}}>{h}</span><span style={{color:"#94a3b8",fontSize:11,fontWeight:700}}>{label}</span><span style={{color:"#64748b",fontSize:12}}>{a}</span></div>
                <div style={{height:4,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${v}%`,background:"linear-gradient(90deg,#00e676,#ffd700)",borderRadius:4}}/></div>
              </div>
            ))}
          </div>}
          {tab==="info"&&<div style={{padding:"8px 0"}}>
            {[["📍","Kote",m.live?"En Direct":"Pa kòmanse ankò"],["📅","Dat",m.date+" · "+m.time],["🏆","Konpetisyon",m.lg],["⚡","Estati",m.live?"En dirèk ⚡":"Kap Vini"],["🎯","Total Mache","4 mache disponib"]].map(([ic,l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"#ffffff",borderRadius:12,marginBottom:8}}>
                <span style={{color:"#94a3b8",fontSize:13}}>{ic} {l}</span>
                <span style={{color:"#1e293b",fontSize:13,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </div>
  );
}

// ── BETSLIP ───────────────────────────────────────────────────────────────────
function Betslip({ slip, onRemove, onClear, onPlace, user, onClose, onConfetti }) {
  const ripple = useRipple();
  const [amt,setAmt]=useState("");const[bonus,setBonus]=useState(false);const[placed,setPlaced]=useState(false);const[err,setErr]=useState("");
  const total = slip.reduce((a,b)=>a*b.odd,1);
  const n = parseFloat(amt)||0; const pot = Math.round(n*total);
  const bal = bonus?user.bonusBalance:user.realBalance;
  const ok = n>=25&&n<=bal&&slip.length>0;

  const place = e => {
    ripple(e,"rgba(0,230,118,.4)");setErr("");
    if(n<25) return setErr("Minimòm mise se 25 HTG");
    if(n>bal) return setErr(bonus?"Bonus pa sifi!":"Balans pa sifi — depoze via MonCash!");
    setPlaced(true);
    setTimeout(()=>{onConfetti();onPlace(n,bonus,total);setPlaced(false);onClose();},1200);
  };

  if(placed) return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:800,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:80,animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>🎯</div>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:44,color:"#00e676",letterSpacing:4,textShadow:"0 0 30px rgba(0,230,118,.5)"}}>PARYAJ PASE!</div>
      <div style={{color:"#94a3b8",fontSize:14}}>Bon chans pou ou! 🍀</div>
    </div>
  );

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#ffffff",borderRadius:"24px 24px 0 0",padding:"8px 16px 38px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",animation:"slideUp .35s cubic-bezier(.34,1.56,.64,1)",boxShadow:"0 -8px 30px rgba(0,0,0,.12)"}}>
        <div style={{width:40,height:4,background:"#1e2840",borderRadius:2,margin:"8px auto 18px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"rgba(0,230,118,.1)",border:"1px solid rgba(0,230,118,.22)",borderRadius:10,padding:"6px 10px",fontSize:18}}>🎟️</div>
            <div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#0f172a",letterSpacing:2}}>BETSLIP</div><div style={{color:"#cbd5e1",fontSize:11,fontWeight:600}}>{slip.length} selebsyon</div></div>
          </div>
          <button onClick={onClear} style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.18)",borderRadius:8,padding:"6px 12px",color:"#ef4444",cursor:"pointer",fontSize:12,fontWeight:700}}>Efase Tout</button>
        </div>
        {slip.map((b,i)=>(
          <div key={i} style={{background:"#ffffff",border:"1px solid rgba(0,0,0,.08)",borderRadius:13,padding:"11px 13px",marginBottom:8,display:"flex",alignItems:"center",gap:10,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:"linear-gradient(180deg,#00e676,#00b85a)",borderRadius:"3px 0 0 3px"}}/>
            <Logo k={b.home} sz={26}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:"#0f172a",fontSize:12,fontWeight:700,marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{T[b.home]?.n} vs {T[b.away]?.n}</div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{background:"rgba(0,230,118,.1)",color:"#00e676",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6}}>{b.typeLabel}</span>
                <span style={{color:"#ffd700",fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:1}}>x{b.odd}</span>
                <span style={{color:"#cbd5e1",fontSize:10}}>{b.marketKey!=="1x2"?`[${b.marketKey.toUpperCase()}]`:""}</span>
              </div>
            </div>
            <Logo k={b.away} sz={26}/>
            <button onClick={()=>onRemove(b.matchId,b.type,b.marketKey)} style={{background:"#ffffff",border:"1px solid rgba(0,0,0,.08)",borderRadius:6,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#94a3b8",fontSize:12,flexShrink:0}}>✕</button>
          </div>
        ))}
        <div style={{background:"rgba(255,215,0,.05)",border:"1px solid rgba(255,215,0,.1)",borderRadius:13,padding:"13px 16px",margin:"14px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#64748b",fontWeight:600}}>Cote Total</span>
          <span style={{color:"#ffd700",fontFamily:"'Bebas Neue',cursive",fontSize:28,letterSpacing:2}}>{total.toFixed(2)}x</span>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[{l:`💵 Reyèl\n${htg(user.realBalance)}`,v:false},{l:`🎁 Bonus\n${htg(user.bonusBalance)}`,v:true}].map(o=>(
            <button key={String(o.v)} className="bpress" onClick={()=>setBonus(o.v)} style={{flex:1,padding:"11px 8px",borderRadius:12,cursor:"pointer",background:bonus===o.v?"rgba(0,230,118,.09)":"rgba(255,255,255,.03)",border:`1.5px solid ${bonus===o.v?"#00e676":"rgba(255,255,255,.07)"}`,color:bonus===o.v?"#00e676":"#555",transition:"all .2s",textAlign:"center"}}>
              {o.l.split("\n").map((line,i)=><div key={i} style={{fontSize:i===0?12:11,fontWeight:i===0?700:500}}>{line}</div>)}
            </button>
          ))}
        </div>
        <input style={{...IS,fontSize:20,fontWeight:800,textAlign:"center",marginBottom:8}} type="number" placeholder="Montan (HTG)" value={amt} onChange={e=>setAmt(e.target.value)}/>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[25,50,100,250,500].map(v=><button key={v} className="bpress" onClick={()=>setAmt(String(v))} style={{flex:1,padding:"8px 4px",background:amt===String(v)?"rgba(0,230,118,.09)":"rgba(255,255,255,.04)",border:`1px solid ${amt===String(v)?"rgba(0,230,118,.28)":"rgba(255,255,255,.06)"}`,borderRadius:9,color:amt===String(v)?"#00e676":"#666",cursor:"pointer",fontSize:12,fontWeight:700,transition:"all .15s"}}>{v}</button>)}
        </div>
        {pot>0&&<div style={{background:"linear-gradient(135deg,rgba(0,230,118,.07),rgba(0,200,100,.03))",border:"1px solid rgba(0,230,118,.13)",borderRadius:13,padding:"13px 16px",marginBottom:12,animation:"pop .3s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{color:"#6b7280",fontSize:12,marginBottom:3}}>Ou ka genyen</div><div style={{color:"#00e676",fontFamily:"'Bebas Neue',cursive",fontSize:32,letterSpacing:2,lineHeight:1}}>{htg(pot)}</div></div>
            <div style={{textAlign:"right"}}><div style={{color:"#6b7280",fontSize:11}}>Mise</div><div style={{color:"#0f172a",fontWeight:700,fontSize:14}}>{htg(n)}</div></div>
          </div>
        </div>}
        {err&&<div style={{color:"#ef4444",fontSize:13,marginBottom:12,textAlign:"center",animation:"shake .4s ease",background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.14)",borderRadius:10,padding:"9px 14px"}}>⚠️ {err}</div>}
        <button className="bpress" onClick={place} style={{width:"100%",padding:16,background:ok?"linear-gradient(135deg,#00e676,#00cc5e)":"rgba(255,255,255,.04)",border:`1px solid ${ok?"transparent":"rgba(255,255,255,.06)"}`,borderRadius:16,color:ok?"#000":"#3a4050",fontSize:16,fontWeight:800,cursor:ok?"pointer":"default",boxShadow:ok?"0 8px 30px rgba(0,230,118,.28)":"none",transition:"all .3s",position:"relative",overflow:"hidden"}}>
          {!amt?"Mete Montan":n<25?"Minimòm 25 HTG":n>bal?"Balans Pa Sifi":"🎯 Valide Paryaj"}
        </button>
      </div>
    </div>
  );
}

// ── HOME TAB ──────────────────────────────────────────────────────────────────
const CATS=[{id:"all",n:"Tout",ic:"🌍"},{id:"carib",n:"Caraïbes",ic:"🌊"},{id:"euro",n:"Europe",ic:"🏆"},{id:"intl",n:"Mondial",ic:"🌐"},{id:"nba",n:"NBA",ic:"🏀"}];

function HomeTab({ user, matches, slip, onPick, goTab, goalFlash, onViewDetail, favs, onToggleFav, promos }) {
  const ripple = useRipple();
  const feat = matches.find(m=>m.feat);
  const live = matches.filter(m=>m.live&&!m.feat);
  const soon = matches.filter(m=>!m.live).slice(0,4);
  return (
    <div style={{padding:"16px 14px 0"}}>
      <div className="fu0" style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{color:"#94a3b8",fontSize:13,fontWeight:500}}>Bonjou 👋</div><div style={{color:"#0f172a",fontWeight:800,fontSize:24}}>{user.name}</div></div>
        <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,padding:"8px 12px",textAlign:"right"}}>
          <div style={{color:"#ef4444",fontSize:10,fontWeight:800,letterSpacing:.5,display:"flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:"#ef4444",animation:"pulse 1s infinite",display:"inline-block"}}/> LIVE</div>
          <div style={{color:"#1e293b",fontSize:13,fontWeight:700,marginTop:1}}>{matches.filter(m=>m.live).length} match</div>
        </div>
      </div>

      {/* Balances */}
      <div className="fu1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid rgba(0,230,118,.16)",borderRadius:18,padding:"14px 15px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-15,right:-15,width:55,height:55,borderRadius:"50%",background:"radial-gradient(rgba(0,230,118,.12),transparent)"}}/>
          <div style={{color:"#00e676",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1.1,marginBottom:5}}>💵 Balans Reyèl</div>
          <div style={{color:"#0f172a",fontWeight:900,fontSize:18,fontFamily:"'Bebas Neue',cursive",letterSpacing:1}}>{htg(user.realBalance)}</div>
          <button className="bpress" onClick={()=>goTab("wallet")} style={{marginTop:7,padding:"4px 10px",background:"rgba(0,230,118,.1)",border:"1px solid rgba(0,230,118,.18)",borderRadius:7,color:"#00e676",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Depoze</button>
        </div>
        <div style={{background:"linear-gradient(135deg,#1c1808,#120f08)",border:"1px solid rgba(255,215,0,.16)",borderRadius:18,padding:"14px 15px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-15,right:-15,width:55,height:55,borderRadius:"50%",background:"radial-gradient(rgba(255,215,0,.1),transparent)"}}/>
          <div style={{color:"#ffd700",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1.1,marginBottom:5}}>🎁 Bonus</div>
          <div style={{color:"#0f172a",fontWeight:900,fontSize:18,fontFamily:"'Bebas Neue',cursive",letterSpacing:1}}>{htg(user.bonusBalance)}</div>
          <div style={{marginTop:7,color:"#94a3b8",fontSize:10,fontWeight:600}}>Non-retirable</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="fu2" style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
        {[{ic:"⬇️",l:"Depoze",t:"wallet"},{ic:"⬆️",l:"Retire",t:"wallet"},{ic:"⭐",l:"Favoris",t:"favs"},{ic:"🔍",l:"Chèche",t:"search"},{ic:"🎁",l:"Promo",t:"promos"}].map(a=>(
          <button key={a.l} className="bpress" onClick={e=>{ripple(e,"rgba(255,255,255,.1)");goTab(a.t);}} style={{flex:"0 0 auto",minWidth:62,padding:"10px 6px",background:"#ffffff",border:"1px solid rgba(0,0,0,.08)",borderRadius:13,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,position:"relative",overflow:"hidden"}}>
            <span style={{fontSize:21}}>{a.ic}</span>
            <span style={{color:"#94a3b8",fontSize:9.5,fontWeight:600}}>{a.l}</span>
          </button>
        ))}
      </div>

      {/* Promos banner */}
      {promos?.length>0&&(
        <div className="fu2" style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#0f172a",fontWeight:700,fontSize:14}}>🎁 Pwomosyon</span><button onClick={()=>goTab("promos")} style={{background:"none",border:"none",color:"#00e676",fontSize:12,cursor:"pointer"}}>Tout →</button></div>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>
            {promos.slice(0,3).map((p,i)=>(
              <div key={i} style={{flex:"0 0 auto",width:220,background:`linear-gradient(135deg,${p.from},${p.to})`,border:`1px solid ${p.border}`,borderRadius:16,padding:"14px 15px",position:"relative",overflow:"hidden"}}>
                <div style={{fontSize:24,marginBottom:6}}>{p.icon}</div>
                <div style={{color:"#0f172a",fontWeight:800,fontSize:14,marginBottom:3}}>{p.title}</div>
                <div style={{color:"rgba(255,255,255,.6)",fontSize:11,lineHeight:1.4}}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {feat&&<div className="fu3"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{color:"#0f172a",fontWeight:800,fontSize:16}}>⭐ Match Vedèt</span>{feat.live&&<span style={{background:"rgba(239,68,68,.12)",color:"#ef4444",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:10,animation:"pulse 2s infinite"}}>EN DIRECT</span>}</div><MatchCard m={feat} slip={slip} onPick={onPick} big flashGoal={goalFlash===feat.id} onViewDetail={onViewDetail} favs={favs} onToggleFav={onToggleFav}/></div>}
      {live.length>0&&<div className="fu4"><div style={{display:"flex",justifyContent:"space-between",marginBottom:10,marginTop:4}}><span style={{color:"#0f172a",fontWeight:800,fontSize:16}}>🔴 En Direct ({live.length})</span><button onClick={()=>goTab("matches")} style={{background:"none",border:"none",color:"#00e676",fontSize:12,cursor:"pointer",fontWeight:600}}>Tout →</button></div>{live.map(m=><MatchCard key={m.id} m={m} slip={slip} onPick={onPick} flashGoal={goalFlash===m.id} onViewDetail={onViewDetail} favs={favs} onToggleFav={onToggleFav}/>)}</div>}
      <div className="fu5"><div style={{display:"flex",justifyContent:"space-between",marginBottom:10,marginTop:8}}><span style={{color:"#0f172a",fontWeight:800,fontSize:16}}>🗓️ Kap Vini</span><button onClick={()=>goTab("matches")} style={{background:"none",border:"none",color:"#00e676",fontSize:12,cursor:"pointer",fontWeight:600}}>Tout →</button></div>{soon.map(m=><MatchCard key={m.id} m={m} slip={slip} onPick={onPick} onViewDetail={onViewDetail} favs={favs} onToggleFav={onToggleFav}/>)}</div>
    </div>
  );
}

// ── MATCHES TAB ───────────────────────────────────────────────────────────────
function MatchesTab({ matches, slip, onPick, onViewDetail, favs, onToggleFav }) {
  const [cat,setCat]=useState("all");const[search,setSearch]=useState("");
  const list = matches.filter(m=>(cat==="all"||m.cat===cat)&&(!search||T[m.home]?.n.toLowerCase().includes(search.toLowerCase())||T[m.away]?.n.toLowerCase().includes(search.toLowerCase())||m.lg.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{padding:"16px 14px 0"}}>
      <div className="fu0" style={{color:"#0f172a",fontWeight:800,fontSize:24,marginBottom:12}}>Tout Match</div>
      <div className="fu1" style={{position:"relative",marginBottom:12}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:16,zIndex:1}}>🔍</span>
        <input style={{...IS,paddingLeft:40}} placeholder="Chèche ekip, lig..." value={search} onChange={e=>setSearch(e.target.value)}/>
        {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:18}}>×</button>}
      </div>
      <div className="fu2" style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:14}}>
        {CATS.map(c=><button key={c.id} className="bpress" onClick={()=>setCat(c.id)} style={{padding:"8px 15px",borderRadius:22,border:`1.5px solid ${cat===c.id?"#00e676":"rgba(255,255,255,.07)"}`,background:cat===c.id?"rgba(0,230,118,.1)":"rgba(255,255,255,.03)",color:cat===c.id?"#00e676":"#555",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s",boxShadow:cat===c.id?"0 4px 16px rgba(0,230,118,.12)":"none"}}>{c.ic} {c.n}</button>)}
      </div>
      {list.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:"#94a3b8",fontSize:14}}>🔍 Pa gen rezilta pou "<strong style={{color:"#64748b"}}>{search}</strong>"</div>
      :list.map((m,i)=><div key={m.id} className={`fu${Math.min(i,5)}`}><MatchCard m={m} slip={slip} onPick={onPick} big={m.feat||(m.live&&i===0)} onViewDetail={onViewDetail} favs={favs} onToggleFav={onToggleFav}/></div>)}
    </div>
  );
}

// ── SEARCH TAB ────────────────────────────────────────────────────────────────
function SearchTab({ matches, slip, onPick, onViewDetail }) {
  const [q,setQ]=useState("");
  const res = q.length>1?matches.filter(m=>T[m.home]?.n.toLowerCase().includes(q.toLowerCase())||T[m.away]?.n.toLowerCase().includes(q.toLowerCase())||m.lg.toLowerCase().includes(q.toLowerCase())):[];
  return (
    <div style={{padding:"16px 14px 0"}}>
      <div className="fu0" style={{color:"#0f172a",fontWeight:800,fontSize:24,marginBottom:14}}>🔍 Rechèch</div>
      <div style={{position:"relative",marginBottom:16}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:18}}>🔍</span>
        <input autoFocus style={{...IS,paddingLeft:44,fontSize:16}} placeholder="Ekip, lig, konpetisyon..." value={q} onChange={e=>setQ(e.target.value)}/>
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:20}}>×</button>}
      </div>
      {q.length===0&&<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:48,marginBottom:12,opacity:.3}}>🔍</div><div style={{color:"#cbd5e1",fontSize:14}}>Tape pou chèche match...</div></div>}
      {q.length>0&&q.length<2&&<div style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:20}}>Tape omwen 2 lèt...</div>}
      {res.length>0&&<div className="fu0">{res.map(m=><MatchCard key={m.id} m={m} slip={slip} onPick={onPick} onViewDetail={onViewDetail}/>)}</div>}
      {q.length>=2&&res.length===0&&<div style={{textAlign:"center",padding:"30px 20px",color:"#94a3b8",fontSize:14}}>Okenn match jwenn pou "{q}"</div>}
    </div>
  );
}

// ── FAVORITES TAB ─────────────────────────────────────────────────────────────
function FavsTab({ matches, slip, onPick, favs, onToggleFav, onViewDetail }) {
  const list = matches.filter(m=>favs.includes(m.id));
  return (
    <div style={{padding:"16px 14px 0"}}>
      <div className="fu0" style={{color:"#0f172a",fontWeight:800,fontSize:24,marginBottom:14}}>⭐ Favoris</div>
      {list.length===0?<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:56,marginBottom:12,animation:"float 2s ease-in-out infinite"}}>⭐</div><div style={{color:"#0f172a",fontWeight:700,fontSize:18,marginBottom:8}}>Pa gen favoris</div><div style={{color:"#94a3b8",fontSize:14}}>Klike sou ⭐ sou yon match pou ajoute li isit</div></div>
      :list.map(m=><MatchCard key={m.id} m={m} slip={slip} onPick={onPick} favs={favs} onToggleFav={onToggleFav} onViewDetail={onViewDetail}/>)}
    </div>
  );
}

// ── PROMOS TAB ────────────────────────────────────────────────────────────────
function PromosTab({ promos }) {
  return (
    <div style={{padding:"16px 14px 0"}}>
      <div className="fu0" style={{color:"#0f172a",fontWeight:800,fontSize:24,marginBottom:16}}>🎁 Pwomosyon</div>
      {promos.map((p,i)=>(
        <div key={i} className={`fu${i}`} style={{background:`linear-gradient(135deg,${p.from},${p.to})`,border:`1px solid ${p.border}`,borderRadius:20,padding:20,marginBottom:12,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-10,top:-10,fontSize:80,opacity:.1}}>{p.icon}</div>
          <div style={{fontSize:36,marginBottom:12}}>{p.icon}</div>
          <div style={{color:"#0f172a",fontWeight:900,fontSize:20,marginBottom:6}}>{p.title}</div>
          <div style={{color:"rgba(255,255,255,.7)",fontSize:13,lineHeight:1.6,marginBottom:16}}>{p.desc}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {p.tags.map((t,j)=><span key={j} style={{background:"rgba(255,255,255,.15)",color:"#0f172a",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20}}>{t}</span>)}
          </div>
          <button className="bpress" style={{marginTop:16,padding:"11px 24px",background:"rgba(255,255,255,.9)",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:14,cursor:"pointer"}}>Pwofite Kounye a</button>
        </div>
      ))}
    </div>
  );
}

// ── WALLET TAB ────────────────────────────────────────────────────────────────
function WalletTab({ user, onDeposit, txHistory }) {
  const ripple = useRipple();
  const [mode,setMode]=useState(null);const[amt,setAmt]=useState("");const[ph,setPh]=useState("");const[step,setStep]=useState(1);
  const go=async e=>{
    ripple(e,"rgba(0,230,118,.3)");
    if(!amt||parseFloat(amt)<50)return;
    setStep(2);
    try {
      const token = localStorage.getItem("rivayo_token");
      const res = await fetch("http://localhost:3001/api/wallet/deposit/moncash",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
        body: JSON.stringify({amount:parseFloat(amt), moncashPhone:ph||user.phone})
      });
      const data = await res.json();
      // Konfime depo a otomatikman (sandbox mode)
      if(data.simulatedConfirm){
        await fetch(`http://localhost:3001${data.simulatedConfirm}`,{method:"POST"});
      }
      setStep(3);
      onDeposit(parseFloat(amt));
    } catch(err){
      setStep(3);
      onDeposit(parseFloat(amt)); // mache lokal si backend pa reponn
    }
  };
  const reset=()=>{setMode(null);setStep(1);setAmt("");setPh("");};
  return (
    <div style={{padding:"16px 14px 0"}}>
      <div className="fu0" style={{color:"#0f172a",fontWeight:800,fontSize:24,marginBottom:14}}>💰 Kès Mwen</div>
      <div className="fu1" style={{background:"linear-gradient(135deg,#003087,#0047c8)",border:"1px solid rgba(0,230,118,.16)",borderRadius:22,padding:20,marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-25,right:-25,width:110,height:110,borderRadius:"50%",background:"radial-gradient(rgba(0,230,118,.07),transparent)"}}/>
        <img src="https://flagcdn.com/w80/ht.png" style={{position:"absolute",bottom:-10,right:-10,width:80,opacity:.05,filter:"grayscale(1)"}} alt=""/>
        <div style={{marginBottom:14}}><div style={{color:"#00e676",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.1,marginBottom:4}}>Balans Reyèl</div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:40,color:"#0f172a",letterSpacing:3,lineHeight:1}}>{htg(user.realBalance)}</div></div>
        <div style={{borderTop:"1px solid rgba(0,0,0,.08)",paddingTop:12}}><div style={{color:"#ffd700",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.1,marginBottom:4}}>Bonus 🎁</div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:"#ffd700",letterSpacing:2}}>{htg(user.bonusBalance)}</div><div style={{color:"#cbd5e1",fontSize:11,marginTop:3}}>Pa retirable — pou paryaj sèlman</div></div>
      </div>

      {/* Bonus rules */}
      <div className="fu2" style={{background:"rgba(255,215,0,.03)",border:"1px solid rgba(255,215,0,.09)",borderRadius:15,padding:14,marginBottom:16}}>
        <div style={{color:"#ffd700",fontWeight:800,marginBottom:8,fontSize:13}}>📌 Règ Bonus 50 HTG</div>
        {[["✅","Parye gratis — zéro risk pou ou"],["✅","Si ou genyen → kòb reyèl antre nan kont ou"],["❌","Ou pa ka retire bonus a dirèkteman"],["💡","Depoze 100 HTG+ pou ka retire kòb ou"]].map(([ic,t],i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5,alignItems:"flex-start"}}><span style={{fontSize:13,flexShrink:0}}>{ic}</span><span style={{color:"#999",fontSize:12,lineHeight:1.5}}>{t}</span></div>)}
      </div>

      <div className="fu3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        <button className="bpress" onClick={e=>{ripple(e,"rgba(0,230,118,.2)");setMode("dep");setStep(1);}} style={{padding:"17px 12px",background:"rgba(0,230,118,.05)",border:"1px solid rgba(0,230,118,.18)",borderRadius:18,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,position:"relative",overflow:"hidden"}}><span style={{fontSize:30}}>⬇️</span><span style={{color:"#00e676",fontWeight:800,fontSize:15}}>Depoze</span><span style={{color:"#cbd5e1",fontSize:11}}>via MonCash</span></button>
        <button className="bpress" onClick={e=>{ripple(e,"rgba(255,215,0,.15)");setMode("wd");}} style={{padding:"17px 12px",background:"rgba(255,215,0,.04)",border:"1px solid rgba(255,215,0,.14)",borderRadius:18,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,position:"relative",overflow:"hidden"}}><span style={{fontSize:30}}>⬆️</span><span style={{color:"#ffd700",fontWeight:800,fontSize:15}}>Retire</span><span style={{color:"#cbd5e1",fontSize:11}}>via MonCash</span></button>
      </div>

      <div className="fu4"><div style={{color:"#0f172a",fontWeight:700,marginBottom:11,fontSize:15}}>📊 Istwa Tranzaksyon</div>
        {txHistory.map((tx,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#ffffff",border:"1px solid rgba(255,255,255,.05)",borderRadius:13,padding:"13px 15px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:38,height:38,borderRadius:11,background:`rgba(${tx.plus?"0,230,118":"239,68,68"},.07)`,border:`1px solid rgba(${tx.plus?"0,230,118":"239,68,68"},.1)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{tx.icon}</div><div><div style={{color:"#1e293b",fontSize:13,fontWeight:600}}>{tx.label}</div><div style={{color:"#cbd5e1",fontSize:11,marginTop:1}}>{tx.date}</div></div></div>
            <div style={{textAlign:"right"}}><div style={{color:tx.plus?"#00e676":"#ef4444",fontWeight:800,fontSize:15}}>{tx.plus?"+":"-"}{htg(tx.amount)}</div><div style={{color:"#cbd5e1",fontSize:10,marginTop:2}}>{tx.status}</div></div>
          </div>
        ))}
        {txHistory.length===0&&<div style={{color:"#cbd5e1",fontSize:13,textAlign:"center",padding:20}}>Pa gen tranzaksyon ankò</div>}
      </div>

      {/* Deposit modal */}
      {mode==="dep"&&<div onClick={e=>e.target===e.currentTarget&&reset()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
        <div style={{background:"#ffffff",borderRadius:"24px 24px 0 0",padding:"12px 20px 40px",width:"100%",maxWidth:480,animation:"slideUp .35s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{width:40,height:4,background:"#1e2840",borderRadius:2,margin:"4px auto 20px"}}/>
          {step===1&&<>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}><div style={{width:50,height:50,borderRadius:14,background:"rgba(255,215,0,.1)",border:"1px solid rgba(255,215,0,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>📱</div><div><div style={{color:"#0f172a",fontWeight:800,fontSize:20}}>Depoze via MonCash</div><div style={{color:"#94a3b8",fontSize:12}}>Konfime nan mwens ke 5 minit</div></div></div>
            <div style={{marginBottom:13}}><label style={{display:"block",color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:1.1}}>📱 Nimewo MonCash</label><div style={{display:"flex"}}><div style={{...IS,width:"auto",padding:"0 12px",display:"flex",alignItems:"center",gap:6,borderTopRightRadius:0,borderBottomRightRadius:0,borderRight:"none",color:"#6b7280",fontSize:14,flexShrink:0}}><img src="https://flagcdn.com/w40/ht.png" style={{width:20,height:14,objectFit:"cover",borderRadius:2}} alt=""/>+509</div><input style={{...IS,flex:1,borderTopLeftRadius:0,borderBottomLeftRadius:0}} placeholder="4xxx xxxx" value={ph} onChange={e=>setPh(e.target.value)}/></div></div>
            <div style={{marginBottom:13}}><label style={{display:"block",color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:1.1}}>💵 Montan HTG — min 50</label><input style={IS} type="number" placeholder="100" value={amt} onChange={e=>setAmt(e.target.value)}/></div>
            <div style={{display:"flex",gap:8,marginBottom:18}}>{[100,250,500,1000].map(v=><button key={v} className="bpress" onClick={()=>setAmt(String(v))} style={{flex:1,padding:"9px 4px",background:amt===String(v)?"rgba(0,230,118,.09)":"rgba(255,255,255,.04)",border:`1px solid ${amt===String(v)?"rgba(0,230,118,.28)":"rgba(255,255,255,.07)"}`,borderRadius:10,color:amt===String(v)?"#00e676":"#555",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all .15s"}}>{v}</button>)}</div>
            <button className="bpress" onClick={go} style={{width:"100%",padding:15,background:"linear-gradient(135deg,#00e676,#00cc5e)",border:"none",borderRadius:16,color:"#000",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 28px rgba(0,230,118,.22)",position:"relative",overflow:"hidden"}}>Depoze Kounye a →</button>
            <button onClick={reset} style={{width:"100%",marginTop:10,padding:12,background:"none",border:"1px solid rgba(255,255,255,.06)",borderRadius:14,color:"#94a3b8",cursor:"pointer"}}>Anile</button>
          </>}
          {step===2&&<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{width:64,height:64,border:"3px solid rgba(0,230,118,.12)",borderTop:"3px solid #00e676",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 22px"}}/><div style={{color:"#0f172a",fontWeight:800,fontSize:20,marginBottom:8}}>Ap Trete...</div><div style={{color:"#94a3b8",fontSize:13}}>Verifye operasyon nan MonCash ou</div></div>}
          {step===3&&<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:72,animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>✅</div><div style={{color:"#00e676",fontFamily:"'Bebas Neue',cursive",fontSize:36,letterSpacing:3,margin:"12px 0 8px"}}>DEPO KONFIME!</div><div style={{color:"#6b7280",marginBottom:24}}>{htg(parseFloat(amt))} ajoute nan kont ou</div><button className="bpress" onClick={reset} style={{padding:"12px 30px",background:"rgba(0,230,118,.09)",border:"1px solid rgba(0,230,118,.22)",borderRadius:14,color:"#00e676",cursor:"pointer",fontWeight:700,fontSize:15}}>Fèmen</button></div>}
        </div>
      </div>}
      {mode==="wd"&&<div onClick={e=>e.target===e.currentTarget&&reset()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
        <div style={{background:"#ffffff",border:"1px solid rgba(0,0,0,.08)",borderRadius:24,padding:24,width:"100%",maxWidth:360,animation:"pop .35s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{color:"#0f172a",fontWeight:800,fontSize:20,marginBottom:14}}>⬆️ Retire via MonCash</div>
          {user.realBalance<100?<div style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.15)",borderRadius:13,padding:15,color:"#ef4444",fontSize:14,lineHeight:1.8}}>⚠️ Ou bezwen omwen <strong>100 HTG</strong> reyèl pou retire.<br/><span style={{color:"#94a3b8",fontSize:12}}>Balans: {htg(user.realBalance)}</span></div>:<div style={{color:"#64748b",fontSize:14}}>Retrè disponib. Trete nan 1-24 zèdtan.</div>}
          <button onClick={reset} style={{width:"100%",marginTop:16,padding:13,background:"none",border:"1px solid rgba(0,0,0,.08)",borderRadius:14,color:"#94a3b8",cursor:"pointer"}}>Fèmen</button>
        </div>
      </div>}
    </div>
  );
}

// ── BETS TAB ──────────────────────────────────────────────────────────────────
function BetsTab({ bets }) {
  const [filter,setFilter]=useState("all");
  const list = filter==="all"?bets:bets.filter(b=>b.status===filter);
  return (
    <div style={{padding:"16px 14px 0"}}>
      <div className="fu0" style={{color:"#0f172a",fontWeight:800,fontSize:24,marginBottom:14}}>📋 Paryaj Mwen</div>
      <div className="fu1" style={{display:"flex",gap:8,marginBottom:14}}>
        {[["all","Tout"],["pending","An Atant"],["won","Genyen"],["lost","Pèdi"]].map(([v,l])=>(
          <button key={v} className="bpress" onClick={()=>setFilter(v)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1.5px solid ${filter===v?"#00e676":"rgba(255,255,255,.07)"}`,background:filter===v?"rgba(0,230,118,.1)":"rgba(255,255,255,.03)",color:filter===v?"#00e676":"#555",fontWeight:700,fontSize:11,cursor:"pointer",transition:"all .2s"}}>{l}</button>
        ))}
      </div>
      {!bets.length?<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:68,animation:"float 3s ease-in-out infinite"}}>🎟️</div><div style={{color:"#0f172a",fontWeight:800,fontSize:20,marginTop:12}}>Pa gen paryaj ankò</div><div style={{color:"#cbd5e1",fontSize:14,marginTop:6,lineHeight:1.7}}>Ale chwazi yon match!</div></div>:null}
      {bets.length>0&&list.length===0?<div style={{textAlign:"center",padding:"30px",color:"#94a3b8",fontSize:14}}>Pa gen paryaj "{filter}" ankò</div>:null}
      {list.map((b,i)=>(
        <div key={i} className="fu0" style={{background:b.status==="won"?"rgba(0,230,118,.05)":b.status==="lost"?"rgba(239,68,68,.05)":"rgba(255,255,255,.025)",border:`1px solid ${b.status==="won"?"rgba(0,230,118,.16)":b.status==="lost"?"rgba(239,68,68,.16)":"rgba(255,255,255,.065)"}`,borderRadius:18,padding:15,marginBottom:10,position:"relative",overflow:"hidden"}}>
          {b.status==="pending"&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#ffd700,transparent)",animation:"gradShift 2s ease infinite",backgroundSize:"200% 100%"}}/>}
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}><span style={{color:"#cbd5e1",fontSize:12}}>{b.date} · {b.time}</span><span style={{fontSize:12,fontWeight:700,background:b.status==="won"?"rgba(0,230,118,.1)":b.status==="lost"?"rgba(239,68,68,.09)":"rgba(255,215,0,.08)",color:b.status==="won"?"#00e676":b.status==="lost"?"#ef4444":"#ffd700",padding:"3px 10px",borderRadius:20}}>{b.status==="won"?"✅ Genyen":b.status==="lost"?"❌ Pèdi":"⏳ An Atant"}</span></div>
          {b.selections.map((sel,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,background:"#f8fafc",borderRadius:10,padding:"8px 10px"}}><Logo k={sel.home} sz={22}/><div style={{flex:1,minWidth:0}}><div style={{color:"#475569",fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{T[sel.home]?.n} vs {T[sel.away]?.n}</div><div style={{color:"#94a3b8",fontSize:10,marginTop:1}}>{sel.marketKey!=="1x2"?`[${sel.marketKey?.toUpperCase()}] `:""}{sel.typeLabel}</div></div><span style={{background:"rgba(0,230,118,.09)",color:"#00e676",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6,whiteSpace:"nowrap"}}>@ {sel.odd}</span><Logo k={sel.away} sz={22}/></div>)}
          <div style={{borderTop:"1px solid rgba(0,0,0,.07)",marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{color:"#cbd5e1",fontSize:11}}>Mise{b.bonus?" 🎁":""}</div><div style={{color:"#64748b",fontWeight:700,fontSize:14}}>{htg(b.amount)}</div></div>
            <div style={{textAlign:"center"}}><div style={{color:"#cbd5e1",fontSize:11}}>Cote</div><div style={{color:"#ffd700",fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:1}}>x{b.totalOdd.toFixed(2)}</div></div>
            <div style={{textAlign:"right"}}><div style={{color:"#cbd5e1",fontSize:11}}>Pou Genyen</div><div style={{color:b.status==="won"?"#00e676":"#888",fontWeight:800,fontSize:14}}>{b.status==="won"?"+":""}{htg(b.potential)}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab({ user, bets, onLogout, onUpdateUser }) {
  const ripple = useRipple();
  const [modal,setModal]=useState(null);
  const [newPin,setNewPin]=useState("");const[confPin,setConfPin]=useState("");const[pinErr,setPinErr]=useState("");const[pinOk,setPinOk]=useState(false);
  const [notifs,setNotifs]=useState({goals:true,odds:true,bets:true,promos:true});
  const won = bets.filter(b=>b.status==="won").reduce((a,b)=>a+b.potential,0);
  const winRate = bets.length?Math.round(bets.filter(b=>b.status==="won").length/bets.length*100):0;
  const totalMise = bets.reduce((a,b)=>a+b.amount,0);

  const changePin = () => {
    setPinErr("");
    if(newPin.length<4) return setPinErr("PIN dwe gen 4 chif min");
    if(newPin!==confPin) return setPinErr("PIN pa match — eseye ankò");
    setPinOk(true); setTimeout(()=>{setModal(null);setPinOk(false);setNewPin("");setConfPin("");},1500);
  };

  return (
    <div style={{padding:"16px 14px 0"}}>
      {/* Profile card */}
      <div className="fu0" style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid rgba(0,230,118,.12)",borderRadius:22,padding:20,marginBottom:16,display:"flex",gap:16,alignItems:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,bottom:-20,fontSize:80,opacity:.05}}>🎯</div>
        <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#00e676,#00b85a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"#000",fontFamily:"'Bebas Neue',cursive",boxShadow:"0 0 28px rgba(0,230,118,.28)",flexShrink:0}}>{user.name[0].toUpperCase()}</div>
        <div style={{flex:1}}>
          <div style={{color:"#0f172a",fontWeight:800,fontSize:20}}>{user.name}</div>
          <div style={{color:"#94a3b8",fontSize:13,marginTop:2}}>🇭🇹 +509 {user.phone}</div>
          <div style={{marginTop:7,display:"flex",gap:6,flexWrap:"wrap"}}>
            <span style={{background:"rgba(0,230,118,.1)",color:"#00e676",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:8}}>✅ Aktif</span>
            {user.isNew&&<span style={{background:"rgba(255,215,0,.1)",color:"#ffd700",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:8}}>🆕 Nouvèl</span>}
            {bets.length>=5&&<span style={{background:"rgba(168,85,247,.1)",color:"#a855f7",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:8}}>🔥 Fidelite</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="fu1" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[{l:"Paryaj",v:bets.length,c:"#fff",ic:"🎟️"},{l:"% Viktwa",v:`${winRate}%`,c:"#00e676",ic:"🏆"},{l:"Genyen",v:htg(won),c:"#ffd700",ic:"💰"}].map((s,i)=>(
          <div key={i} style={{background:"#f8fafc",border:"1px solid rgba(0,0,0,.07)",borderRadius:15,padding:"12px 8px",textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:5}}>{s.ic}</div>
            <div style={{color:s.c,fontFamily:"'Bebas Neue',cursive",fontSize:s.v.toString().length>8?11:18,letterSpacing:.5,lineHeight:1}}>{s.v}</div>
            <div style={{color:"#cbd5e1",fontSize:10,fontWeight:700,marginTop:5,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Total mise stat */}
      <div className="fu2" style={{background:"#ffffff",border:"1px solid rgba(255,255,255,.05)",borderRadius:14,padding:"13px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{color:"#94a3b8",fontSize:11,marginBottom:4}}>Total Mise</div><div style={{color:"#1e293b",fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:1}}>{htg(totalMise)}</div></div>
        <div style={{textAlign:"right"}}><div style={{color:"#94a3b8",fontSize:11,marginBottom:4}}>Pa Genyen</div><div style={{color:won>totalMise?"#00e676":"#ef4444",fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:1}}>{won>=totalMise?"+":""}{htg(won-totalMise)}</div></div>
      </div>

      {/* Haiti badge */}
      <div className="fu3" style={{background:"linear-gradient(135deg,rgba(0,48,135,.18),rgba(210,16,52,.12))",border:"1px solid rgba(0,48,135,.28)",borderRadius:18,padding:15,marginBottom:16,display:"flex",gap:14,alignItems:"center"}}>
        <img src="https://flagcdn.com/w80/ht.png" style={{width:54,height:36,objectFit:"cover",borderRadius:7,border:"1px solid rgba(0,0,0,.09)",boxShadow:"0 4px 16px rgba(0,0,0,.4)"}} alt="Haiti"/>
        <div><div style={{color:"#0f172a",fontWeight:800,fontSize:15,marginBottom:3}}>Ayiti Chérie 🇭🇹</div><div style={{color:"#94a3b8",fontSize:12}}>RIVAYO PARYAJ — Premye platfòm paryaj nasyonal ayisyen</div></div>
      </div>

      {/* Menu */}
      <div className="fu4" style={{background:"#f8fafc",border:"1px solid rgba(255,255,255,.045)",borderRadius:18,overflow:"hidden",marginBottom:16}}>
        {[
          {ic:"🔔",l:"Notifikasyon",sub:"Goals, Cote, Promo",action:()=>setModal("notifs")},
          {ic:"🔒",l:"Chanje PIN",sub:"Modifye PIN sekrè ou",action:()=>setModal("pin")},
          {ic:"🪪",l:"Verifikasyon KYC",sub:"Idantite pa verifyé",action:()=>setModal("kyc")},
          {ic:"💳",l:"Metòd Peman",sub:"MonCash +509",action:null},
          {ic:"📞",l:"Sipò WhatsApp",sub:"24/7 disponib",action:()=>window.open("https://wa.me/50948868964","_blank")},
          {ic:"📜",l:"Règ ak Kondisyon",sub:"",action:()=>setModal("terms")},
          {ic:"ℹ️",l:"Vèsyon 1.0.0",sub:"RIVAYO PARYAJ Ayiti",action:null},
        ].map(({ic,l,sub,action},i,arr)=>(
          <button key={i} className="bpress" onClick={e=>{ripple(e,"rgba(255,255,255,.05)");action&&action();}} style={{width:"100%",display:"flex",alignItems:"center",padding:"14px 16px",borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,.038)":"none",cursor:action?"pointer":"default",background:"transparent",border:"none",textAlign:"left",position:"relative",overflow:"hidden"}}>
            <span style={{marginRight:13,fontSize:20,width:28,textAlign:"center"}}>{ic}</span>
            <div style={{flex:1}}><div style={{color:"#334155",fontSize:14,fontWeight:600}}>{l}</div>{sub&&<div style={{color:"#94a3b8",fontSize:11,marginTop:1}}>{sub}</div>}</div>
            {action&&<span style={{color:"#cbd5e1",fontSize:16}}>›</span>}
          </button>
        ))}
      </div>

      <button className="bpress" onClick={onLogout} style={{width:"100%",padding:15,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.13)",borderRadius:16,color:"#ef4444",cursor:"pointer",fontSize:15,fontWeight:700,marginBottom:8}}>🚪 Dekonekte</button>

      {/* PIN Modal */}
      {modal==="pin"&&<div onClick={e=>e.target===e.currentTarget&&setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
        <div style={{background:"#ffffff",border:"1px solid rgba(0,0,0,.09)",borderRadius:22,padding:24,width:"100%",maxWidth:360,animation:"pop .35s cubic-bezier(.34,1.56,.64,1)"}}>
          {pinOk?<div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:60,marginBottom:12}}>✅</div><div style={{color:"#00e676",fontWeight:800,fontSize:20}}>PIN Chanje!</div></div>:<>
            <div style={{color:"#0f172a",fontWeight:800,fontSize:18,marginBottom:20}}>🔒 Chanje PIN</div>
            <div style={{marginBottom:14}}><label style={{display:"block",color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Nouvo PIN</label><input style={IS} type="password" placeholder="Mete nouvo PIN" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/,""))} maxLength={6}/></div>
            <div style={{marginBottom:16}}><label style={{display:"block",color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Konfime PIN</label><input style={IS} type="password" placeholder="Repete PIN" value={confPin} onChange={e=>setConfPin(e.target.value.replace(/\D/,""))} maxLength={6}/></div>
            {pinErr&&<div style={{color:"#ef4444",fontSize:13,marginBottom:12,animation:"shake .4s ease"}}>⚠️ {pinErr}</div>}
            <button className="bpress" onClick={changePin} style={{width:"100%",padding:13,background:"linear-gradient(135deg,#00e676,#00cc5e)",border:"none",borderRadius:14,color:"#000",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10}}>Chanje PIN</button>
            <button onClick={()=>setModal(null)} style={{width:"100%",padding:11,background:"none",border:"1px solid rgba(0,0,0,.08)",borderRadius:12,color:"#94a3b8",cursor:"pointer"}}>Anile</button>
          </>}
        </div>
      </div>}

      {/* Notifs Modal */}
      {modal==="notifs"&&<div onClick={e=>e.target===e.currentTarget&&setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
        <div style={{background:"#ffffff",border:"1px solid rgba(0,0,0,.09)",borderRadius:22,padding:24,width:"100%",maxWidth:360,animation:"pop .35s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{color:"#0f172a",fontWeight:800,fontSize:18,marginBottom:20}}>🔔 Notifikasyon</div>
          {[["goals","⚽ Gòl an Dirèk"],["odds","📊 Chanjman Cote"],["bets","🎟️ Estati Paryaj"],["promos","🎁 Pwomosyon"]].map(([k,l])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
              <span style={{color:"#334155",fontSize:14,fontWeight:600}}>{l}</span>
              <div onClick={()=>setNotifs(n=>({...n,[k]:!n[k]}))} style={{width:48,height:26,borderRadius:13,background:notifs[k]?"#00e676":"rgba(255,255,255,.1)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:notifs[k]?24:3,transition:"left .2s",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}/>
              </div>
            </div>
          ))}
          <button className="bpress" onClick={()=>setModal(null)} style={{width:"100%",marginTop:18,padding:13,background:"linear-gradient(135deg,#00e676,#00cc5e)",border:"none",borderRadius:14,color:"#000",fontSize:15,fontWeight:800,cursor:"pointer"}}>Sove</button>
        </div>
      </div>}

      {/* KYC Modal */}
      {modal==="kyc"&&<div onClick={e=>e.target===e.currentTarget&&setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
        <div style={{background:"#ffffff",border:"1px solid rgba(0,0,0,.09)",borderRadius:22,padding:24,width:"100%",maxWidth:360,animation:"pop .35s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{color:"#0f172a",fontWeight:800,fontSize:18,marginBottom:8}}>🪪 Verifikasyon Idantite</div>
          <div style={{color:"#6b7280",fontSize:13,lineHeight:1.6,marginBottom:18}}>Pou retire plis pase 5,000 HTG, ou bezwen verifye idantite ou (KYC). Prepare dokiman sa yo:</div>
          {["CIN Ayisyen / Paspo","Foto selfie avèk dokiman","Nimewo NIF ou (si disponib)"].map((d,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}><span style={{color:"#00e676",fontWeight:700,fontSize:13,flexShrink:0}}>✓</span><span style={{color:"#64748b",fontSize:13}}>{d}</span></div>)}
          <button className="bpress" style={{width:"100%",marginTop:6,padding:13,background:"linear-gradient(135deg,#00e676,#00cc5e)",border:"none",borderRadius:14,color:"#000",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10}}>Kòmanse Verifikasyon →</button>
          <button onClick={()=>setModal(null)} style={{width:"100%",padding:11,background:"none",border:"1px solid rgba(0,0,0,.08)",borderRadius:12,color:"#94a3b8",cursor:"pointer"}}>Pita</button>
        </div>
      </div>}

      {/* Terms Modal */}
      {modal==="terms"&&<div onClick={e=>e.target===e.currentTarget&&setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
        <div style={{background:"#ffffff",borderRadius:"22px 22px 0 0",padding:"20px 20px 40px",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto",animation:"slideUp .35s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{width:40,height:4,background:"#1e2840",borderRadius:2,margin:"0 auto 20px"}}/>
          <div style={{color:"#0f172a",fontWeight:800,fontSize:18,marginBottom:16}}>📜 Règ ak Kondisyon</div>
          {[["Minimòm Aje","Ou dwe gen omwen 18 an pou itilize RIVAYO PARYAJ."],["Paryaj Responsab","Jwe sèlman montan ou ka pèdi. Pa janm parye avèk kòb ki destine pou bezwen fondamantal."],["Bonus 50 HTG","Bonus a disponib pou paryaj sèlman. Li pa retirable dirèkteman. Genyen li tounen kòb reyèl."],["KYC/Idantite","Nou rezève dwa pou mande verifikasyon idantite pou retrè depase 5,000 HTG."],["Peyeman MonCash","Tout tranzaksyon fèt via Digicel MonCash. Nou pa aksepte lòt metòd ankò."],["Lwa Ayisyen","RIVAYO PARYAJ opere an konfòmite ak lwa jwe Ayiti. Lisans jwe obligatwa pou operasyon."]].map(([t,b],i)=>(
            <div key={i} style={{marginBottom:16}}>
              <div style={{color:"#00e676",fontWeight:700,fontSize:13,marginBottom:5}}>{t}</div>
              <div style={{color:"#64748b",fontSize:13,lineHeight:1.6}}>{b}</div>
            </div>
          ))}
          <button className="bpress" onClick={()=>setModal(null)} style={{width:"100%",marginTop:8,padding:13,background:"#f1f5f9",border:"1px solid rgba(0,0,0,.12)",borderRadius:14,color:"#334155",cursor:"pointer",fontSize:15,fontWeight:700}}>Fèmen</button>
        </div>
      </div>}
    </div>
  );
}

// ── HEADER ────────────────────────────────────────────────────────────────────
function AppHeader({ user, slipCount, onSlip, onSearch }) {
  const ripple = useRipple();
  return (
    <div style={{background:"rgba(255,255,255,.97)",borderBottom:"1px solid rgba(0,0,0,.08)",padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:300,backdropFilter:"blur(20px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22,filter:"drop-shadow(0 0 8px rgba(0,230,118,.4))"}}>🎯</span>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,letterSpacing:4,color:"#0f172a",lineHeight:1}}>RIVAYO PARYAJ</span>
        <div style={{display:"flex",gap:4,alignItems:"center",background:"rgba(0,48,135,.28)",border:"1px solid rgba(0,48,135,.38)",borderRadius:8,padding:"3px 8px"}}>
          <img src="https://flagcdn.com/w40/ht.png" style={{width:16,height:12,objectFit:"cover",borderRadius:2}} alt=""/>
          <span style={{fontSize:10,color:"#94a3b8",fontWeight:700,letterSpacing:.5}}>HTG</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {user&&<div style={{textAlign:"right"}}>
          <div style={{color:"#00e676",fontSize:13,fontWeight:800,fontFamily:"'Bebas Neue',cursive",letterSpacing:1}}>{htg(user.realBalance)}</div>
          {user.bonusBalance>0&&<div style={{color:"#ffd700",fontSize:10,fontWeight:600}}>+{htg(user.bonusBalance)} 🎁</div>}
        </div>}
        <button className="bpress" onClick={e=>{ripple(e,"rgba(255,255,255,.1)");onSearch();}} style={{background:"#f1f5f9",border:"1px solid rgba(0,0,0,.09)",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>🔍</button>
        <button className="bpress" onClick={e=>{ripple(e,"rgba(0,230,118,.25)");onSlip();}} style={{position:"relative",background:slipCount>0?"rgba(0,230,118,.09)":"rgba(255,255,255,.05)",border:`1.5px solid ${slipCount>0?"rgba(0,230,118,.3)":"rgba(255,255,255,.07)"}`,borderRadius:11,padding:"9px 11px",cursor:"pointer",fontSize:17,transition:"all .2s",overflow:"hidden"}}>
          🎟️{slipCount>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#ef4444",color:"#0f172a",borderRadius:"50%",width:18,height:18,fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",animation:"pop .3s ease"}}>{slipCount}</span>}
        </button>
      </div>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav({ active, onChange, pendingBets }) {
  const ripple = useRipple();
  const tabs = [{id:"home",ic:"🏠",l:"Akèy"},{id:"matches",ic:"⚽",l:"Match"},{id:"mybets",ic:"📋",l:"Paryaj"},{id:"wallet",ic:"💰",l:"Kès"},{id:"profile",ic:"👤",l:"Pwofil"}];
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(255,255,255,.97)",borderTop:"1px solid rgba(0,0,0,.08)",display:"flex",zIndex:400,backdropFilter:"blur(20px)"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={e=>{ripple(e,"rgba(255,255,255,.07)");onChange(t.id);}} style={{flex:1,background:"none",border:"none",padding:"10px 4px 9px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderTop:`2px solid ${active===t.id?"#003087":"transparent"}`,transition:"border-color .22s",position:"relative",overflow:"hidden"}}>
          <span style={{fontSize:20,transition:"transform .2s",transform:active===t.id?"scale(1.18)":"scale(1)"}}>{t.ic}</span>
          <span style={{fontSize:9.5,color:active===t.id?"#003087":"#94a3b8",fontWeight:700,transition:"color .2s"}}>{t.l}</span>
          {t.id==="mybets"&&pendingBets>0&&<div style={{position:"absolute",top:7,right:"50%",transform:"translateX(10px)",background:"#ef4444",color:"#0f172a",borderRadius:"50%",width:16,height:16,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",animation:"pop .3s ease"}}>{pendingBets}</div>}
        </button>
      ))}
    </div>
  );
}

// ── PROMOS DATA ───────────────────────────────────────────────────────────────
const PROMOS = [
  {icon:"🎁",title:"Bonus Byenveni 50 HTG",body:"Pou tout nouvo manm. Parye gratis!",desc:"Chak nouvo kont resevwa 50 HTG bonus pou teste platfòm nan. Si ou genyen, kòb antre nan balans reyèl ou. Zéro risk pou ou.",from:"rgba(0,230,118,.1)",to:"rgba(0,50,25,.8)",border:"rgba(0,230,118,.25)",tags:["Zéro Risk","Tout Kont","50 HTG"]},
  {icon:"⚡",title:"Remèt 10% sou Pèt",body:"Pèdi yon semèn? Nou remèt 10%.",desc:"Chak lendi maten, si ou pèdi plis pase 500 HTG pandan semèn nan, nou remèt 10% nan balans bonus ou. Jiska 200 HTG pou semèn.",from:"rgba(168,85,247,.1)",to:"rgba(50,0,100,.8)",border:"rgba(168,85,247,.25)",tags:["Chak Semèn","Max 200 HTG","Otomatik"]},
  {icon:"🇭🇹",title:"Match Ayiti — Boost ×2",body:"Cote Ayiti doub pou match Caribbean!",desc:"Pou chak match kote Haïti ap jwe nan Caribbean Nations Cup, nou double cote a pou premye 200 HTG paryaj ou. Sipòte ekip la!",from:"rgba(0,48,135,.15)",to:"rgba(210,16,52,.12)",border:"rgba(0,48,135,.35)",tags:["Haiti 🇭🇹","×2 Cote","Limité"]},
  {icon:"🏆",title:"Paryaj Akyimilasyon",body:"Plis match = Plis bonus!",desc:"Fè yon paryaj akyimilasyon avèk 5 match oswa plis, epi resevwa 25% anplis sou peyeman ou si ou genyen.",from:"rgba(255,215,0,.1)",to:"rgba(100,70,0,.8)",border:"rgba(255,215,0,.25)",tags:["5+ Match","25% Anplis","Tout Lig"]},
];

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [stage,setStage]=useState("splash");
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("home");
  const [matches,setMatches]=useState(INIT_MATCHES);
  const [slip,setSlip]=useState([]);
  const [showSlip,setShowSlip]=useState(false);
  const [bets,setBets]=useState([]);
  const [toasts,setToasts]=useState([]);
  const [confetti,setConfetti]=useState(false);
  const [goalFlash,setGoalFlash]=useState(null);
  const [detailMatch,setDetailMatch]=useState(null);
  const [favs,setFavs]=useState([]);
  const [showOnboard,setShowOnboard]=useState(false);
  const [txHistory,setTxHistory]=useState([{icon:"🎁",label:"Bonus Byenveni",amount:50,plus:true,date:"Jodi a",status:"✅ Konfime"}]);
  const tid = useRef(0);

  const toast = useCallback(t=>{const id=++tid.current;setToasts(p=>[...p,{...t,id}]);setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==id)),4300);},[]);

  // ── Live simulation ────────────────────────────────────────────────────────
  useEffect(()=>{
    if(stage!=="app")return;
    const iv=setInterval(()=>{
      setMatches(prev=>prev.map(m=>{
        if(!m.live)return m;
        let nm={...m,min:m.min+1};
        if(Math.random()<0.032){
          const isH=Math.random()>.5;
          nm={...nm,hs:isH?nm.hs+1:nm.hs,as:isH?nm.as:nm.as+1};
          toast({type:"goal",icon:"⚽",title:`BUT! ${T[isH?m.home:m.away]?.n}!`,body:`${T[m.home]?.n} ${nm.hs} - ${nm.as} ${T[m.away]?.n} — ${nm.min}'`});
          setGoalFlash(m.id); setTimeout(()=>setGoalFlash(null),2200);
        }
        if(Math.random()<0.08){
          const d=(Math.random()-.5)*.12;
          nm={...nm,ho:Math.max(1.1,parseFloat((nm.ho+d).toFixed(2)))};
          toast({type:"odds",icon:"📊",title:"Cote Chanje!",body:`${T[m.home]?.n} vs ${T[m.away]?.n} — 1: ${nm.ho}`});
        }
        if(m.qtr&&Math.random()<0.14){const pts=Math.floor(Math.random()*3)+1;const isH=Math.random()>.5;nm={...nm,hs:isH?nm.hs+pts:nm.hs,as:isH?nm.as:nm.as+pts};}
        return nm;
      }));
    },4000);
    return()=>clearInterval(iv);
  },[stage,toast]);

  const pick=(match,type,odd,typeLabel,marketKey="1x2")=>{
    setSlip(prev=>{
      const idx=prev.findIndex(b=>b.matchId===match.id&&b.marketKey===marketKey);
      if(idx>=0){
        if(prev[idx].type===type)return prev.filter((_,i)=>i!==idx);
        const u=[...prev];u[idx]={matchId:match.id,home:match.home,away:match.away,type,odd,typeLabel,marketKey};return u;
      }
      const next=[...prev,{matchId:match.id,home:match.home,away:match.away,type,odd,typeLabel,marketKey}];
      if(next.length===1)toast({type:"bet",icon:"✅",title:"Ajoute!",body:`${T[match.home]?.n} vs ${T[match.away]?.n} — ${typeLabel}`});
      return next;
    });
  };

  const API_URL = "http://localhost:3001/api";

  const apiFetch = async (path, options={}) => {
    const token = localStorage.getItem("rivayo_token");
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type":"application/json",
        ...(token ? {Authorization:`Bearer ${token}`} : {}),
        ...options.headers,
      }
    });
    return res.json();
  };

  const place=async (amount,bonus,totalOdd)=>{
    try {
      const data = await apiFetch("/bets/place", {
        method:"POST",
        body: JSON.stringify({
          selections: slip.map(s=>({matchId:s.matchId,type:s.type,odd:s.odd,marketKey:s.marketKey})),
          amount,
          useBonus: bonus
        })
      });
      if(data.error){ toast({type:"info",icon:"⚠️",title:"Erè",body:data.error}); return; }
      // Mete ajou lokal
      setBets(p=>[{selections:[...slip],amount,bonus,totalOdd,potential:Math.round(amount*totalOdd),status:"pending",date:new Date().toLocaleDateString("fr"),time:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}, ...p]);
      setTxHistory(h=>[{icon:"🎯",label:`Paryaj x${slip.length} selebsyon`,amount,plus:false,date:new Date().toLocaleDateString("fr"),status:"⏳ An Atant"},...h]);
      setSlip([]);
      setUser(p=>({...p,realBalance:bonus?p.realBalance:p.realBalance-amount,bonusBalance:bonus?Math.max(0,p.bonusBalance-amount):p.bonusBalance}));
      setTab("mybets");
    } catch(err) {
      // Si backend pa disponib — mache lokal kanmenm
      setBets(p=>[{selections:[...slip],amount,bonus,totalOdd,potential:Math.round(amount*totalOdd),status:"pending",date:new Date().toLocaleDateString("fr"),time:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}, ...p]);
      setSlip([]);
      setUser(p=>({...p,realBalance:bonus?p.realBalance:p.realBalance-amount,bonusBalance:bonus?Math.max(0,p.bonusBalance-amount):p.bonusBalance}));
      setTab("mybets");
    }
  };

  const fireConfetti=()=>{setConfetti(true);setTimeout(()=>setConfetti(false),3000);};
  const toggleFav=(id)=>{setFavs(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);};

  const goTab=(t)=>{
    if(t==="search"){setTab("search");}
    else if(t==="favs"){setTab("favs");}
    else if(t==="promos"){setTab("promos");}
    else setTab(t);
  };

  if(stage==="splash") return <Splash onDone={()=>setStage("auth")}/>;
  if(stage==="auth") return <Auth onLogin={u=>{setUser(u);setStage("app");if(u.isNew){setShowOnboard(true);}else{toast({type:"bet",icon:"👋",title:`Bonswa ${u.name}!`,body:"Bon retou sou RIVAYO PARYAJ 🎯"});}}}/>;

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"#f0f4f8",display:"flex",flexDirection:"column",position:"relative"}}>
      <Confetti active={confetti}/>
      <Toast toasts={toasts}/>
      {showOnboard&&<OnboardingModal name={user?.name} onClose={()=>{setShowOnboard(false);toast({type:"win",icon:"🎁",title:"50 HTG Ajoute!",body:"Bonus ou prèt — jwe kounye a!"});}}/>}
      {detailMatch&&<MatchDetail m={detailMatch} slip={slip} onPick={pick} onClose={()=>setDetailMatch(null)}/>}

      <AppHeader user={user} slipCount={slip.length} onSlip={()=>{if(slip.length>0)setShowSlip(true);else toast({type:"info",icon:"🎟️",title:"Betslip Vid",body:"Chwazi yon match pou kòmanse!"});}} onSearch={()=>setTab("search")}/>
      <Ticker matches={matches}/>

      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {tab==="home"&&<HomeTab user={user} matches={matches} slip={slip} onPick={pick} goTab={goTab} goalFlash={goalFlash} onViewDetail={m=>setDetailMatch(m)} favs={favs} onToggleFav={toggleFav} promos={PROMOS}/>}
        {tab==="matches"&&<MatchesTab matches={matches} slip={slip} onPick={pick} onViewDetail={m=>setDetailMatch(m)} favs={favs} onToggleFav={toggleFav}/>}
        {tab==="search"&&<SearchTab matches={matches} slip={slip} onPick={pick} onViewDetail={m=>setDetailMatch(m)}/>}
        {tab==="favs"&&<FavsTab matches={matches} slip={slip} onPick={pick} favs={favs} onToggleFav={toggleFav} onViewDetail={m=>setDetailMatch(m)}/>}
        {tab==="promos"&&<PromosTab promos={PROMOS}/>}
        {tab==="mybets"&&<BetsTab bets={bets}/>}
        {tab==="wallet"&&<WalletTab user={user} txHistory={txHistory} onDeposit={a=>{setUser(p=>({...p,realBalance:p.realBalance+a}));setTxHistory(h=>[{icon:"💵",label:"Depo MonCash",amount:a,plus:true,date:new Date().toLocaleDateString("fr"),status:"✅ Konfime"},...h]);toast({type:"win",icon:"💵",title:"Depo Konfime!",body:`${htg(a)} nan kont ou`});}}/>}
        {tab==="profile"&&<ProfileTab user={user} bets={bets} onLogout={()=>{setUser(null);setStage("auth");setSlip([]);setBets([]);}} onUpdateUser={u=>setUser(p=>({...p,...u}))}/>}
      </div>

      <Nav active={["home","matches","mybets","wallet","profile"].includes(tab)?tab:"home"} onChange={setTab} pendingBets={bets.filter(b=>b.status==="pending").length}/>

      {showSlip&&<Betslip slip={slip} user={user} onRemove={(id,type,mk)=>setSlip(p=>p.filter(b=>!(b.matchId===id&&b.type===type&&b.marketKey===mk)))} onClear={()=>setSlip([])} onPlace={place} onClose={()=>setShowSlip(false)} onConfetti={fireConfetti}/>}
    </div>
  );
}

