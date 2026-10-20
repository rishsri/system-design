import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link,useParams,useLocation} from 'react-router-dom';
import {ArrowLeft,ArrowRight,Search,Sun,Moon,RotateCcw,Play,Pause,Menu,X,ChevronDown} from 'lucide-react';
import {motion,AnimatePresence,useReducedMotion} from 'framer-motion';
import walkthroughs from './data/walkthroughs.json';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import plaintext from 'highlight.js/lib/languages/plaintext';
hljs.registerLanguage('sql',sql);hljs.registerLanguage('json',json);hljs.registerLanguage('javascript',javascript);hljs.registerLanguage('typescript',typescript);hljs.registerLanguage('python',python);hljs.registerLanguage('bash',bash);hljs.registerLanguage('plaintext',plaintext);
import type {Question} from './types';
import {seed} from './content';
import './style.css';
import {SearchLab} from './SearchLab';
function Diagram({code}:{code:string}){const ref=useRef<HTMLDivElement>(null);const[error,setError]=useState(false);useEffect(()=>{let active=true;setError(false);import('mermaid').then(async ({default:mermaid})=>{mermaid.initialize({startOnLoad:false,theme:'neutral',securityLevel:'strict',themeVariables:{fontFamily:'Inter, sans-serif'}});return mermaid.render('diagram'+Math.random().toString(36).slice(2),code);}).then(({svg})=>{if(active&&ref.current)ref.current.innerHTML=svg;}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[code]);return error?<pre>Diagram could not render. Check Mermaid syntax.{'\n'}{code}</pre>:<div className="diagram" ref={ref} role="img" aria-label="Architecture diagram"/>;}
function Content({body}:{body:string}){return <Markdown remarkPlugins={[remarkGfm]} components={{code({className,children,...props}){const lang=className?.replace('language-','');const code=String(children).replace(/\n$/,'');if(lang==='mermaid')return <Diagram code={code}/>;if(lang)return <code className={className} dangerouslySetInnerHTML={{__html:hljs.highlight(code,{language:hljs.getLanguage(lang)?lang:'plaintext'}).value}}/>;return <code {...props}>{children}</code>;}}}>{body}</Markdown>;}
function Walkthrough({kind}:{kind: keyof typeof walkthroughs}) {
  const flow=walkthroughs[kind];
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false);
  const reduceMotion=useReducedMotion();
  const current=flow.steps[step];
  useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setStep(n=>{if(n>=flow.steps.length-1){setPlaying(false);return n;}return n+1;}),5000);return()=>clearInterval(timer);},[playing,flow.steps.length]);
  return <div className="walkthrough">
    <div className="walkthrough-caption">CHALO, FLOW DEKHTE HAIN <span>{step+1} / {flow.steps.length}</span></div>
    <h3>{flow.title}</h3>
    <div className="flow-nodes">{flow.nodes.map((node,i)=><React.Fragment key={node}><motion.div className={'flow-node '+(current.active.includes(i)?'active':'')} animate={{y:current.active.includes(i)&&!reduceMotion?-4:0}} transition={{duration:reduceMotion?0:.35}}><span>{node}</span>{current.active.includes(i)&&<motion.i initial={{scale:reduceMotion?1:0}} animate={{scale:1}} transition={{duration:reduceMotion?0:.3}}/>}</motion.div>{i<flow.nodes.length-1&&<span className="flow-connector"><ArrowRight size={15}/></span>}</React.Fragment>)}</div>
    <div className="flow-note" aria-live="polite">{current.note}</div>
    <AnimatePresence mode="wait"><motion.div key={step} className="flow-explanation" initial={{opacity:reduceMotion?1:0,y:reduceMotion?0:6}} animate={{opacity:1,y:0}} exit={{opacity:reduceMotion?1:0}} transition={{duration:reduceMotion?0:.15}}><h4>{current.title}</h4><p>{current.body}</p></motion.div></AnimatePresence>
    <div className="flow-controls"><button aria-label={playing?'Pause walkthrough':'Play walkthrough'} onClick={()=>{if(step===flow.steps.length-1)setStep(0);setPlaying(!playing);}}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pause':'Play'}</button><button aria-label="Restart walkthrough" onClick={()=>{setStep(0);setPlaying(false);}}><RotateCcw size={15}/></button><div className="step-dots">{flow.steps.map((_,i)=><button key={i} aria-label={'Go to step '+(i+1)} aria-pressed={i===step} onClick={()=>{setStep(i);setPlaying(false);}} className={i===step?'selected':''}/>)}</div><button disabled={step===0} onClick={()=>{setStep(n=>n-1);setPlaying(false);}} aria-label="Previous step"><ArrowLeft size={16}/></button><button disabled={step===flow.steps.length-1} onClick={()=>{setStep(n=>n+1);setPlaying(false);}} aria-label="Next step"><ArrowRight size={16}/></button></div>
  </div>;
}
function App(){
  const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('forma-theme')||'light';}catch{return 'light';}});
  const [menu,setMenu]=useState(false);const location=useLocation();
  const progressBarRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('forma-theme',theme);}catch{}},[theme]);
  useEffect(()=>{
    setMenu(false);
    if(!location.hash)window.scrollTo(0,0);
    if(progressBarRef.current){
      progressBarRef.current.style.width='0%';
      progressBarRef.current.parentElement?.setAttribute('aria-valuenow','0');
    }
  },[location.pathname]);
  useEffect(()=>{
    let timer: number;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollY / maxScroll) * 100)) : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${pct}%`;
        progressBarRef.current.parentElement?.setAttribute('aria-valuenow', String(Math.round(pct)));
      }
      const isScrolled = scrollY > 40;
      document.body.classList.toggle('is-scrolled', isScrolled);
      document.body.classList.add('is-scrolling');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 500);
    };
    window.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('resize', handleScroll, {passive: true});
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.clearTimeout(timer);
      document.body.classList.remove('is-scrolled', 'is-scrolling');
    };
  }, [location.pathname]);
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      window.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' });
    }
  };
  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      window.scrollBy({ top: 120, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      window.scrollBy({ top: -120, behavior: 'smooth' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
    }
  };
  const designs=seed.filter(q=>q.type==='System design');
  return <><header className="site-header"><div className="nav-progress-track" role="slider" tabIndex={0} aria-label="Reading progress slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} onClick={handleProgressClick} onKeyDown={handleProgressKeyDown}><div className="nav-progress-bar" ref={progressBarRef}/></div><Link className="brand" to="/">forma<span>/</span><small>system design</small></Link><button className="theme-toggle" aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'} onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>{theme==='light'?<Moon size={19}/>:<Sun size={19}/>}</button></header><div className="page-shell"><button className="mobile-nav" onClick={()=>setMenu(!menu)} aria-expanded={menu}>{menu?<X size={16}/>:<Menu size={16}/>} {location.pathname==='/'?'Topics':'On this page'}</button><Routes><Route path="/" element={<Library menu={menu} designs={designs}/>}/><Route path="/question/:slug" element={<Lesson menu={menu}/>}/><Route path="*" element={<div className="reading-column"><h1>Page nahi mili.</h1><Link to="/">Back to questions →</Link></div>}/></Routes></div></>;
}
function Library({menu,designs}:{menu:boolean;designs:Question[]}){const[search,setSearch]=useState('');const[category,setCategory]=useState('All');const shown=designs.filter(q=>(category==='All'||(q.category||'System Design')===category)&&[q.title,q.topic,q.description].join(' ').toLowerCase().includes(search.toLowerCase()));return <><aside className={'contents '+(menu?'open':'')}><div className="toc-label">LEARN</div>{['All','System Design','Core Systems'].map(c=><a key={c} href="#questions" className={category===c?'toc-current':''} onClick={()=>{setCategory(c);setSearch('');}}>{c==='All'?'All questions':c}</a>)}<div className="toc-label">TOPICS</div>{[...new Set(designs.map(q=>q.topic))].map(topic=><a key={topic} href="#questions" onClick={()=>{setCategory('All');setSearch(topic);}}>{topic}</a>)}<p className="sidebar-note">Pehle samjho.<br/>Phir khud explain karo.</p></aside><main className="reading-column library"><div className="breadcrumb">{category==='Core Systems'?'CORE SYSTEMS':'THE QUESTION LIBRARY'}</div><h1>System design.<br/><span>Ek concept at a time.</span></h1><p className="intro">Simple Hinglish mein explanations, diagrams aur interview questions. Choose a system. Start from the basics.</p><div className="search"><Search size={17}/><input aria-label="Search system design questions" placeholder="Search a system…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Clear search" onClick={()=>setSearch('')}><X size={16}/></button>}</div><div id="questions" className="question-list">{shown.map((q,i)=><Link className="question-row" key={q.id} to={'/question/'+q.slug}><div className="question-number">{String(i+1).padStart(2,'0')}</div><div><span className="library-category">{q.category||'System Design'}</span><h2>{q.title.replace(/^Design a /,'')}</h2><p>{q.description}</p><span>{seed.filter(x=>q.related.includes(x.id)).length} interview questions · Illustrated explanations</span></div><ArrowRight size={20}/></Link>)}{!shown.length&&<div className="empty"><p>Is search se koi question nahi mila.</p><button onClick={()=>setSearch('')}>Clear search →</button></div>}</div><p className="end-note">More systems will appear here as lessons are added.</p></main></>;}
function Lesson({menu}:{menu:boolean}){
 const{slug}=useParams();const q=seed.find(q=>q.slug===slug);const[active,setActive]=useState('section-0');
 useEffect(()=>{setActive('section-0');const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('[data-toc-section]').forEach(el=>observer.observe(el));return()=>observer.disconnect();},[slug]);
 if(!q)return <main className="reading-column"><h1>Question nahi mila.</h1><Link to="/">Back to library →</Link></main>;
 const followups=q.type==='System design'?q.related.map(id=>seed.find(x=>x.id===id)).filter((x):x is Question=>!!x):[];
 return <><aside className={'contents '+(menu?'open':'')}><Link className="back" to="/"><ArrowLeft size={14}/>All questions</Link><div className="toc-label">ON THIS PAGE</div>{q.sections.map((s,i)=><a className={active==='section-'+i?'toc-current':''} key={i} href={'#section-'+i}>{s.title}</a>)}{followups.length>0&&<a className={active==='interview'?'toc-current':''} href="#interview">Interview questions</a>}<a className={active==='revision'?'toc-current':''} href="#revision">Quick revision</a><p className="sidebar-note">Understand the flow.<br/>Phir interview mein explain karo.</p></aside><main className="reading-column"><div className="breadcrumb"><Link to="/">{q.category||'System Design'}</Link><span>/</span>{q.topic}</div><h1>{q.title}</h1><p className="intro">{q.description}</p><div className="lesson-meta">Hinglish explanation <span>·</span> {q.difficulty}</div><div className="lesson-body">{q.sections.map((s,i)=><section id={'section-'+i} data-toc-section key={i} className="lesson-section"><h2>{s.title}</h2>{s.origin==='Supplementary explanation'&&<p className="supplement-label">Additional explanation · source chat ko extend karta hai</p>}<Content body={s.body}/>{s.lab&&<SearchLab kind={s.lab}/>}{s.animation&&<Walkthrough kind={s.animation}/>}</section>)}{followups.length>0&&<section id="interview" data-toc-section className="lesson-section interview-section"><div className="section-kicker">LET’S PRACTISE</div><h2>Interview questions</h2><p>Interviewer ke saamne kaise explain karoge? Pehle apna answer socho, phir neeche explanation kholo.</p>{followups.map((question,i)=><details className="interview-question" id={'followup-'+question.id} key={question.id}><summary><span className="question-number">{String(i+1).padStart(2,'0')}</span><span>{question.title}</span><ChevronDown size={17}/></summary><div className="answer">{question.sections.map((s,j)=><div className="answer-section" key={j}><h3>{s.title}</h3>{s.origin==='Supplementary explanation'&&<p className="supplement-label">Additional explanation</p>}<Content body={s.body}/>{s.lab&&<SearchLab kind={s.lab}/>}{s.animation&&<Walkthrough kind={s.animation}/>}</div>)}<div className="answer-takeaway"><strong>Yaad rakho</strong><ul>{question.takeaways.map(t=><li key={t}>{t}</li>)}</ul></div></div></details>)}</section>}<section id="revision" data-toc-section className="lesson-section revision"><div className="section-kicker">YAAD RAKHNE KE LIYE</div><h2>Quick revision</h2><ul>{q.takeaways.map(t=><li key={t}>{t}</li>)}</ul></section></div><div className="source-note"><p>Sources and further reading. Added explanations are labelled separately.</p><ul>{(q.sources||[q.source||{url:"https://chatgpt.com/s/cx_6ac4bcf09cb4819189b26246aca26db8",label:"your URL shortener conversation"}]).map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}</ul></div><Link className="bottom-back" to="/"><ArrowLeft size={16}/>Back to questions</Link></main></>;
}
createRoot(document.getElementById('root')!).render(<BrowserRouter><App/></BrowserRouter>);
