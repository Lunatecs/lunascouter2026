import React from 'react'

export default function NextMatchModal({ 
  show, 
  onClose, 
  matchNumber, 
  setMatchNumber, 
  selectedTeam, 
  setSelectedTeam, 
  teams 
}) {
  if (!show) return null

  const handleStart = () => {
    if (selectedTeam === '' || selectedTeam === null) {
        alert('Please select a team for the next match.');
        return;
    }
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{maxWidth: 400}}>
         <h3 style={{marginTop:0}}>Next Match Setup</h3>
         <div className="control-group match-group" style={{marginBottom:16}}>
              <label style={{display:'block', marginBottom:8, fontWeight:700}}>Match Number</label>
              <input
                className="input match-input"
                placeholder="#"
                value={matchNumber}
                inputMode="numeric"
                pattern="\\d*"
                onChange={e => setMatchNumber(e.target.value.replace(/\D/g, ''))}
                style={{width:'100%', boxSizing:'border-box'}}
              />
         </div>
         <div className="control-group" style={{marginBottom:24}}>
              <label style={{display:'block', marginBottom:8, fontWeight:700}}>Select Team</label>
              <select 
                className="team-select" 
                value={selectedTeam ?? ''} 
                onChange={e => setSelectedTeam(e.target.value)} 
                style={{width:'100%', padding:12, fontSize:16, background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8}}
              >
                <option value="">Select Team...</option>
                {teams.map((t, i) => (
                  <option key={i} value={i}>{t.name} {t.number? `(${t.number})`: ''}</option>
                ))}
              </select>
         </div>
         <div style={{display:'flex', justifyContent:'flex-end'}}>
             <button className="btn" onClick={handleStart}>Start Match</button>
         </div>
      </div>
    </div>
  )
}
