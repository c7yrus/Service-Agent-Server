import type { AIMessage } from '../types'
import runUserQueryThroughModel from './run-Model'
import { z } from 'zod'
// import { runTool } from './toolRunner'
import { addMessages, getMessages } from './memory'
import { logMessage, showLoader } from './ui'

export const runAgent = async ({
  userMessage,
  tools
}: {
  userMessage: string,
  tools: any[]
}) => {
  await addMessages([
    {
      role: 'user',
      content: userMessage,
    },
  ])

  const loader = showLoader('Thinking...')
  const history = await getMessages()
  
  const response: any = await runUserQueryThroughModel({
    messages: history,
    tools,
  })

  if (response.tool_calls){
      console.log(response.tool_calls)
  }

  await addMessages([response])

  logMessage(response)
    loader.stop()
  return getMessages()
}
