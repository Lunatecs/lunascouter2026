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
  const keys = ['teamIndex','teamName','teamNumber','matchNumber','autoLevel','teleopLevel','teleopNote','movedFromStart','autoScoredZeroFuel','teleopScoredZeroFuel','defense','needsAttention','discarded','bannerColor','timestamp']
  const escape = (v) => '"' + String(v ?? '').replace(/"/g,'""') + '"'
  const header = keys.join(',')
  const rows = arr.map(r => {
    const team = teams[r.teamIndex] || {}
    const rowData = {
      ...r,
      teamName: team.name || 'Unnamed',
      teamNumber: team.number || '-'
    }
    return keys.map(k => escape(rowData[k])).join(',')
  })
  return [header, ...rows].join('\n')
}
