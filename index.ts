import 'dotenv/config'
import runUserQueryThroughModel from './src/run-Model'
import { addMessages, getMessages } from './src/memory'

const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

await addMessages([{role: 'user', content: userMessage}])
const messages = await getMessages()
const response = await runUserQueryThroughModel({
  messages
})

console.log(response)
