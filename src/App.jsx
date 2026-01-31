import React, { useState, useRef, useEffect } from 'react'

export default function App() {
  const [theme, setTheme] = useState('blue')
  const [bannerSelection, setBannerSelection] = useState('')
  const [teams, setTeams] = useState([])
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [active, setActive] = useState('settings')
  // scouting state
  const [teleopLevel, setTeleopLevel] = useState(null)
  const [teleopNote, setTeleopNote] = useState('')
  const [matchNumber, setMatchNumber] = useState('')
  const [autoLevel, setAutoLevel] = useState(0) // 0,1,2,3
  const [movedFromStart, setMovedFromStart] = useState('no') // 'yes' | 'no'
  const [defense, setDefense] = useState('no') // 'yes' | 'no'
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [records, setRecords] = useState([]) // saved scouting records
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

  // modal for teleop details
  const [showModal, setShowModal] = useState(false)
  const [teleopLevelModal, setTeleopLevelModal] = useState(0)
  const [teleopComments, setTeleopComments] = useState('')


  const addTeam = () => {
    const n = name.trim()
    const num = number.trim()
    if (!n && !num) return
    setTeams(prev => [...prev, { name: n || 'Unnamed', number: num || '-' }])
    setName('')
    setNumber('')
  }

  // load/save persistent state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('luna_v2_state')
      if (!raw) return
      const s = JSON.parse(raw)
      if (s.teams && Array.isArray(s.teams)) setTeams(s.teams)
      if (s.records && Array.isArray(s.records)) setRecords(s.records)
      if (typeof s.bannerSelection === 'string') setBannerSelection(s.bannerSelection)
      if (typeof s.theme === 'string') setTheme(s.theme)
      if (s.selectedTeam !== undefined) setSelectedTeam(s.selectedTeam)
    } catch (err) {
      console.warn('Failed to load saved state', err)
    }
  }, [])

  useEffect(() => {
    try {
      const snapshot = { teams, records, bannerSelection, theme, selectedTeam }
      localStorage.setItem('luna_v2_state', JSON.stringify(snapshot))
    } catch (err) {
      console.warn('Failed to save state', err)
    }
  }, [teams, records, bannerSelection, theme, selectedTeam])

  // import/export handlers
  const importInputRef = useRef(null)
  const parseCSV = (text) => {
    // basic CSV parser that handles quoted fields and newlines
    const rows = []
    let cur = ''
    let row = []
    let inQuotes = false
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      const next = text[i+1]
      if (ch === '"') {
        if (inQuotes && next === '"') { cur += '"'; i++; continue } // escaped quote
        inQuotes = !inQuotes
        continue
      }
      if (ch === ',' && !inQuotes) { row.push(cur); cur = ''; continue }
      if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && next === '\n') { /* windows crlf: skip, newline will be handled */ }
        if (cur !== '' || row.length > 0) { row.push(cur); rows.push(row); row = []; cur = '' }
        continue
      }
      cur += ch
    }
    if (cur !== '' || row.length > 0) { row.push(cur); rows.push(row) }
    // trim whitespace
    return rows.map(r => r.map(c => c.trim()))
  }

  const importTeamsFromFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const txt = String(reader.result)
      // if the file is JSON, allow importing JSON as fallback
      const isCSV = f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv' || txt.indexOf(',') !== -1
      try {
        if (isCSV) {
          const rows = parseCSV(txt).filter(r => r.length > 0)
          if (rows.length === 0) { alert('CSV is empty'); return }
          // detect header
          const header = rows[0].map(h => (h||'').toLowerCase())
          const hasHeader = header.some(h => ['name','team','teamname','number','num','teamnumber'].includes(h))
          const startIdx = hasHeader ? 1 : 0
          const nameIdx = hasHeader ? header.findIndex(h => ['name','team','teamname'].includes(h)) : 0
          const numberIdx = hasHeader ? header.findIndex(h => ['number','num','teamnumber'].includes(h)) : 1
          const list = rows.slice(startIdx).map(r => ({
            name: (r[nameIdx] || r[0] || 'Unnamed').trim(),
            number: String((r[numberIdx] || r[1] || '-')).trim()
          }))
          setTeams(prev => [...prev, ...list])
        } else {
          const parsed = JSON.parse(txt)
          let list = []
          if (Array.isArray(parsed)) list = parsed
          else if (parsed.teams && Array.isArray(parsed.teams)) list = parsed.teams
          else if (parsed.data && Array.isArray(parsed.data)) list = parsed.data
          else { alert('JSON must be an array of teams or an object with a `teams` array'); return }
          const normalized = list.map(t => ({ name: (t.name || t.team || 'Unnamed'), number: String(t.number ?? t.num ?? t.teamNumber ?? '-') }))
          setTeams(prev => [...prev, ...normalized])
        }
      } catch (err) {
        alert('Failed to import file: ' + err.message)
      }
    }
    reader.readAsText(f)
    e.target.value = null
  }

  const exportRecordsJSON = () => {
    const payload = (selectedTeam === null || selectedTeam === '') ? records : records.filter(r => r.teamIndex === Number(selectedTeam))
    const dataStr = JSON.stringify(payload, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const name = (selectedTeam === null || selectedTeam === '') ? 'records' : (teams[Number(selectedTeam)]?.name || 'team') + '_' + (teams[Number(selectedTeam)]?.number || '')
    a.href = url; a.download = `${name}.json`; a.click(); URL.revokeObjectURL(url)
  }

  const toCSV = (arr) => {
    if (!arr || arr.length === 0) return ''
    const keys = ['teamIndex','matchNumber','autoLevel','teleopLevel','teleopNote','movedFromStart','defense','bannerColor','themeAtSave','timestamp']
    const escape = (v) => '"' + String(v ?? '').replace(/"/g,'""') + '"'
    const header = keys.join(',')
    const rows = arr.map(r => keys.map(k => escape(r[k])).join(','))
    return [header, ...rows].join('\n')
  }

  const exportRecordsCSV = () => {
    const payload = (selectedTeam === null || selectedTeam === '') ? records : records.filter(r => r.teamIndex === Number(selectedTeam))
    const csv = toCSV(payload)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const name = (selectedTeam === null || selectedTeam === '') ? 'records' : (teams[Number(selectedTeam)]?.name || 'team') + '_' + (teams[Number(selectedTeam)]?.number || '')
    a.href = url; a.download = `${name}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className={`banner ${bannerSelection.startsWith('Red') ? 'red' : bannerSelection.startsWith('Blue') ? 'blue' : ''}`}>
        <div className="banner-inner">
          {['Red 1','Red 2','Red 3','Blue 1','Blue 2','Blue 3'].map(b => (
            <button
              key={b}
              className={`banner-btn ${bannerSelection === b ? 'selected' : ''}`}
              onClick={() => setBannerSelection(b)}
              aria-pressed={bannerSelection === b}
            >{b}</button>
          ))}
        </div>
      </div>
      {/* viewport outline matches the banner color; pointer-events:none so it doesn't block interaction */}
      <div className={`viewport-outline ${bannerSelection.startsWith('Red') ? 'red' : bannerSelection.startsWith('Blue') ? 'blue' : ''}`} />
      <div className={`app-root theme-${theme}`} style={{paddingTop:64}}>
      <div className="tabs">
        <div className={`tab ${active === 'settings' ? 'active' : ''}`} onClick={() => setActive('settings')}>Settings</div>
        <div className={`tab ${active === 'scouting' ? 'active' : ''}`} onClick={() => setActive('scouting')}>Scouting</div>
        <div className={`tab ${active === 'data' ? 'active' : ''}`} onClick={() => setActive('data')}>Data</div>
      </div>

      <div className={`panels ${active === 'settings' ? 'settings-two' : ''}`}>
        {active === 'scouting' && (
          <section className={`panel full scouting-area`}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <div style={{minWidth:220, display:'flex',gap:8,alignItems:'center'}}>
                <select className="team-select" value={selectedTeam ?? ''} onChange={e => setSelectedTeam(e.target.value)}>
                  <option value="">Select team</option>
                  {teams.map((t, i) => (
                    <option key={i} value={i}>{t.name} {t.number? `(${t.number})`: ''}</option>
                  ))}
                </select>
                <input
                  className="input"
                  placeholder="Match #"
                  value={matchNumber}
                  inputMode="numeric"
                  pattern="\\d*"
                  onChange={e => setMatchNumber(e.target.value.replace(/\D/g, ''))}
                  style={{width:92,padding:10,borderRadius:10,border:'1px solid rgba(255,255,255,0.04)',background:'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01))',color:'var(--text)'}}
                />
              </div>
              <h2 style={{margin:0}}>Scouting</h2>
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
                  </div>

                  {/* Teleop scoring removed per user request */}
                  <div style={{marginTop:10, display:'flex', justifyContent:'flex-end'}}>
                    <button className="next-button" onClick={() => setShowModal(true)}>Endgame</button>
                  </div>
                </div>
              </div>
            </div>
            {/* Team Data removed from Scouting — moved to Data tab */}
          </section>
        )}

        {active === 'data' && (
          <section className={`panel full data-area`}>
            <h2>Data Area</h2>
            <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8}}>
              <select className="team-select" value={selectedTeam ?? ''} onChange={e => setSelectedTeam(e.target.value)}>
                <option value="">Select team</option>
                {teams.map((t, i) => (
                  <option key={i} value={i}>{t.name} {t.number? `(${t.number})`: ''}</option>
                ))}
              </select>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button className="btn small" onClick={exportRecordsJSON}>Export JSON</button>
                <button className="btn small" onClick={exportRecordsCSV}>Export CSV</button>
              </div>
              <div style={{color:'var(--muted)'}}>Pick a team to view saved scouting records and exports.</div>
            </div>

            <div style={{marginTop:12}}>
              {selectedTeam === null || selectedTeam === '' ? (
                <div style={{color:'var(--muted)'}}>No team selected.</div>
              ) : (
                <div style={{display:'grid',gap:8}}>
                  <div style={{fontWeight:700}}>{teams[Number(selectedTeam)]?.name || 'Team'} {teams[Number(selectedTeam)]?.number ? `(${teams[Number(selectedTeam)].number})` : ''}</div>
                  {(() => {
                    const teamRecords = records.filter(r => r.teamIndex === Number(selectedTeam))
                    if (teamRecords.length === 0) return <div style={{color:'var(--muted)'}}>No records yet for this team.</div>
                    return (
                      <div style={{display:'grid',gap:8,marginTop:6}}>
                        {teamRecords.map((r, idx) => {
                          const color = r.bannerColor === 'red' ? '#fa1818' : r.bannerColor === 'blue' ? '#1e74ff' : '#9aa0a6'
                          return (
                            <div key={idx} className="record-row" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:12,borderRadius:8,background:'rgba(255,255,255,0.02)',borderLeft:'4px solid transparent'}}>
                              <div style={{display:'flex',gap:12,alignItems:'flex-start',flex:1}}>
                                <div style={{width:12,height:12,borderRadius:6,background:color,marginTop:6}} />
                                <div style={{display:'flex',flexDirection:'column'}}>
                                  <div style={{fontWeight:700}}>Match {r.matchNumber || '-'}</div>
                                  <div style={{color:'var(--muted)'}}>Saved: {new Date(r.timestamp).toLocaleString()}</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                  <div style={{fontWeight:700}}>Scores</div>
                                  <div style={{color:'var(--muted)'}}>Auto level: {r.autoLevel}</div>
                                  <div style={{color:'var(--muted)'}}>Teleop level: {r.teleopLevel}</div>
                                  <div style={{color:'var(--muted)',fontSize:13}}>Defense: {r.defense || '-'} · Moved: {r.movedFromStart || '-'}</div>
                                </div>
                              </div>
                              <div style={{width:260,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                                <div style={{color:'var(--muted)',fontSize:13,whiteSpace:'pre-wrap',textAlign:'right',maxWidth:260}}>{r.teleopNote || ''}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </section>
        )}

        {active === 'settings' && (
          <>
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
                // restrict input to digits only and show numeric keyboard on mobile
                inputMode="numeric"
                pattern="\d*"
                onChange={e => setNumber(e.target.value.replace(/\D/g, ''))}
              />
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <button className="btn" onClick={addTeam}>Add Teams</button>
                <div className="small">Add With CSV</div>
                <button className="btn small" onClick={() => importInputRef.current && importInputRef.current.click()}>Import</button>
                <input ref={importInputRef} type="file" accept=".csv,text/csv,application/json,.json" style={{display:'none'}} onChange={importTeamsFromFile} />
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

      {/* Teleop modal rendered at app level so it appears while in Scouting */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop:0}}>Teleop Details</h3>
            <div style={{marginTop:8}}>
              <div style={{fontWeight:700,marginBottom:8}}>What Level</div>
              <div className="level-buttons">
                {[1,2,3].map(n => (
                  <button key={n} className={`level-button ${teleopLevelModal===n? 'selected':''}`} onClick={() => setTeleopLevelModal(n)}>{n}</button>
                ))}
                <button className={`level-button ${teleopLevelModal===0? 'selected':''}`} onClick={() => setTeleopLevelModal(0)}>0</button>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <div style={{fontWeight:700,marginBottom:8}}>Comments</div>
              <textarea className="input modal-textarea" placeholder="Add comments..." value={teleopComments} onChange={e => setTeleopComments(e.target.value)} />
            </div>

            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
              <button className="btn small" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn" onClick={() => {
                // apply teleop modal values
                setTeleopLevel(teleopLevelModal)
                setTeleopNote(teleopComments)

                // save a record snapshot if a team is selected
                if (!(selectedTeam === null || selectedTeam === '')) {
                  const rec = {
                    teamIndex: Number(selectedTeam),
                    matchNumber: matchNumber || '',
                    autoLevel,
                    teleopLevel: teleopLevelModal,
                    teleopNote: teleopComments,
                    movedFromStart,
                    defense,
                    // record the banner color (red / blue) based on current selection
                    bannerColor: bannerSelection.startsWith('Red') ? 'red' : bannerSelection.startsWith('Blue') ? 'blue' : '',
                    themeAtSave: theme,
                    timestamp: Date.now()
                  }
                  setRecords(prev => [...prev, rec])

                  // reset scouting inputs & buttons after save
                  setMatchNumber('')
                  setAutoLevel(0)
                  setTeleopLevel(null)
                  setTeleopNote('')
                  setMovedFromStart('no')
                  setDefense('no')
                  setTeleopLevelModal(0)
                  setTeleopComments('')
                }

                setShowModal(false)
                console.log('Teleop submitted', { level: teleopLevelModal, comment: teleopComments })
              }}>Submit</button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  )
}
