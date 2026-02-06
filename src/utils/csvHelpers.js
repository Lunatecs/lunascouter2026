export const parseCSV = (text) => {
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

export const toCSV = (arr, teams) => {
  if (!arr || arr.length === 0) return ''
  
  // Define headers for the new schema
  // We'll keep the output flat for CSV compatibility
  const valueKeys = [
    'autoLevel',
    'autoPosition',
    'autoFuelCollected',
    'teleopLevel',
    'teleopNote',
    'movedFromStart',
    'autoScoredZeroFuel',
    'teleopScoredZeroFuel',
    'defense',
    'needsAttention',
    'brokeDown',
    'relayedFuel',
    'discarded'
  ]
  
  const headers = ['team', 'matchNumber', 'position', 'scoutName', 'timestamp', ...valueKeys]
  const escape = (v) => '"' + String(v ?? '').replace(/"/g,'""') + '"'
  const headerRow = headers.join(',')

  const rows = arr.map(r => {
    // Handle both new and old schema
    let rowData = {}
    
    if (r.values) {
      // New Schema
      rowData = {
        team: r.team, // stored as number/string
        matchNumber: r.matchNumber,
        position: r.position,
        scoutName: r.scoutName,
        timestamp: r.timestamp,
        ...r.values,
        // Overwrite/Ensure top level fields if they exist there
        discarded: r.discarded ?? r.values.discarded
      }
    } else {
      // Old Schema fallback
      const team = teams[r.teamIndex] || {}
      rowData = {
        team: team.number || '-',
        matchNumber: r.matchNumber,
        position: r.bannerColor ? (r.bannerColor === 'red' ? 'Red' : 'Blue') : '', // Approximation
        timestamp: r.timestamp,
        // Spread the rest of the flat properties
        ...r
      }
    }

    return headers.map(k => escape(rowData[k])).join(',')
  })
  
  return [headerRow, ...rows].join('\n')
}
