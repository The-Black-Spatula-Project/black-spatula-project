import fs from "fs"
import fetch from "node-fetch"

/**
 * Fetches a file from the specified URL and writes it to outputPath.
 * Retries up to 5 times if the request fails or returns 404.
 */
export async function fetchAttachment(
  url: string,
  outputPath: string,
  token?: string
) {
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  console.log(`Fetching URL: ${url}`)
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, { headers })
      console.log(`HTTP Status: ${response.status}`)

      if (response.ok) {
        const buffer = await response.buffer()
        fs.writeFileSync(outputPath, buffer)
        console.log(`File download succeeded. Saved at ${outputPath}`)
        return
      } else if (response.status === 404) {
        console.error(`Attempt ${attempt}: File not found (404).`)
      } else {
        console.error(
          `Attempt ${attempt}: Unexpected HTTP status ${response.status}`
        )
      }
    } catch (error) {
      console.error(
        `Attempt ${attempt}: Failed to fetch file. Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }

    console.log(`Retrying in 5 seconds...`)
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  throw new Error(`Failed to fetch file from ${url} after 5 attempts.`)
}

const attachmentUrl = process.argv[2]
const outputFilePath = process.argv[3]
const token = process.env.GITHUB_TOKEN

if (!attachmentUrl || !outputFilePath) {
  console.error("Usage: node fetch_attachment.js <url> <output_path>")
  process.exit(1)
}

fetchAttachment(attachmentUrl, outputFilePath, token)
  .then(() => console.log("File fetch completed successfully."))
  .catch((error) => {
    console.error(`Failed to fetch attachment: ${error.message}`)
    process.exit(1)
  })
