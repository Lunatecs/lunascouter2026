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
  brokeDown,
  setBrokeDown,
  relayedFuel,
  setRelayedFuel,
  autoPosition,
  setAutoPosition,
  autoFuelCollected,
  setAutoFuelCollected,
  onOpenFieldModal,
  teleopLevel,
  setTeleopLevel,
  teleopNote,
  setTeleopNote,
  onSubmit,
  scoutName,
  setScoutName
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
          <div className="control-group">
            <label>Scout</label>
            <input
              className="input"
              placeholder="Name"
              value={scoutName}
              onChange={e => setScoutName(e.target.value)}
              style={{width: 160, height: 40, padding: '0 12px', borderRadius: 20}}
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
              <div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                  <div style={{fontWeight:700}}>Starting Position</div>
                  <span 
                    onClick={onOpenFieldModal}
                    style={{ 
                      fontSize: '11px', 
                      color: '#cffe00', 
                      textDecoration: 'underline', 
                      cursor: 'pointer',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Open Map
                  </span>
                </div>
                <div className="level-buttons" style={{gap:8}}>
                  {['1','2','3','4'].map(pos => (
                    <button key={pos} className={`level-button ${autoPosition===pos? 'selected':''}`} style={{flex:1, minWidth:0, padding:'12px 0'}} onClick={() => setAutoPosition(pos)}>{pos}</button>
                  ))}
                </div>
              </div>

              <div className="row small-row" style={{marginTop:12}}>
                <div style={{display:'flex', gap:8, width:'100%'}}>
                  <button className={`btn small yes-btn ${movedFromStart===true?'selected':''}`} style={{flex:1, height:'auto', minHeight:'40px', whiteSpace:'normal', lineHeight:'1.2'}} onClick={() => setMovedFromStart(true)}>Moved from Start</button>
                  <button className={`btn small no-btn ${movedFromStart===false?'selected':''}`} style={{flex:1, height:'auto', minHeight:'40px', whiteSpace:'normal', lineHeight:'1.2'}} onClick={() => setMovedFromStart(false)}>Didn't Move</button>
                </div>
              </div>

              <div className="row small-row" style={{marginTop:8}}>
                <div style={{display:'flex', gap:8, width:'100%'}}>
                  <button className={`btn small no-btn ${autoScoredZeroFuel===true?'selected':''}`} style={{flex:1, height:'auto', minHeight:'40px', whiteSpace:'normal', lineHeight:'1.2'}} onClick={() => setAutoScoredZeroFuel(true)}>Zero Fuel</button>
                  <button className={`btn small yes-btn ${autoScoredZeroFuel===false?'selected':''}`} style={{flex:1, height:'auto', minHeight:'40px', whiteSpace:'normal', lineHeight:'1.2'}} onClick={() => setAutoScoredZeroFuel(false)}>Scored Fuel</button>
                </div>
              </div>

              <div style={{marginTop:12}}>
                <div style={{fontWeight:700, marginBottom:8}}>Fuel Collected From</div>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {['Center Area', 'Human Player', 'Depot'].map(loc => (
                    <button 
                      key={loc} 
                      className={`btn small ${autoFuelCollected===loc?'selected':''}`} 
                      style={{flex:'1 1 auto', height:'auto', minHeight:'40px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px'}} 
                      onClick={() => setAutoFuelCollected(loc)}
                    >
                      {loc}
                    </button>
                  ))}
                  <button 
                    className={`btn small ${autoFuelCollected==='None'?'selected':''}`} 
                    style={{flex:'1 1 auto', height:'auto', minHeight:'40px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px'}} 
                    onClick={() => setAutoFuelCollected('None')}
                  >
                    None
                  </button>
                </div>
              </div>

              <div style={{marginTop:12}}>
                <div className="row"><span style={{fontWeight:700}}>Tower Position</span></div>
                <div className="level-buttons">
                  {[1].map(n => (
                    <button key={n} className={`level-button ${autoLevel===n? 'selected':''}`} onClick={() => setAutoLevel(n)}>L{n}</button>
                  ))}
                  <button className={`level-button ${autoLevel===0? 'selected':''}`} onClick={() => setAutoLevel(0)}>None</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="teleop-column" style={{display:'flex', flexDirection:'column', gap:20}}>
          <div className="teleop-panel">
            <div className="module-title">Teleop</div>
            <div className="teleop-content">
              <div className="top-controls" style={{display:'flex',flexDirection:'column',gap:16,height:'100%'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',columnGap:24, rowGap:20}}>
                  <div>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      <button className={`btn small yes-btn ${defense===true?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setDefense(true)}>Played Defense</button>
                      <button className={`btn small no-btn ${defense===false?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setDefense(false)}>No Defense</button>
                    </div>
                  </div>
                  <div>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      <button className={`btn small yes-btn ${teleopScoredZeroFuel===true?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setTeleopScoredZeroFuel(true)}>Scored Fuel</button>
                      <button className={`btn small no-btn ${teleopScoredZeroFuel===false?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setTeleopScoredZeroFuel(false)}>Zero Fuel</button>
                    </div>
                  </div>
                  <div>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      <button className={`btn small no-btn ${brokeDown===true?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setBrokeDown(true)}>Robot Broke Down</button>
                      <button className={`btn small yes-btn ${brokeDown===false?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setBrokeDown(false)}>Robot has no issues</button>
                    </div>
                  </div>
                  <div>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      <button className={`btn small yes-btn ${relayedFuel===true?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setRelayedFuel(true)}>Transported Fuel</button>
                      <button className={`btn small no-btn ${relayedFuel===false?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setRelayedFuel(false)}>No Fuel Relay</button>
                    </div>
                  </div>
                  <div>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      <button className={`btn small no-btn ${needsAttention===true?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setNeedsAttention(true)}>Needs Match Review</button>
                      <button className={`btn small yes-btn ${needsAttention===false?'selected':''}`} style={{flex:1, height:'auto', minHeight:'44px', whiteSpace:'normal', lineHeight:'1.2', padding:'8px 4px'}} onClick={() => setNeedsAttention(false)}>Good Scouting</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="teleop-panel">
            <div className="module-title">Endgame</div>
            <div className="endgame-content" style={{display:'flex', flexDirection:'column', gap:16}}>
              <div>
                <div style={{fontWeight:700, marginBottom:8}}>Tower Position</div>
                <div className="level-buttons">
                  {[1,2,3].map(n => (
                    <button key={n} className={`level-button ${teleopLevel===n? 'selected':''}`} onClick={() => setTeleopLevel(n)}>L{n}</button>
                  ))}
                  <button className={`level-button ${teleopLevel===0? 'selected':''}`} onClick={() => setTeleopLevel(0)}>None</button>
                </div>
              </div>
              <div>
                <div style={{fontWeight:700, marginBottom:8}}>Comments</div>
                <textarea 
                  className="input modal-textarea" 
                  style={{width:'100%', minHeight:'80px'}} 
                  placeholder="Add comments..." 
                  value={teleopNote} 
                  onChange={e => setTeleopNote(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{marginTop: 32, display:'flex', justifyContent:'center'}}>
        <button className="next-button" style={{width:'100%', maxWidth:'400px', minHeight:'60px', height:'auto', padding:'16px'}} onClick={onSubmit}>Submit Match</button>
      </div>
    </section>
  )
}
