import { zodFunction } from 'openai/helpers/zod';
import type { AIMessage } from '../types'
// import { openai } from './instantiate-model-connection'
import OpenAI from 'openai'

 const openai = new OpenAI()

 //this is how you can add better context to system prompt
 const systemPrompt = `
 Try to call get_items tools as much as you can if any questions is asked about items, where to recycle them or their condition
  <context> 
    todays date: ${new Date().toLocaleDateString()}
  </context>
 `

const runLLM = async ({messages, tools}: {messages: AIMessage[], tools: any[]}) => {
  const formattedTools = tools.map(zodFunction)
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    //never save system prompt to db, always add it at the end before sending the message to llm via api, like below implementation. Because it needs to be dynamic.
    messages: [{role: 'system', content: systemPrompt}, ...messages],
    tools: formattedTools,
    tool_choice: 'auto',
    parallel_tool_calls: false,
    // max_tokens: 2000,
    // response_format: {type: 'json_object'}
  })

  //Use this if there is no tool call because if there is tool call there wont be the method content on the response object.
  // return response.choices[0].message.content

  //because we are using tool call we use below code
  return response.choices[0].message
}

export default runLLM
 
