import type { ToolFn } from '../../types'
import { z } from 'zod'
import { queryItems } from '../rag/query_item'

export const itemsSearchToolDefinition = {
  name: 'item_search',
  parameters: z.object({
    query: z.string().describe('query used to vector search on items'),
  }),
  description:
    'use this tool to find items or answer questions about items and their metada like description, condition, category and more.',
}

type Args = z.infer<typeof itemsSearchToolDefinition.parameters>

export const itemSearch: ToolFn<Args> = async ({ userMessage, toolArgs }) => {
  let results
  try {
    results = await queryItems({ query: toolArgs.query })
  } catch (e) {
    console.error(e)
    return 'Error: Could not query the db to get movies.'
  }

  const formattedResults = results.map((result) => {
    const { metadata, data } = result
    return { ...metadata, description: data }
  })

  return JSON.stringify(formattedResults, null, 2)
}
