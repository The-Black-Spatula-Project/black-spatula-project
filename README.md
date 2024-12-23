# The Black Spatula Project

## Background

The Black Spatula Project is an open initiative to investigate the potential of large language models (LLMs) to identify errors in scientific papers. We seek to answer:
- How many errors can LLMs detect?
- How serious are those errors?
- Which model/prompt/pipeline performs the best?
- How can we use AI to improve scientific integrity?

The project was inspired by a scientific paper that, due to a simple math error that even an AI reviewer could catch, caused many people to toss all of their black plastic kitchen implements. For details, see the original introduction by Steve Newman.

### How to Run Analysis for New Papers

Create a new issue with the model name (#gpt-40, #o1-preview, etc.) in the title. Provide your prompt in the issue description and also upload the PDF of the paper. The analysis will show up as a comment to the issue in a couple minutes.

### Research (#prompt-and-model)
- Try some papers you like or from the WithdrarXiv dataset.
- Use any model you have access to (ChatGPT, GPT-o1, etc.).
- Save your prompts/results in the shared sheets.
- Domain experts: please add your name and expertise in the Volunteer Evaluators sheet.


### Potential Paper Sources
- arXiv (LaTeX, PDF, HTML)
- ChemRxiv (PDF)
- PsyArXiv
- SOCArXiv
- PubMed Central (PDF, some HTML, has an API)
- Social Science Open Access Repository
- Semantic Scholar (API for search/retrieval)
- WithdrarXiv (withdrawn arXiv papers) on HuggingFace
- PubPeer (biomed comments)
- Retraction Watch Database
