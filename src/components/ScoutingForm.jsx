import React from 'react'

export default function ScoutingForm({
  teams,
  selectedTeam,
  setSelectedTeam,
  matchNumber,
  setMatchNumber,
  movedFromStart,
  setMovedFromStart,
  autoScoredZeroFuel,
  setAutoScoredZeroFuel,
  autoLevel,
  setAutoLevel,
  teleopScoredZeroFuel,
  setTeleopScoredZeroFuel,
  defense,
  setDefense,
  needsAttention,
  setNeedsAttention,
  onOpenTeleopModal
}) {
  return (
    <section className={`panel full scouting-area`}>
      <div className="scouting-header">
        <div className="scouting-controls">
          <div className="control-group">
            <label>Team</label>
            <select className="team-select" value={selectedTeam ?? ''} onChange={e => setSelectedTeam(e.target.value)}>
              <option value="">Select</option>
              {teams.map((t, i) => (
                <option key={i} value={i}>{t.name} {t.number? `(${t.number})`: ''}</option>
              ))}
            </select>
          </div>
          <div className="control-group match-group">
            <label>Match</label>
            <input
              className="input match-input"
              placeholder="#"
              value={matchNumber}
              inputMode="numeric"
              pattern="\\d*"
              onChange={e => setMatchNumber(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
        <h2>Scouting</h2>
      </div>
      <div className="scouting-grid">
        <div className="auto-panel">
          <div className="module-title">Auto</div>
          <div className="auto-content">
            <div className="top-controls">
              <div className="row small-row"><span>Moved from Start</span>
                <div style={{display:'flex',gap:8}}>
                  <button className={`btn small yes-btn ${movedFromStart==='yes'?'selected':''}`} onClick={() => setMovedFromStart('yes')}>Yes</button>
                  <button className={`btn small no-btn ${movedFromStart==='no'?'selected':''}`} onClick={() => setMovedFromStart('no')}>No</button>
                </div>
              </div>

              <div className="row small-row" style={{marginTop:8}}><span>Scored Zero Fuel</span>
                <div style={{display:'flex',gap:8}}>
                  <button className={`btn small yes-btn ${autoScoredZeroFuel==='yes'?'selected':''}`} onClick={() => setAutoScoredZeroFuel('yes')}>Yes</button>
                  <button className={`btn small no-btn ${autoScoredZeroFuel==='no'?'selected':''}`} onClick={() => setAutoScoredZeroFuel('no')}>No</button>
                </div>
              </div>

              <div style={{marginTop:8}}>
                <div className="row"><span style={{fontWeight:700}}>What Level</span></div>
                <div className="level-buttons">
                  {[1,2,3].map(n => (
                    <button key={n} className={`level-button ${autoLevel===n? 'selected':''}`} onClick={() => setAutoLevel(n)}>{n}</button>
                  ))}
                  <button className={`level-button ${autoLevel===0? 'selected':''}`} onClick={() => setAutoLevel(0)}>0</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="teleop-panel">
          <div className="module-title">Teleop</div>
          <div className="teleop-content">
            <div className="top-controls" style={{display:'flex',gap:16,alignItems:'stretch'}}>
              <div style={{display:'flex',flexDirection:'column',gap:12,flex:1}}>
                <div>
                  <div style={{fontWeight:700}}>Defense ?</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className={`btn small yes-btn ${defense==='yes'?'selected':''}`} onClick={() => setDefense('yes')}>Yes</button>
                    <button className={`btn small no-btn ${defense==='no'?'selected':''}`} onClick={() => setDefense('no')}>No</button>
                  </div>
                </div>
                <div>
                  <div style={{fontWeight:700}}>Scored Zero Fuel ?</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className={`btn small yes-btn ${teleopScoredZeroFuel==='yes'?'selected':''}`} onClick={() => setTeleopScoredZeroFuel('yes')}>Yes</button>
                    <button className={`btn small no-btn ${teleopScoredZeroFuel==='no'?'selected':''}`} onClick={() => setTeleopScoredZeroFuel('no')}>No</button>
                  </div>
                </div>
                <div>
                  <div style={{fontWeight:700}}>Needs Attention ?</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className={`btn small yes-btn ${needsAttention==='yes'?'selected':''}`} onClick={() => setNeedsAttention('yes')}>Yes</button>
                    <button className={`btn small no-btn ${needsAttention==='no'?'selected':''}`} onClick={() => setNeedsAttention('no')}>No</button>
                  </div>
                </div>
              </div>

              {/* Endgame button - positioned to the right */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <button className="next-button" onClick={onOpenTeleopModal}>Endgame</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
