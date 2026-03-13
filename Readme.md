# AI Medical Report Summarizer

An intelligent Retrieval-Augmented Generation (RAG) system designed to analyze and summarize complex medical reports, making it easier to extract critical health insights quickly and accurately.

## 🚀 Features
- **Context-Aware Summarization:** Employs a robust RAG pipeline to generate precise summaries grounded directly in the provided medical documents.
- **FastAPI Backend:** High-performance, asynchronous REST API for handling document ingestion, processing, and querying.
- **Vector Retrieval:** Integrates Qdrant as the vector database for efficient semantic search and embedding storage.
- **LLM Orchestration:** Built with LangChain to seamlessly connect language models with the medical report data.
- **Interactive Client:** A TypeScript and Node.js based frontend for easily uploading reports and viewing the generated summaries.

## 🛠️ Tech Stack
- **Backend:** Python, FastAPI, LangChain, Qdrant
- **Frontend:** TypeScript, Node.js
- **Infrastructure:** Docker, Docker Compose

## 📁 Repository Structure
```text
.
├── backend/            # FastAPI server, LangChain pipelines, and Qdrant integration
├── client/             # TypeScript frontend application
├── Dockerfile          # Container configuration
├── docker-compose.yml  # Multi-container orchestration
└── Readme.md           # Project documentation
```