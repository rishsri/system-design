import {useState,useEffect} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import labs from './data/search-labs.json';
import type {Section} from './types';

// Deliberately small teaching analyzer, not Elasticsearch's standard analyzer.
const tokens=(text:string):string[]=>text.toLowerCase().match(/[a-z0-9]+/g)||[];
export function editDistance(a:string,b:string,swap=true):number {
  const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0) as number[]);
  for(let i=0;i<=a.length;i++)d[i][0]=i;
  for(let j=0;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    if(swap&&i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
  }
  return d[a.length][b.length];
}
export function bm25(doc:string[],corpus:string[][],query:string[],k1:number,b:number):number {
  const avg=corpus.reduce((n,d)=>n+d.length,0)/corpus.length;
  return [...new Set(query)].reduce((sum,t)=>{
    const tf=doc.filter(x=>x===t).length,df=corpus.filter(d=>d.includes(t)).length;
    const idf=Math.log(1+(corpus.length-df+.5)/(df+.5));
    return sum+(tf? idf*tf*(k1+1)/(tf+k1*(1-b+b*doc.length/avg)):0);
  },0);
}
function Matching(){
  const[query,setQuery]=useState('React Python');const[mode,setMode]=useState('or');const[min,setMin]=useState(2);
  const terms=[...new Set(tokens(query))];const docs=labs.documents;
  const required=terms.length?Math.min(terms.length,mode==='and'?terms.length:mode==='minimum'?min:1):0;
  return <>
    <label>Search terms<input maxLength={120} value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <div className="lab-presets">{labs.presets.map(p=><button key={p} onClick={()=>setQuery(p)}>{p}</button>)}</div>
    <div className="lab-fields"><label>Matching policy<select value={mode} onChange={e=>setMode(e.target.value)}><option value="or">OR — koi ek term</option><option value="and">AND — saare terms</option><option value="minimum">Minimum terms</option></select></label>{mode==='minimum'&&<label>Required terms<select value={min} onChange={e=>setMin(Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n}>{n}</option>)}</select></label>}</div>
    {mode==='minimum'&&terms.length>0&&min>terms.length&&<p className="lab-footnote">Requested {min}; available terms {terms.length}. Effective minimum {required} par cap hota hai.</p>}<div className="lab-postings"><strong>Query terms → posting lists</strong>{terms.map(t=><code key={t}>{t} → [{docs.filter(d=>tokens(d.text).includes(t)).map(d=>d.id).join(', ')}]</code>)}{!terms.length&&<p>Query type karo; abhi koi analyzed term nahi hai.</p>}</div>
    <div aria-live="polite"><p>{terms.length?`${terms.length} unique terms; minimum ${required} match chahiye. Neeche order document ID ka hai, relevance ranking nahi.`:'Empty query par zero matches.'}</p>{docs.map(d=>{const words=tokens(d.text),count=terms.filter(t=>words.includes(t)).length,match=terms.length>0&&count>=required;return <div className={'lab-result '+(match?'is-match':'')} key={d.id}><span>#{d.id} {d.text}</span><span>{count}/{terms.length} · {match?'Match':'No match'}</span></div>;})}</div>
    <p className="lab-footnote">Simplified lowercase word tokens; stemming/stop words nahi. Real analyzer output different ho sakta hai.</p>
  </>;
}
function Ranking(){
  const[repeats,setRepeats]=useState(4),[b,setB]=useState(.75);
  const corpus=[tokens(`${'React '.repeat(repeats)}Python`),tokens('React Python')];
  const scores=corpus.map(d=>bm25(d,corpus,['react','python'],1.2,b));const max=Math.max(...scores);
  const reduce=useReducedMotion();
  return <>
    <label>Document A mein React repeats: {repeats}<input type="range" min="1" max="12" value={repeats} onChange={e=>setRepeats(Number(e.target.value))}/></label>
    <label>Length normalization b: {b.toFixed(2)}<input type="range" min="0" max="1" step="0.05" value={b} onChange={e=>setB(Number(e.target.value))}/></label>
    <p>Query: <code>React Python</code> · k1 = 1.2 · avgdl = {((corpus[0].length+2)/2).toFixed(2)}. Dono terms dono documents mein hain, isliye df = 2 aur IDF ≈ 0.182.</p>
    <div aria-live="polite">{corpus.map((doc,i)=><div className="lab-score" key={i}><strong>Document {i===0?'A':'B'} · score {scores[i].toFixed(4)}</strong><p>{doc.join(' ')} ({doc.length} tokens)</p><div className="lab-meter"><motion.div animate={{width:`${scores[i]/max*100}%`}} transition={{duration:reduce?0:.2}}/></div></div>)}<p>{Math.abs(scores[0]-scores[1])<.00001?'Dono ka score equal hai.':`Is toy corpus mein Document ${scores[0]>scores[1]?'A':'B'} higher hai.`} Formula ki actual contributions calculate ho rahi hain; preset winner nahi.</p></div>
    <p className="lab-footnote">Educational two-document BM25; Lucene norms, shard statistics aur multi-field query behavior reproduce nahi karta.</p>
  </>;
}
function Fuzzy(){
  const[input,setInput]=useState('samsng'),[distance,setDistance]=useState(1),[swap,setSwap]=useState(true);
  const term=tokens(input)[0]||'';
  return <>
    <label>Ek word type karo<input maxLength={32} value={input} onChange={e=>setInput(e.target.value)}/></label>
    <label>Maximum edits<select value={distance} onChange={e=>setDistance(Number(e.target.value))}>{[0,1,2].map(n=><option key={n}>{n}</option>)}</select></label>
    <label className="lab-checkbox"><input type="checkbox" checked={swap} onChange={e=>setSwap(e.target.checked)}/> Adjacent swap ko 1 edit count karo</label>
    <div className="lab-presets">{['samsng','lapto','smasung','mobile'].map(t=><button key={t} onClick={()=>setInput(t)}>{t}</button>)}</div>
    <div aria-live="polite"><p>Normalized first token: <code>{term||'(empty)'}</code>. {swap?'Adjacent-transposition variant (OSA)':'Classic Levenshtein'} distance.</p>{labs.vocabulary.map(word=>{const d=editDistance(term,word,swap);return <div className={'lab-result '+(term&&d<=distance?'is-match':'')} key={word}><span>{word}</span><span>{d} edits · {term&&d<=distance?'Candidate':'Outside limit'}</span></div>;})}</div>
    <p className="lab-footnote">Small vocabulary par actual edit-distance calculation. Ye Lucene term expansion, AUTO policy, prefix limits ya relevance scoring nahi chalata.</p>
  </>;
}
function Visibility(){
  const[writes,setWrites]=useState(0),[visible,setVisible]=useState(0),[flushed,setFlushed]=useState(0);
  return <>
    <p>Is simulation mein write acknowledgment default request-durability policy ke baad maana hai. Refresh aur flush manually trigger karke unka difference dekho.</p>
    <div className="lab-presets"><button onClick={()=>setWrites(n=>n+1)}>Index a product</button><button disabled={visible===writes} onClick={()=>setVisible(writes)}>Refresh searcher</button><button disabled={flushed===writes} onClick={()=>setFlushed(writes)}>Flush / Lucene commit</button><button onClick={()=>{setWrites(0);setVisible(0);setFlushed(0);}}>Reset</button></div>
    <dl className="lab-state" aria-live="polite"><div><dt>Acknowledged writes</dt><dd>{writes}</dd></div><div><dt>Search-visible</dt><dd>{visible}</dd></div><div><dt>Lucene-committed</dt><dd>{flushed}</dd></div><div><dt>Since last Lucene commit</dt><dd>{writes-flushed}</dd></div></dl>
    <p aria-live="polite">{writes===0?'Pehle product index karo.':visible<writes?`${writes-visible} acknowledged writes abhi current searcher ko visible nahi. Refresh karke dekho.`:'Current searcher saari writes dekh sakta hai.'} {writes>flushed?'Recent operations translog recovery se recover ho sakti hain; not-yet-Lucene-committed ka matlab necessarily lost nahi.':'Simulated writes Lucene commit mein included hain.'}</p>
    <p className="lab-footnote">Conceptual counters, ES internals ka timing model nahi. Real system auto-refresh/flush karta hai; flush ke internal details aur search visibility ko yahan independent milestones dikhaya hai.</p>
  </>;
}
function Policy(){
  const[budget,setBudget]=useState(50000),[stock,setStock]=useState('all'),[weight,setWeight]=useState(3),[hideCase,setHideCase]=useState(false);
  const reduce=useReducedMotion();const terms=['samsung','galaxy'];const docs=labs.products;
  const names=docs.map(d=>tokens(d.name)),descriptions=docs.map(d=>tokens(d.description));
  const rows=docs.map((d,i)=>{
    const nameMatch=terms.every(t=>names[i].includes(t)),descriptionMatch=terms.every(t=>descriptions[i].includes(t));
    const base=Math.max(nameMatch?bm25(names[i],names,terms,1.2,.75)*weight:0,descriptionMatch?bm25(descriptions[i],descriptions,terms,1.2,.75):0);
    const reason=!(nameMatch||descriptionMatch)?'Query terms missing':d.price>=budget?'Budget gate se bahar':stock==='filter'&&!d.in_stock?'Stock filter ne remove kiya':hideCase&&d.id==='cover'?'must_not ne exclude kiya':null;
    return {...d,score:base+(stock==='prefer'&&d.in_stock?2:0),reason};
  });
  const visible=rows.filter(d=>!d.reason).sort((a,b)=>(stock==='sort'?Number(b.in_stock)-Number(a.in_stock):0)||b.score-a.score||a.id.localeCompare(b.id));
  const bool:Record<string,unknown>={must:[{multi_match:{query:'Samsung Galaxy',fields:[`name^${weight}`,'description'],operator:'and'}}],filter:[{range:{price:{lt:budget*100}}}]};
  if(stock==='filter')(bool.filter as unknown[]).push({term:{in_stock:true}});
  if(stock==='prefer'){bool.should=[{constant_score:{filter:{term:{in_stock:true}},boost:2}}];bool.minimum_should_match=0;}
  if(hideCase)bool.must_not=[{term:{'name.raw':'Travel case'}}];
  const query={query:{bool},...(stock==='sort'?{sort:[{in_stock:'desc'},{_score:'desc'}]}:{}),size:10};
  return <>
    <p>Query fixed hai: <code>Samsung Galaxy</code>. Pehle ₹50k + stock filter try karo. Phir filter ko preference se replace karo: sold-out S25 wapas aata hai.</p>
    <label>Budget se kam: ₹{budget.toLocaleString('en-IN')}<input type="range" min="10000" max="100000" step="5000" value={budget} onChange={e=>setBudget(Number(e.target.value))}/></label>
    <label>Stock rule<select value={stock} onChange={e=>setStock(e.target.value)}><option value="all">Sab eligible products</option><option value="filter">Filter — sirf in stock</option><option value="prefer">Should — in stock ko +2 bonus</option><option value="sort">Sort — in stock always first</option></select></label>
    <label>Name field boost: {weight.toFixed(1)}×<input type="range" min="0.1" max="10" step="0.1" value={weight} onChange={e=>setWeight(Number(e.target.value))}/></label>
    <label className="lab-checkbox"><input type="checkbox" checked={hideCase} onChange={e=>setHideCase(e.target.checked)}/> Travel case exclude karo (must_not)</label>
    <div aria-live="polite"><h4>Browser result: {visible.length} eligible</h4>{visible.map((d,i)=><motion.div layout={!reduce} transition={{duration:reduce?0:.2}} className="policy-product" key={d.id}><strong>{i+1}. {d.name}</strong><p>₹{d.price.toLocaleString('en-IN')} · {d.in_stock?'In stock':'Sold out'} · model score {d.score.toFixed(3)}</p><p className="lab-footnote">Description: {d.description}</p></motion.div>)}{!visible.length&&<p>Koi product conditions meet nahi karta. Budget ya stock rule badlo.</p>}<details className="lab-reveal"><summary>Kaun bahar hua, aur kyun?</summary>{rows.filter(d=>d.reason).map(d=><p key={d.id}><strong>{d.name}:</strong> {d.reason}</p>)}{rows.every(d=>!d.reason)&&<p>Saare products eligible hain.</p>}</details></div>
    <details className="lab-reveal"><summary>In controls ki Elasticsearch query dekho</summary><pre><code>{JSON.stringify(query,null,2)}</code></pre><p>UI rupees dikhati hai; query existing mapping ke liye paise bhejegi. Ye query execute nahi ho rahi.</p></details>
    <p className="lab-footnote">Teaching model: lowercase tokens, per-field BM25 + best matching field, optional fixed bonus. Real ES scores, analyzer behavior aur tie-breaking reproduce nahi karta. Travel case extra teaching example hai; four phones source se adapted hain.</p>
  </>;
}
function Phrase(){
  const[slop,setSlop]=useState(0),[mode,setMode]=useState('phrase');
  return <>
    <p>Query: <code>Samsung Galaxy</code>. Same words hone aur phrase match hone mein difference dekho.</p>
    <label>Query mode<select value={mode} onChange={e=>setMode(e.target.value)}><option value="phrase">match_phrase — positions matter</option><option value="and">match AND — presence only</option></select></label>
    <label>Phrase slop: {slop}<input type="range" min="0" max="3" step="1" disabled={mode==='and'} value={slop} onChange={e=>setSlop(Number(e.target.value))}/></label>
    <div aria-live="polite">{labs.phrases.map(text=>{const words=tokens(text);const a=words.indexOf('samsung'),b=words.indexOf('galaxy');const cost=a<0||b<0?Infinity:Math.abs((b-a)-1);const match=Number.isFinite(cost)&&(mode==='and'||cost<=slop);return <div className={'phrase-row '+(match?'is-match':'')} key={text}><div className="position-tokens">{words.map((t,i)=><span key={i} className={t==='samsung'||t==='galaxy'?'query-token':''}><small>position {i}</small>{t}</span>)}</div><p><strong>{match?'Match':'No match'}</strong> · {Number.isFinite(cost)?`minimum positional moves: ${cost}`:'Galaxy term missing'}{mode==='and'?' · AND positions ignore karta hai.':''}</p></div>;})}</div>
    <p className="lab-footnote">Fixed two-term query, one occurrence per term, contiguous lowercase tokens. Slop scoring/analyzer gaps/synonyms ka full Lucene model nahi. Reversed adjacent terms cost 2; slop sirf extra-word count nahi.</p>
  </>;
}
type StreamRun={pg:number;es:number;fail:boolean;mode:string;id:number};
type Arrival={source:'postgres'|'elasticsearch';at:number;error:boolean};
function Streaming(){
  const[pg,setPg]=useState(1800),[es,setEs]=useState(400),[fail,setFail]=useState(false),[mode,setMode]=useState('stream');
  const[run,setRun]=useState<StreamRun|null>(null),[elapsed,setElapsed]=useState(0),[arrivals,setArrivals]=useState<Arrival[]>([]);
  const reduce=useReducedMotion();const total=run?(run.mode==='sequential'?run.pg+run.es:Math.max(run.pg,run.es)):0;const active=!!run&&elapsed<total;
  useEffect(()=>{
    if(!run)return;let stopped=false;const start=performance.now();const timers:ReturnType<typeof setTimeout>[]=[];
    const emit=(source:Arrival['source'],at:number)=>{if(!stopped)setArrivals(old=>[...old,{source,at,error:source==='elasticsearch'&&run.fail}]);};
    if(run.mode==='all')timers.push(setTimeout(()=>{emit('postgres',Math.max(run.pg,run.es));emit('elasticsearch',Math.max(run.pg,run.es));},Math.max(run.pg,run.es)));
    else {timers.push(setTimeout(()=>emit('postgres',run.pg),run.pg));const esAt=run.mode==='sequential'?run.pg+run.es:run.es;timers.push(setTimeout(()=>emit('elasticsearch',esAt),esAt));}
    const tick=setInterval(()=>{if(!stopped)setElapsed(Math.min(total,Math.round(performance.now()-start)));},50);
    timers.push(setTimeout(()=>{clearInterval(tick);if(!stopped)setElapsed(total);},total));
    return()=>{stopped=true;clearInterval(tick);timers.forEach(clearTimeout);};
  },[run,total]);
  const reset=()=>{setRun(null);setElapsed(0);setArrivals([]);};
  return <>
    <p>PG aur ES ke delays choose karo. Simulation actual timers use karti hai, remote database calls nahi.</p>
    <div className="lab-fields"><label>PostgreSQL simulated delay<select value={pg} disabled={active} onChange={e=>setPg(Number(e.target.value))}>{[200,400,1000,1800,3000].map(n=><option value={n} key={n}>{n} ms</option>)}</select></label><label>Elasticsearch simulated delay<select value={es} disabled={active} onChange={e=>setEs(Number(e.target.value))}>{[200,400,1000,1800,3000].map(n=><option value={n} key={n}>{n} ms</option>)}</select></label></div>
    <label>Delivery strategy<select value={mode} disabled={active} onChange={e=>setMode(e.target.value)}><option value="stream">Concurrent + emit each as ready</option><option value="all">Concurrent + wait for both</option><option value="sequential">Sequential: PG first, then ES</option></select></label>
    <label className="lab-checkbox"><input type="checkbox" disabled={active} checked={fail} onChange={e=>setFail(e.target.checked)}/> Elasticsearch response simulate as error</label>
    <div className="lab-presets"><button disabled={active} onClick={()=>{setElapsed(0);setArrivals([]);setRun({pg,es,mode,fail,id:Date.now()});}}>Run comparison</button><button onClick={reset}>Reset / cancel</button></div>
    <div className="lab-meter"><motion.div animate={{width:`${total?elapsed/total*100:0}%`}} transition={{duration:reduce?0:.05}}/></div><p className="lab-clock">Simulated run: {elapsed} / {total} ms</p>
    <div className="stream-panels" aria-live="polite">{(['postgres','elasticsearch'] as const).map(source=>{const arrival=arrivals.find(a=>a.source===source);return <div className="policy-product" key={source}><strong>{source==='postgres'?'PostgreSQL':'Elasticsearch'}</strong>{!arrival?<p>{run?'Browser panel abhi wait kar raha hai.':'Run click karo.'}</p>:arrival.error?<p>Source error at {arrival.at} ms. Doosre source ka panel available reh sakta hai.</p>:<><p>Delivered at {arrival.at} ms</p><ul>{labs.streamResults[source].map(item=><li key={item}>{item}</li>)}</ul></>}</div>;})}</div>
    {run&&<p>{arrivals.length===0?'Abhi browser ko koi source result deliver nahi hua.':`First delivery: ${Math.min(...arrivals.map(a=>a.at))} ms.`} {arrivals.length===2?'Dono sources settle ho gaye.':active?'Doosri source independently complete ho sakti hai.':''}</p>}
    <p className="lab-footnote">Chosen delays, canned result lists aur per-source errors. Production speed benchmark nahi; PG bhi ES se faster ho sakta hai. Timers reset/unmount par cancel hote hain. Actual stream framing, transport, ranking merge aur network cost model nahi hote.</p>
  </>;
}

export function SearchLab({kind}:{kind:NonNullable<Section['lab']>}){
  return <div className="search-lab"><div className="section-kicker">KHUD TRY KARO · BROWSER SIMULATION</div><h3>{labs.titles[kind]}</h3>{kind==='matching'?<Matching/>:kind==='ranking'?<Ranking/>:kind==='fuzzy'?<Fuzzy/>:kind==='visibility'?<Visibility/>:kind==='policy'?<Policy/>:kind==='phrase'?<Phrase/>:<Streaming/>}</div>;
}
