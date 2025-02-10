import 'dotenv/config'
import { Index as UpstashIndex } from '@upstash/vector'
import { parse } from 'csv-parse/sync'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'

const index = new UpstashIndex()

const indexItemsData = async () => {
  const spinner = ora('Reading item data...').start()
  const itemsMasterPath = path.join(process.cwd(), 'src/rag/item_master_cleaned.csv')
  
  const csvData = fs.readFileSync(itemsMasterPath, 'utf-8')
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  })

  spinner.text = 'Starting item indexing...'

  for (const record of records) {
    // Replace 'Title' with a valid column name (e.g., productshortname)
    const itemId = record.productshortname || `item-${Math.random().toString(36).substr(2, 9)}`

    spinner.text = `Indexing item ${itemId}...`

    // Ensure all fields exist to avoid 'undefined' errors
    const text = `${record.productshortname || ''}. ${record.customercategory || ''}. ${record.subcategories || ''}. ${record.description || ''}.`

    try {
      await index.upsert({
        id: itemId,
        data: text,
        metadata: {
          description: record.description || '',
          customerCategory: record.customercategory || '',
          subCategory: record.subcategories || '',
          productName: record.productshortname || '',
          productType: record.producttype || '',
        },
      })
    } catch (e) {
      spinner.fail(`Error indexing item ${itemId}`)
      console.error(e)
    }
  }

  spinner.succeed('All items indexed!')
}

indexItemsData()
