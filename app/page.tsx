// app/page.tsx
'use client'
 
import { useCompletion } from 'ai/react'
import { useState, useCallback } from 'react'

 /*
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
      */
export default function PostEditorPage() {
  // Locally store our blog posts content
  const [content, setContent] = useState('')
  const [parsedPhenotypes, setParsedPhenotypes] = useState([])
  const { complete , completion, isLoading} = useCompletion({
    api: '/api/completion'
  })
 
  const doStuff = useCallback(
    async (c: string) => {
      
      let completion = await complete(c)
      if (!completion) throw new Error('Failed to check typos')
      // replace \n with ''
      completion = completion.replace(/(\r\n|\n|\r)/gm, "")
      // sometimes the completion has trailing commas making it invalid json
      // how can we fix this?
      completion = completion.replace(/,}/g, "}")
      completion = completion.replace(/,]/g, "]")

      window.com = completion
     
      // attempt to parse the completion
      try {
        const parsed = JSON.parse(completion)
        setParsedPhenotypes(parsed)
      } catch (e) {
        console.error(e)
        throw new Error('Failed to parse completion')
      }
      
    },
    [complete]
  )
 
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Phenotype extractor</h1>
      <textarea className="w-full h-64 p-4 border rounded-md" value={content} onChange={e => setContent(e.target.value)} />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4" onClick={() => doStuff(content)}>Extract</button>
      {isLoading && <div className="text-gray-600">Loading…</div>}
      {completion && (
        <>
        <div className="my-4">
          {completion}
        </div>
        <div>
          {parsedPhenotypes.map((gene, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md">
              <a href={`http://phenoplasm.org/update.php?gene=${gene.pf3d7_gene_id}`} className="text-blue-500 hover:underline">
                {gene.pf3d7_gene_id}
              </a>
              <p className="font-semibold">{gene.gene_name}</p>
              <ul className="list-disc pl-4">
                {gene.phenotypes.map((phenotype, i) => (
                  <li key={i}>
                    {phenotype.stage}: {phenotype.phenotype} - {phenotype.evidence || ""}
                  </li>
                ))}
              </ul>
              <p>Experimental Approach: {gene.experimental_approach}</p>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  )
}

