import fetch from "node-fetch"
import fs from "fs"
import { extractTextWithPdftotext } from "./extract_pdf.js"

interface OpenAIResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

function buildCombinedPrompt(prompt: string, pdfPath: string, pdfText: string) {
  return pdfPath && pdfPath.trim() !== "" && fs.existsSync(pdfPath)
    ? `${prompt}\n\n---\n\nExtracted Content:\n${pdfText}`
    : prompt
}

async function main() {
  const apiKey = process.argv[2]
  const base64Prompt = process.argv[3]
  const pdfPath = process.argv[4]
  const model = process.argv[5] || "gpt-4o"

  if (!apiKey) {
    console.error("Missing OpenAI API key")
    process.exit(1)
  }

  if (!base64Prompt) {
    console.error("Missing prompt")
    process.exit(1)
  }

  // Decode the base64-encoded prompt
  let prompt = Buffer.from(base64Prompt, "base64").toString("utf8")

  // Remove URLs from the prompt
  prompt = prompt.replace(/https?:\/\/\S+/g, "").trim()

  let pdfText = ""

  // Extract text if a valid PDF is provided
  if (pdfPath && pdfPath.trim() !== "" && fs.existsSync(pdfPath)) {
    try {
      pdfText = await extractTextWithPdftotext(pdfPath)
    } catch (error) {
      console.error("Error reading PDF:", error)
      process.exit(1)
    }
  } else {
    // console.log("No valid PDF path provided. Skipping PDF content.")
  }

  // Combine the prompt with the extracted PDF content, if any
  const combinedPrompt = buildCombinedPrompt(prompt, pdfPath, pdfText)

  const apiUrl = "https://api.openai.com/v1/chat/completions"
  const requestBody = {
    model: model,
    max_completion_tokens: 4096,
    messages: [{ role: "user", content: combinedPrompt }],
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `OpenAI API request failed: ${response.status} ${response.statusText}, Response: ${errorText}`
      )
    }

    const data = (await response.json()) as OpenAIResponse
    const completion =
      data.choices?.[0]?.message?.content || "No response from the model."

    // Make the second API call to clean the response for GitHub
    const cleanRequestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `
I want to create a detailed GitHub comment with clean, readable Markdown formatting. Specifically:

1. **Retain only the content provided**—do not introduce new content, examples, or mathematical equations unless explicitly present in the original response.

2. **All math expressions**—including:
   - Bracketed forms (e.g., [ ... ]),
   - Parenthesized LaTeX (e.g., \( ... \)),
   - Inline dollar signs with ($ ... $),
   should be converted to **standalone block math** enclosed in $\` and \`$. 

   For example:
   - "\\( E = mc^2 \\" becomes:
     $\`
     E = mc^2
     \`$
   - "[ a^2 + b^2 = c^2 ]" becomes:
     $\`
     a^2 + b^2 = c^2
     \`$
   - " $ d = vt $" becomes:
     $\`
     d = vt
     \`$

3. Any LaTeX math expressions that include \\text and \\frac should be enclosed in $\` and \`$ delimiters.

4. **Headers**, bullet points, and other Markdown remain as usual, but ensure every math expression stands alone in block form.

5. **Do not** include extra quotes \`\`\` or the word markdown or extra explanations in the final output. Return **only** the cleaned Markdown.

Here is the text to format:

${completion}

Ensure the final output is concise and is suitable for GitHub's Markdown parsing. If anything is ambiguous, prioritize professional clarity.
          `,
        },
      ],
    }

    const cleanResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(cleanRequestBody),
    })

    if (!cleanResponse.ok) {
      const errorText = await cleanResponse.text()
      throw new Error(
        `OpenAI API request for cleaning failed: ${cleanResponse.status} ${cleanResponse.statusText}, Response: ${errorText}`
      )
    }

    const cleanData = (await cleanResponse.json()) as OpenAIResponse
    const cleanCompletion =
      cleanData.choices?.[0]?.message?.content || "No response from the model."

    process.stdout.write(Buffer.from(cleanCompletion).toString("base64"))
  } catch (error) {
    console.error(`Error during API calls:`, error)
    process.exit(1)
  }
}

main()
