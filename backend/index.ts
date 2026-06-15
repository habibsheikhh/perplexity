import { tavily }  from '@tavily/core';

import { GoogleGenAI } from "@google/genai";

import express from "express";
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from './prompt';
import { prisma } from './prisma/db';

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
const app = express();

app.use(express.json());

const res = await prisma.user.create({
  data: {
    email: "test@test.com",
    provider: "Google",
    name: "Test User",
  },
});

console.log(res);

app.post("/signup", async (req, res) => {

});

app.post("/signin", async (req, res) => {

});

app.get("/conversations", async (req, res) => {

});

app.post("/conversation/:conversationId", async (req, res) => {

});

app.post("/perplexity_ask", async (req, res) => {
    // Step 1 - get the query from the user 

    const query = req.body?.query;

    if (!query) {
      return res.status(400).json({
        error: "query is required",
      });
    }

    // Step 2 - make sure has access/credits to hit the endpoint

    // Step 3 - check if we have web saerch index for a similar query

    // Step 4 - web search to gather sources

    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    });

    const webSearchResult = webSearchResponse.results;

    // Step 5 - do some context enginnering on the prompt + web search responces

    // Step 6 - hit the LLM ans stream back the response

    const prompt = PROMPT_TEMPLATE
      .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
      .replace("{{USER_QUERY}}", query);

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      contents: prompt,
    });

    // Stream LLM response
    for await (const chunk of stream) {
      const text = chunk.text;

      if (text) {
        res.write(text);
      }
    }    

    // Step 7 - also stream back the sources and follow up questions which we can get from an parallel LLM call

    res.write("\n<SOURCES>\n");
    // Stream sources
    res.write(JSON.stringify(webSearchResult.map(result => ({ url : result.url}))));

    res.write("\n<\SOURCES>\n");
    // Step 8 - close the event stream

    res.end();
})

app.post("perplexity_ask/follow_up", async(req, res) => {
    // Get the exisiting chat history from db

    // Forward the full history to LLM

    // Stream the reponse to the user
})

app.listen(3000);
