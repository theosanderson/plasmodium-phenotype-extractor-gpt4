// app/api/completion/route.ts
 
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
const OPENROUTER_REFERRER = "https://github.com/alonsosilvaallende/chatplotlib-openrouter"

export const runtime = 'edge'
 
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders:{
              "HTTP-Referer": OPENROUTER_REFERRER
          },
  })
export async function POST(req) {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json()
 
  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: 'openai/gpt-4-32k',
    stream: true,
    // a precise prompt is important for the AI to reply with the correct tokens
    messages: [
      {
        role: "user",
        content: `Read the following scientific paper and make note of any phenotypes it reports for malaria genes.
        Your output should be in the following JSON format:
        [{
          "pf3d7_gene_id": "PF3D7_0100100",
          "gene_name": "merozoite surface protein 1 (msp1)",
          "phenotypes": [
            {
              "stage": "asexual",
              "phenotype": "growth defect",
              "evidence": "Growth defect in vitro"
            },
            {
              "stage": "gametoctye",
              "phenotype": "males do not exflagellate"
            }
          ]
          ,
          "experimental_approach": "CRISPR-Cas9 gene editing" // knockout or knockdown or DiCre
        },
        {
          //gene 2..
        }
      ]

  Ensure you output valid JSON, with no trailing commas. If you really don't know the PF3d7 id, don't make up one, just leave it blank.
Input paper:
${prompt}
        
Output:\n`
      }
    ],
    max_tokens: 2000,
    temperature: 0, // you want absolute certainty for spell check
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1
  })
 
  const stream = OpenAIStream(response)
 
  return new StreamingTextResponse(stream)
}