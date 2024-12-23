import { exec } from "child_process"
import fs from "fs"
import path from "path"
import util from "util"
const execPromise = util.promisify(exec)

/**
 * Extracts text from a PDF file using the pdftotext utility.
 * Throws an error if the file is not found or not valid.
 */
export async function extractTextWithPdftotext(
  pdfPath: string
): Promise<string> {
  // Perform initial checks and debugging outside the Promise
  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF file does not exist")
  }

  // Print file stats
  const stats = fs.statSync(pdfPath)
  // console.log(`File Size: ${stats.size} bytes`);
  let first100Bytes

  // Print first 100 bytes of the file for inspection
  try {
    const fileBuffer = fs.readFileSync(pdfPath)
    first100Bytes = fileBuffer.toString(
      "utf8",
      0,
      Math.min(fileBuffer.length, 100)
    )
    // console.log("First 100 bytes of file:");
    // console.log(first100Bytes);
  } catch (readError) {
    console.error(
      "Error reading first 100 bytes:",
      readError instanceof Error ? readError.message : String(readError)
    )
  }

  // Validate the file type
  let fileTypeResult
  try {
    fileTypeResult = await execPromise(`file --brief --mime-type "${pdfPath}"`)
    // console.log(`File Type: ${fileTypeResult.stdout.trim()}`);
  } catch (fileTypeError) {
    console.error(
      "Error determining file type:",
      fileTypeError instanceof Error
        ? fileTypeError.message
        : String(fileTypeError)
    )
    throw new Error("Could not determine file type")
  }

  if (!fileTypeResult.stdout.trim().startsWith("application/pdf")) {
    throw new Error(`File is not a valid PDF: ${fileTypeResult.stdout.trim()}`)
  }

  // Wrap the `pdftotext` command execution in a Promise
  return new Promise((resolve, reject) => {
    const outputTxtPath = `${path.basename(pdfPath, ".pdf")}.txt`

    exec(
      `pdftotext "${pdfPath}" "${outputTxtPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          return reject(
            new Error(`Error running pdftotext: ${stderr || error.message}`)
          )
        }

        // Read the extracted text
        fs.readFile(outputTxtPath, "utf8", (err, data) => {
          if (err) {
            return reject(
              new Error(`Error reading output text file: ${err.message}`)
            )
          }

          // Clean up the temporary text file
          fs.unlink(outputTxtPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(
                `Warning: Unable to delete temp file: ${unlinkErr.message}`
              )
            }
          })

          resolve(data.trim())
        })
      }
    )
  })
}
