from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in prod, lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return {"message": "Its Live, Welcome to the GitHub Stats API!"}

@app.get("/repo/{owner}/{repo}")
async def repo_stats(owner: str, repo: str):
    url = f"https://api.github.com/repos/{owner}/{repo}"

    async with httpx.AsyncClient() as client:
        res = await client.get(url)

    if res.status_code != 200:
        return {"error": "Repository not found"} #it will show error if repo is not found or error 404 or invalid repo
    
    data = res.json()
    return {
        "full_name": data["full_name"],
        "description": data["description"],
        "avatar_url": data["owner"]["avatar_url"],
        "html_url": data["html_url"],
        "stars": data["stargazers_count"],
        "forks": data["forks"],
        "watchers": data["watchers_count"],
        "open_issues": data["open_issues_count"],
        "last_updated": data["updated_at"]
    }