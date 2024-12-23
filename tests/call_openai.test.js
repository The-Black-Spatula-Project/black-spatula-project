const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('call_openai', () => {
  it('should call the OpenAI API and return a response for a text prompt', (done) => {
    const openai_key = process.env.OPENAI_API_KEY;
    const scriptPath = path.resolve(__dirname, '../dist/call_openai.js');
    const textPrompt = 'create a hello world in python';
    const encodedPrompt = Buffer.from(textPrompt).toString('base64');
    const command = `node ${scriptPath} ${openai_key} "${encodedPrompt}" "" "gpt-4"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        done(error);
        return;
      }
      console.log(stdout);
      expect(stdout).toBeDefined();
      done();
    });
  });

  /*
  it('should call the OpenAI API and return a response for a PDF file', (done) => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    const scriptPath = path.resolve(__dirname, '../dist/call_openai.js');
    const pdfPath = path.resolve(__dirname, 'test.pdf');
    
    // Create a mock PDF file
    fs.writeFileSync(pdfPath, '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Hello, World!) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000100 00000 n \n0000000173 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n231\n%%EOF');
    
    const command = `node ${scriptPath} "test-api-key" "" "${pdfPath}" "gpt-4"`;

    exec(command, (error, stdout, stderr) => {
      fs.unlinkSync(pdfPath); // Clean up the mock PDF file
      if (error) {
        done(error);
        return;
      }
      expect(stdout).toBeDefined();
      done();
    });
  });
*/
 
});
