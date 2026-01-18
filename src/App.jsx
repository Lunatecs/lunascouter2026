import React, { useState } from 'react'

export default function App() {
  const [teams, setTeams] = useState([])
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [active, setActive] = useState('settings')
  // scouting state
  const [autoCount, setAutoCount] = useState(0)
  const [teleopCount, setTeleopCount] = useState(0)
  const [autoLevel, setAutoLevel] = useState(0) // 0,1,2,3
  const [movedFromStart, setMovedFromStart] = useState(null) // 'yes' | 'no' | null
  const [defense, setDefense] = useState(null) // 'yes' | 'no' | null
  const [selectedTeam, setSelectedTeam] = useState(null)
  const deleteTeam = (index) => {
    setTeams(prev => prev.filter((_, i) => i !== index))
    // adjust selectedTeam if necessary
    setSelectedTeam(prevSel => {
      if (prevSel === null || prevSel === '') return null
      const si = Number(prevSel)
      if (si === index) return null
      if (si > index) return String(si - 1)
      return String(si)
    })
  }

  const addTeam = () => {
    const n = name.trim()
    const num = number.trim()
    if (!n && !num) return
    setTeams(prev => [...prev, { name: n || 'Unnamed', number: num || '-' }])
    setName('')
    setNumber('')
  }

  return (
    <div className="app-root">
      <div className="tabs">
        <div className={`tab ${active === 'settings' ? 'active' : ''}`} onClick={() => setActive('settings')}>settings</div>
        <div className={`tab ${active === 'scouting' ? 'active' : ''}`} onClick={() => setActive('scouting')}>Scouting</div>
        <div className={`tab ${active === 'data' ? 'active' : ''}`} onClick={() => setActive('data')}>Data</div>
      </div>

      <div className="panels">
        {active === 'scouting' && (
          <section className={`panel full scouting-area`}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <h2 style={{margin:0}}>Scouting</h2>
              <div style={{minWidth:220}}>
                <select className="team-select" value={selectedTeam ?? ''} onChange={e => setSelectedTeam(e.target.value)}>
                  <option value="">Select team</option>
                  {teams.map((t, i) => (
                    <option key={i} value={i}>{t.name} {t.number? `(${t.number})`: ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="scouting-grid">
              <div className="auto-panel">
                <div className="module-title">Auto</div>
                <div className="auto-content">
                  <div className="top-controls">
                    <div className="row small-row"><span>Moved from Start</span>
                      <div style={{display:'flex',gap:8}}>
                        <button className={`btn small ${movedFromStart==='yes'?'selected':''}`} onClick={() => setMovedFromStart('yes')}>Yes</button>
                        <button className={`btn small ${movedFromStart==='no'?'selected':''}`} onClick={() => setMovedFromStart('no')}>No</button>
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

                  <div style={{marginTop:14}}>
                    <div style={{fontWeight:700,marginBottom:8}}>Game Pieces Scored</div>
                    <div className="score-box">
                      <div className="score-controls left">
                        <button className="score-btn" onClick={() => setAutoCount(c => c+5)}>+5</button>
                        <button className="score-btn" onClick={() => setAutoCount(c => c+1)}>+1</button>
                      </div>
                      <div className="score-display">{autoCount}</div>
                      <div className="score-controls right">
                        <button className="score-btn" onClick={() => setAutoCount(c => Math.max(0, c-5))}>-5</button>
                        <button className="score-btn" onClick={() => setAutoCount(c => Math.max(0, c-1))}>-1</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="teleop-panel">
                <div className="module-title">Teleop</div>
                <div className="teleop-content">
                  <div className="top-controls" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700}}>Defense ?</div>
                      <div style={{display:'flex',gap:8,marginTop:8}}>
                        <button className={`btn small ${defense==='yes'?'selected':''}`} onClick={() => setDefense('yes')}>Yes</button>
                        <button className={`btn small ${defense==='no'?'selected':''}`} onClick={() => setDefense('no')}>No</button>
                      </div>
                    </div>
                    <div>
                      <button className="next-button">Next</button>
                    </div>
                  </div>

                  <div className="teleop-score">
                    <div style={{fontWeight:700,marginBottom:8}}>Game Pieces Scored</div>
                    <div className="score-box">
                      <div className="score-controls left">
                        <button className="score-btn" onClick={() => setTeleopCount(c => c+5)}>+5</button>
                        <button className="score-btn" onClick={() => setTeleopCount(c => c+1)}>+1</button>
                      </div>
                      <div className="score-display large">{teleopCount}</div>
                      <div className="score-controls right">
                        <button className="score-btn" onClick={() => setTeleopCount(c => Math.max(0, c-5))}>-5</button>
                        <button className="score-btn" onClick={() => setTeleopCount(c => Math.max(0, c-1))}>-1</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {active === 'data' && (
          <section className={`panel full data-area`}>
            <h2>Data Area</h2>
            <div style={{marginTop:12,color:'var(--muted)'}}>Blank workspace for data views and exports.</div>
          </section>
        )}

        {active === 'settings' && (
          <>
            <section className={`panel settings-panel`}>
              <h2>Settings</h2>
              <div style={{display:'grid',gap:12,marginTop:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700}}>Dark mode</div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn small">on</button>
                    <button className="btn small">off</button>
                  </div>
                </div>

                <div>
                  <div style={{fontWeight:700,marginBottom:8}}>Theme</div>
                  <div style={{display:'flex',gap:12}}>
                    <div style={{width:40,height:36,background:'#1e74ff',borderRadius:6,boxShadow:'0 6px 16px rgba(30,167,255,0.12)'}} />
                    <div style={{width:40,height:36,background:'#fa1818',borderRadius:6,boxShadow:'0 6px 16px rgba(255,107,107,0.12)'}} />
                    <div style={{width:40,height:36,background:'#9aa0a6',borderRadius:6,boxShadow:'0 6px 16px rgba(154,160,166,0.08)'}} />
                  </div>
                </div>
              </div>
            </section>

            <section className={`panel add-team`}>
              <h2>Add a team</h2>
              <input
                className="input"
                placeholder="Team Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Team Number"
                value={number}
                onChange={e => setNumber(e.target.value)}
              />
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <button className="btn" onClick={addTeam}>Add Teams</button>
                <div className="small">Add With Json</div>
                <button className="btn small">Import</button>
              </div>
            </section>

            <section className={`panel team-list`}>
              <h2>Team List</h2>
              <div className="team-list-box">
                {teams.length === 0 ? (
                  <div className="empty">No teams yet</div>
                ) : (
                  teams.map((t, i) => (
                    <div className="team-row" key={i}>
                      <div style={{display:'flex',flexDirection:'column'}}>
                        <div className="team-name">{t.name}</div>
                        <div className="team-number">{t.number}</div>
                      </div>
                      <div>
                        <button className="delete-btn" onClick={() => deleteTeam(i)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
