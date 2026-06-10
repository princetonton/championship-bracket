import{i}from"./prediction.3rXkfuoN.js";function s(r,e){document.getElementById(r).innerHTML=e.map(d=>`
    <div class="bracket-match">
      <div class="match-label">${d.label||d.id}</div>
      <div class="teams">
        <span class="team-name home">${d.homeName}</span>
        <span style="font-weight:700;color:var(--text)">${d.homeScore??""}</span>
        <span class="colon">:</span>
        <span style="font-weight:700;color:var(--text)">${d.awayScore??""}</span>
        <span class="team-name away">${d.awayName}</span>
      </div>
    </div>
  `).join("")}document.getElementById("run-prediction").addEventListener("click",()=>{const r=document.getElementById("pred-status");r.textContent="⏳ Generating prediction...",setTimeout(()=>{const e=i(Date.now());document.getElementById("pred-champion").textContent=e.champion;const d=document.getElementById("pred-standings");d.innerHTML="";for(const[t,c]of Object.entries(e.standings)){const o=document.createElement("div");o.className="card",o.innerHTML=`
        <h2>Group ${t}</h2>
        <table class="standings-table">
          <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
          <tbody>
            ${c.map((a,n)=>`<tr><td class="pos${n+1}">${n+1}</td><td class="pos${n+1}">${a.name}</td><td>${a.played}</td><td>${a.w}</td><td>${a.d}</td><td>${a.l}</td><td>${a.gf}</td><td>${a.ga}</td><td>${a.gd>0?"+":""}${a.gd}</td><td class="pos${n+1}">${a.points}</td></tr>`).join("")}
          </tbody>
        </table>
      `,d.appendChild(o)}s("pred-r32-grid",e.r32.map(t=>({...t,homeScore:e.r32results[t.id]?.homeScore,awayScore:e.r32results[t.id]?.awayScore}))),s("pred-r16-grid",e.r16.map(t=>({...t,homeScore:e.r16results[t.id]?.homeScore,awayScore:e.r16results[t.id]?.awayScore}))),s("pred-qf-grid",e.qf.map(t=>({...t,homeScore:e.qfresults[t.id]?.homeScore,awayScore:e.qfresults[t.id]?.awayScore}))),s("pred-sf-grid",e.sf.map(t=>({...t,homeScore:e.sfresults[t.id]?.homeScore,awayScore:e.sfresults[t.id]?.awayScore}))),s("pred-final-grid",e.finals),document.getElementById("prediction-results").style.display="block",r.textContent="✅ Prediction generated!"},100)});
