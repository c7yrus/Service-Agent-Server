1. Add a .env file at the root of the project and add a key **OPENAI_API_KEY** which value should be your OpenAI Key.


2. Add a db.json file at the root of your project with the initial value 
{
  "messages": []
}


3. cd in to dashboard folder and run npm dev to see the visual representation of runnig evaluations in chart format in the web.

4. To apply RAG, you need to add following variables to your .env file. You will need to create an Upstash account. 
  a. UPSTASH_VECTOR_REST_URL
  b. UPSTASH_VECTOR_REST_TOKEN

