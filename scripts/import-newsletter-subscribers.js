'use strict'

const fs = require('fs')
const path = require('path')
const { isValidEmail, normalizeEmail } = require('../src/utils/newsletter')

const DEFAULT_CSV_PATH =
  '/Users/edwintse/Downloads/EnvoyX - Baobab Network Fundraising Tracker 2024 - Fundraising Tracker.csv'

const parseArgs = (argv) => {
  const args = argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const filePath = args.find((entry) => !entry.startsWith('--')) || DEFAULT_CSV_PATH
  return {
    dryRun,
    filePath: path.resolve(filePath)
  }
}

const parseCsvLine = (line) => {
  const values = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values.map((value) => value.trim())
}

const parseCsv = (content) =>
  content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map(parseCsvLine)

const normalizeHeader = (value) => value.trim().toLowerCase()

const findHeaderRowIndex = (rows) =>
  rows.findIndex((row) => {
    const normalized = row.map(normalizeHeader)
    return normalized.includes('email') && normalized.includes('contact person')
  })

const buildRecords = (rows) => {
  const headerRowIndex = findHeaderRowIndex(rows)
  if (headerRowIndex < 0) {
    throw new Error('Could not locate the CSV header row.')
  }

  const header = rows[headerRowIndex].map((value) => value.trim())
  const headerMap = header.reduce((accumulator, key, index) => {
    accumulator[normalizeHeader(key)] = index
    return accumulator
  }, {})

  const getValue = (row, key) => {
    const index = headerMap[normalizeHeader(key)]
    if (typeof index !== 'number') return ''
    return row[index] ? row[index].trim() : ''
  }

  return rows.slice(headerRowIndex + 1).map((row) => ({
    email: getValue(row, 'Email'),
    fullName: getValue(row, 'Contact Person'),
    organization: getValue(row, 'Organisation'),
    sourceStatus: getValue(row, 'Status'),
    connectedThrough: getValue(row, 'Connected through'),
    sourceMeta: Object.fromEntries(
      header
        .map((key, index) => [key, row[index] ? row[index].trim() : ''])
        .filter(([key, value]) => key && value)
    )
  }))
}

async function main() {
  const { dryRun, filePath } = parseArgs(process.argv)

  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at ${filePath}`)
  }

  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'))
  const records = buildRecords(rows)

  const { createStrapi, compileStrapi } = require('@strapi/strapi')
  const appContext = await compileStrapi()
  const app = await createStrapi(appContext).load()
  const subscriberService = app.service('api::newsletter-subscriber.newsletter-subscriber')

  let imported = 0
  let skipped = 0
  const seen = new Set()

  try {
    for (const record of records) {
      const email = normalizeEmail(record.email)
      if (!email || seen.has(email) || !isValidEmail(email)) {
        skipped += 1
        continue
      }

      seen.add(email)

      if (dryRun) {
        imported += 1
        continue
      }

      await subscriberService.subscribe({
        email,
        fullName: record.fullName,
        organization: record.organization,
        source: 'fundraising-tracker',
        sourceStatus: record.sourceStatus,
        connectedThrough: record.connectedThrough,
        sourceMeta: record.sourceMeta
      })
      imported += 1
    }
  } finally {
    await app.destroy()
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        filePath,
        imported,
        skipped,
        rowsRead: records.length
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
