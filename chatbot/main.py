import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_neo4j import Neo4jGraph
from langchain_groq import ChatGroq
from langchain_neo4j import GraphCypherQAChain

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")
GROQ_API_KEY = os.getenv("GROQ_KEY")

# ---------------------------------------------------------------------------
# Lazy-initialised singletons (created once on first request)
# ---------------------------------------------------------------------------
_graph: Neo4jGraph | None = None
_chain: GraphCypherQAChain | None = None


def get_chain() -> GraphCypherQAChain:
    """Return the QA chain, initialising it on first call."""
    global _graph, _chain
    if _chain is None:
        logger.info("Initialising Neo4j connection and LangChain QA chain…")
        _graph = Neo4jGraph(
            url=NEO4J_URI,
            username=NEO4J_USERNAME,
            password=NEO4J_PASSWORD,
            database=NEO4J_DATABASE,
        )
        llm = ChatGroq(
            model="llama3-70b-8192",
            api_key=GROQ_API_KEY,
            temperature=0,
        )
        _chain = GraphCypherQAChain.from_llm(
            llm=llm,
            graph=_graph,
            verbose=True,
            allow_dangerous_requests=True,
        )
        logger.info("✓ QA chain ready")
    return _chain


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly warm up the chain so the first request isn't slow
    try:
        get_chain()
    except Exception as e:
        logger.warning(f"Could not pre-warm chain at startup: {e}")
    yield


app = FastAPI(
    title="Family Tree Chatbot API",
    description="AI-powered family tree query service using LangChain + Groq",
    version="2.0.0",
    lifespan=lifespan,
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Answer a natural-language question about the family tree via Neo4j Cypher."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    logger.info("Processing: %s", request.message[:80])
    try:
        result = get_chain().invoke({"query": request.message})
        reply = result.get("result", "")
        logger.info("✓ Response generated")
        return ChatResponse(reply=reply)
    except Exception as e:
        logger.error("Chain error: %s", e)
        raise HTTPException(status_code=500, detail="Failed to process chat message")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
