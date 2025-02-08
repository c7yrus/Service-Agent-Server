import 'dotenv/config'
import { runAgent } from './src/agent'
import { z } from 'zod'
import { tools } from './src/tools'

const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}



const response = runAgent({userMessage, tools})


console.log( 'index', response)
