from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.case_data import get_stage_relative_transforms, OrthoCase
from typing import List, Dict, Any

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ortho_case_cache = {
    "file_path": None,
    "ortho_case": None
}

def get_cached_ortho_case(file_path="backend/oas/00000000.oas"):
    if ortho_case_cache["ortho_case"] is None or ortho_case_cache["file_path"] is None:
        ortho_case_cache["file_path"] = file_path
        ortho_case_cache["ortho_case"] = OrthoCase(file_path)
    return ortho_case_cache["ortho_case"]

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.get("/get_stage_relative_transform/")
def get_stage_relative_transforms_endpoint():
    ortho_case = get_cached_ortho_case()
    ans = get_stage_relative_transforms(ortho_case, stage=0)
    return ans

@app.get("/get_ortho_case_file_path/")
def get_ortho_case_file_path():
    get_cached_ortho_case()
    return {"file_path": ortho_case_cache["file_path"]}

