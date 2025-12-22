import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.graph_stores.neo4j import Neo4jGraphStore
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.llms.groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Neo4j connection details from environment variables
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE")

# Groq API key
GROQ_API_KEY = os.getenv("GROQ_KEY")

# Initialize Neo4j graph store
graph_store = Neo4jGraphStore(
    username=NEO4J_USERNAME,
    password=NEO4J_PASSWORD,
    url=NEO4J_URI,
    database=NEO4J_DATABASE,
)

# Initialize Groq LLM
llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)

# Create a query engine tool for Neo4j
from llama_index.core.query_engine import KnowledgeGraphQueryEngine

neo4j_query_engine = KnowledgeGraphQueryEngine(
    storage_context=StorageContext.from_defaults(graph_store=graph_store),
    llm=llm,
    verbose=True,
)

neo4j_tool = QueryEngineTool(
    query_engine=neo4j_query_engine,
    metadata=ToolMetadata(
        name="neo4j_query_engine",
        description="""
        This tool is connected to a Neo4j graph database containing family tree information.
        It can be used to answer questions about people, relationships, and family structures.
        Cypher queries can be used to retrieve information from the database.
        Example queries:
        "Who are the children of person X?"
        "What is the relationship between person A and person B?"
        "List all members of the 'Stark' family."
        """
    ),
)


# Create a ReAct agent
agent = ReActAgent.from_tools([neo4j_tool], llm=llm, verbose=True)


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    response = agent.chat(request.message)
    return ChatResponse(reply=str(response))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
