import { scanUrl } from '../lib/scanner'

const url = process.argv[2]

if (!url) {
  console.error('Usage: npx tsx scripts/test-scan.ts <url>')
  process.exit(1)
}

console.log(`\nScanning ${url} ...\n`)

scanUrl(url)
  .then((report) => {
    console.log(`Score        : ${report.score}/100`)
    console.log(`Violations   : ${report.violations.length}`)
    console.log(`Scanned at   : ${report.scannedAt}\n`)

    if (report.violations.length === 0) {
      console.log('No violations found.')
      return
    }

    const byTheme = report.violations.reduce<Record<string, number>>((acc, v) => {
      acc[v.rgaaTheme] = (acc[v.rgaaTheme] ?? 0) + 1
      return acc
    }, {})

    console.log('Violations by RGAA theme:')
    for (const [theme, count] of Object.entries(byTheme).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${theme.padEnd(26)} ${count}`)
    }

    console.log('\nTop violations:')
    const top = report.violations
      .sort((a, b) => {
        const order = { critical: 0, serious: 1, moderate: 2, minor: 3 }
        return order[a.impact] - order[b.impact]
      })
      .slice(0, 10)

    for (const v of top) {
      const impact = v.impact.toUpperCase().padEnd(8)
      console.log(`  [${impact}] ${v.id} (${v.nodes.length} node${v.nodes.length > 1 ? 's' : ''}) — ${v.rgaaTheme}`)
      console.log(`           ${v.helpUrl}`)
    }
  })
  .catch((err) => {
    console.error('Scan failed:', err.message)
    process.exit(1)
  })
