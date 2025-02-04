import { openai } from './instantiate-model-connection'


const runUserQueryThroughModel = async ({userMessage}: {userMessage: string}) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {role: 'user', content: userMessage}
    ]
  })
  return response.choices[0].message.content
}

export default runUserQueryThroughModel
 
