import { generateImageToolDefinition } from './generateImage'
import { redditToolDefinition } from './reddit'
import { dadJokeToolDefinition } from './dadJoke'
import { movieSearchToolDefinition } from './movieSearch'
import {itemsSearchToolDefinition} from './itemSearch'

export const tools = [
  generateImageToolDefinition,
  redditToolDefinition,
  dadJokeToolDefinition,
  movieSearchToolDefinition,
  itemsSearchToolDefinition
]
