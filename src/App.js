import React, { useState } from 'react';

export default function App() {
  const [gameState, setGameState] = useState("setup");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const generateQuestions = async () => {
    if (!topic.trim()) { alert("Koi topic likho pehle!"); return; }
    setGameState("loading");
    try {
      const prompt = `Generate exactly ${numQuestions} trivia questions about the topic: "${topic}". Difficulty: ${difficulty}. Respond ONLY with valid JSON, no extra text: {"questions": [{"question": "...","options": ["A","B","C","D"],"correctAnswer": 0}]}. Each question must have exactly 4 options. correctAnswer is the index (0-3) of the correct option.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content.map(i => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed.questions);
      setGameState("playing");
      setCurrentQuestion(0); setScore(0); setAnswers([]);
    } catch (e) {
      alert("Questions generate nahi ho sake. Dobara try karo!");
      setGameState("setup");
    }
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) { alert("Koi jawab choose karo!"); return; }
    if (!showAnswer) { setShowAnswer(true); return; }
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, { selectedAnswer, isCorrect }];
    setAnswers(newAnswers);
    if (isCorrect) setScore(s => s + 1);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(q => q + 1); setSelectedAnswer(null); setShowAnswer(false);
    } else { setGameState("results"); }
  };

  const reset = () => {
    setGameState("setup"); setTopic(""); setCurrentQuestion(0);
    setSelectedAnswer(null); setScore(0); setAnswers([]); setQuestions([]); setShowAnswer(false);
  };

  const s = { page: { minHeight:"100vh", background:"#0f172a", color:"white", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }, card: { width:"100%", maxWidth:"500px" }, box: { background:"#1e293b", borderRadius:"20px", padding:"28px", border:"2px solid #334155" }, label: { display:"block", fontWeight:700, color:"#4ade80", marginBottom:"10px", fontSize:"18px" }, btn: (active) => ({ flex:1, padding:"12px", borderRadius:"12px", border:`2px solid ${active?"#4ade80":"#334155"}`, background:active?"#4ade80":"#0f172a", color:active?"black":"white", fontWeight:700, fontSize:"15px", cursor:"pointer" }), mainBtn: { width:"100%", padding:"16px", borderRadius:"14px", background:"#4ade80", border:"none", color:"black", fontWeight:900, fontSize:"20px", cursor:"pointer" } };

  if (gameState === "setup") return (
    <div style={s.page}><div style={s.card}>
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{fontSize:"48px"}}>🧠</div>
        <h1 style={{fontSize:"40px",fontWeight:900,color:"#4ade80",margin:0}}>Quiz Game</h1>
        <p style={{color:"#94a3b8",marginTop:"8px"}}>Koi bhi topic choose karo aur quiz khelo!</p>
      </div>
      <div style={s.box}>
        <label style={s.label}>📝 Topic likho</label>
        <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generateQuestions()} placeholder="jaise: Cricket, Harry Potter, Space..." style={{width:"100%",padding:"14px",borderRadius:"12px",border:"2px solid #4ade80",background:"#0f172a",color:"white",fontSize:"16px",outline:"none",boxSizing:"border-box",marginBottom:"24px"}} />
        <label style={s.label}>⚡ Difficulty</label>
        <div style={{display:"flex",gap:"10px",marginBottom:"24px"}}>
          {["easy","medium","hard"].map(d=><button key={d} onClick={()=>setDifficulty(d)} style={s.btn(difficulty===d)}>{d==="easy"?"🟢 Easy":d==="medium"?"🟡 Medium":"🔴 Hard"}</button>)}
        </div>
        <label style={s.label}>🔢 Kitne questions?</label>
        <div style={{display:"flex",gap:"10px",marginBottom:"28px"}}>
          {[5,10,15,20].map(n=><button key={n} onClick={()=>setNumQuestions(n)} style={s.btn(numQuestions===n)}>{n}</button>)}
        </div>
        <button onClick={generateQuestions} style={s.mainBtn}>🚀 Quiz Shuru Karo!</button>
      </div>
    </div></div>
  );

  if (gameState === "loading") return (
    <div style={{...s.page,flexDirection:"column",gap:"16px"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:"60px",height:"60px",border:"4px solid #4ade80",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <h2 style={{color:"#4ade80",fontSize:"24px",fontWeight:700}}>"{topic}" ke questions ban rahe hain...</h2>
      <p style={{color:"#94a3b8"}}>Thoda wait karo! ⏳</p>
    </div>
  );

  if (gameState === "playing") {
    const q = questions[currentQuestion];
    return (
      <div style={s.page}><div style={{...s.card,maxWidth:"600px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"16px"}}>
          <span style={{color:"#4ade80",fontWeight:700}}>Q {currentQuestion+1}/{questions.length}</span>
          <span style={{color:"#4ade80",fontWeight:700}}>Score: {score} ✅</span>
        </div>
        <div style={{background:"#1e293b",borderRadius:"10px",height:"8px",marginBottom:"20px"}}>
          <div style={{background:"#4ade80",height:"8px",borderRadius:"10px",width:`${(currentQuestion/questions.length)*100}%`,transition:"width 0.3s"}}/>
        </div>
        <div style={s.box}>
          <span style={{background:"#4ade80",color:"black",borderRadius:"20px",padding:"4px 12px",fontSize:"13px",fontWeight:700}}>🎯 {topic}</span>
          <h2 style={{fontSize:"20px",fontWeight:700,margin:"16px 0 24px",lineHeight:1.5}}>{q.question}</h2>
          <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"20px"}}>
            {q.options.map((opt,i)=>{
              let bg="#0f172a",border="#334155",color="white";
              if(showAnswer){if(i===q.correctAnswer){bg="#15803d";border="#4ade80";}else if(i===selectedAnswer){bg="#991b1b";border="#f87171";}else{bg="#1e293b";color="#64748b";}}
              else if(selectedAnswer===i){bg="#4ade80";border="#4ade80";color="black";}
              return <button key={i} onClick={()=>!showAnswer&&setSelectedAnswer(i)} style={{padding:"14px 18px",borderRadius:"12px",border:`2px solid ${border}`,background:bg,color,fontWeight:600,fontSize:"16px",textAlign:"left",cursor:showAnswer?"default":"pointer"}}>
                <span style={{fontWeight:900,marginRight:"10px"}}>{String.fromCharCode(65+i)}.</span>{opt}
                {showAnswer&&i===q.correctAnswer&&" ✓"}{showAnswer&&i===selectedAnswer&&i!==q.correctAnswer&&" ✗"}
              </button>;
            })}
          </div>
          <button onClick={nextQuestion} style={s.mainBtn}>
            {!showAnswer?"✅ Jawab Check Karo":currentQuestion+1===questions.length?"🏁 Results Dekho":"➡️ Agla Sawaal"}
          </button>
        </div>
      </div></div>
    );
  }

  if (gameState === "results") {
    const pct = Math.round((score/questions.length)*100);
    const emoji = pct>=80?"🏆":pct>=60?"👍":pct>=40?"😊":"📚";
    const msg = pct>=80?"Zabardast!":pct>=60?"Bahut Accha!":pct>=40?"Theek Hai!":"Aur Padhna Padega!";
    return (
      <div style={s.page}><div style={{...s.card,textAlign:"center"}}>
        <div style={{fontSize:"64px"}}>{emoji}</div>
        <h1 style={{fontSize:"40px",fontWeight:900,color:"#4ade80",margin:"0 0 16px"}}>Result</h1>
        <div style={s.box}>
          <div style={{fontSize:"56px",fontWeight:900,color:"#4ade80"}}>{score}/{questions.length}</div>
          <div style={{fontSize:"24px",fontWeight:700,marginBottom:"8px"}}>{pct}% Sahi</div>
          <div style={{fontSize:"20px",color:"#94a3b8",marginBottom:"24px"}}>{msg}</div>
          <div style={{textAlign:"left",display:"flex",flexDirection:"column",gap:"10px",marginBottom:"24px"}}>
            {questions.map((q,i)=>{const a=answers[i];return(
              <div key={i} style={{padding:"12px",borderRadius:"12px",border:`2px solid ${a?.isCorrect?"#4ade80":"#f87171"}`,background:a?.isCorrect?"#14532d33":"#7f1d1d33"}}>
                <div style={{fontWeight:600,marginBottom:"4px",fontSize:"14px"}}>{q.question}</div>
                <div style={{fontSize:"13px",color:a?.isCorrect?"#4ade80":"#f87171"}}>Tumhara: {q.options[a?.selectedAnswer]}</div>
                {!a?.isCorrect&&<div style={{fontSize:"13px",color:"#4ade80"}}>Sahi: {q.options[q.correctAnswer]}</div>}
              </div>
            );})}
          </div>
          <button onClick={reset} style={s.mainBtn}>🔄 Naya Topic Try Karo</button>
        </div>
      </div></div>
    );
  }
}
