import { zodFunction } from 'openai/helpers/zod';
import type { AIMessage } from '../types'
import { openai } from './instantiate-model-connection'

const runUserQueryThroughModel = async ({messages, tools}: {messages: AIMessage[], tools: any[]}) => {
  const formattedTools = tools.map(zodFunction)
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages,
    tools: formattedTools,
    tool_choice: 'auto',
    parallel_tool_calls: false
  })

  //Use this if there is no tool call because if there is tool call there wont be the method content on the response object.
  // return response.choices[0].message.content

  //because we are using tool call we use below code
  return response.choices[0].message
}

export default runUserQueryThroughModel
 
