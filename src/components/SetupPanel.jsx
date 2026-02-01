import React, { useState, useRef } from 'react'
import { parseCSV } from '../utils/csvHelpers'

export default function SetupPanel({ 
  teams, 
  setTeams, 
  allianceSelection, 
  setAllianceSelection, 
  onShare, 
  onDeleteTeam 
}) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const importInputRef = useRef(null)

  const addTeam = () => {
    const n = name.trim()
    const num = number.trim()
    if (!n && !num) return
    setTeams(prev => [...prev, { name: n || 'Unnamed', number: num || '-' }])
    setName('')
    setNumber('')
  }

  const importTeamsFromFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const txt = String(reader.result)
      const isCSV = f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv' || txt.indexOf(',') !== -1
      try {
        if (isCSV) {
          const rows = parseCSV(txt).filter(r => r.length > 0)
          if (rows.length === 0) { alert('CSV is empty'); return }
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

  const handleAllianceSelect = (selection) => {
    if (allianceSelection && allianceSelection !== selection) {
      if (window.confirm(`Current alliance is ${allianceSelection}. Do you want to switch to ${selection}?`)) {
        setAllianceSelection(selection)
      }
    } else {
      setAllianceSelection(selection)
    }
  }

  return (
    <>
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
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
                inputMode="numeric"
                pattern="\d*"
                onChange={e => setNumber(e.target.value.replace(/\D/g, ''))}
            />
            <div style={{display:'flex',justifyContent:'center',marginTop:8}}>
                <button className="btn" onClick={addTeam}>Add Team</button>
            </div>
            </section>

            <section className={`panel import-csv`}>
            <h2>Bulk Import</h2>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,textAlign:'center'}}>
                <div style={{color:'var(--muted)',fontSize:14}}>Add teams via CSV or JSON file.</div>
                <button className="btn" onClick={() => importInputRef.current && importInputRef.current.click()}>Import File</button>
                <input ref={importInputRef} type="file" accept=".csv,text/csv,application/json,.json" style={{display:'none'}} onChange={importTeamsFromFile} />
                <div className="small" style={{marginTop:12,fontSize:12,opacity:0.7}}>Supported headers: name, number, team, teamname, num</div>
            </div>
            </section>

            <section className="panel alliance-select">
            <h2>Alliance Selection</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {['Red 1', 'Red 2', 'Red 3', 'Blue 1', 'Blue 2', 'Blue 3'].map(b => (
                <button
                    key={b}
                    className={`banner-btn ${allianceSelection === b ? 'selected' : ''} ${b.startsWith('Red') ? 'is-red' : 'is-blue'}`}
                    style={{
                    background: b.startsWith('Red') ? 'var(--banner-red)' : 'var(--banner-blue)',
                    color: '#fff',
                    border: allianceSelection === b ? '2px solid #fff' : '2px solid transparent',
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    opacity: allianceSelection === b ? 1 : 0.7,
                    cursor: 'pointer'
                    }}
                    onClick={() => handleAllianceSelect(b)}
                >
                    {b}
                </button>
                ))}
            </div>
            </section>
        </div>

        <section className={`panel team-list`}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h2>Team List</h2>
                <button className="btn small" onClick={onShare} style={{marginBottom:16}}>Share via QR</button>
            </div>
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
                    <button className="delete-btn" onClick={() => onDeleteTeam(i)}>Delete</button>
                    </div>
                </div>
                ))
            )}
            </div>
        </section>
    </>
  )
}
