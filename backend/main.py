from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from backend.case_data import get_stage_relative_transforms, OrthoCase
from typing import List, Dict, Any
import numpy as np

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
    if ortho_case_cache["ortho_case"] is None or ortho_case_cache["file_path"] != file_path:
        ortho_case_cache["file_path"] = file_path
        ortho_case_cache["ortho_case"] = OrthoCase(file_path)
    return ortho_case_cache["ortho_case"]

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.post("/get_stage_relative_transform/")
def get_stage_relative_transforms_endpoint(payload: dict = Body(...)):
    file_path = payload.get("file_path", "backend/oas/00000000.oas")
    stage = payload.get("stage", 0)
    ortho_case = get_cached_ortho_case(file_path)
    ans = get_stage_relative_transforms(ortho_case, stage=stage)
    return ans

@app.get("/get_ortho_case_file_path/")
def get_ortho_case_file_path():
    get_cached_ortho_case()
    return {"file_path": ortho_case_cache["file_path"]}

def to_list_of_lists(data): # actually needs only data.tolist().
    if hasattr(data, 'tolist'):
        return data.tolist()
    elif isinstance(data, list):
        if not data:
            return []
        # If the first element is iterable (list/tuple), convert all to lists
        if hasattr(data[0], '__iter__') and not isinstance(data[0], (str, bytes)):
            return [list(item) for item in data]
        else:
            # Flat list of ints/floats
            return [list(data)]
    elif isinstance(data, (int, float)):
        return [[data]]
    else:
        return [list(data)]

def convert_expanded_mesh_to_standard(vertices, faces):
    """
    Convert expanded mesh (duplicated vertices, flat faces) to standard mesh format:
    - unique_vertices: (N, 3) array of unique vertex positions
    - new_faces: (M, 3) array of indices into unique_vertices
    """
    if vertices is None or faces is None or len(vertices) == 0 or len(faces) == 0:
        return [], []
    # Ensure numpy arrays
    vertices = np.array(vertices)
    faces = np.array(faces)
    # Find unique vertices and get inverse indices
    unique_vertices, inverse_indices = np.unique(vertices, axis=0, return_inverse=True)
    # Each face is 3 consecutive indices in the expanded mesh
    num_faces = len(faces) // 3
    new_faces = []
    for i in range(num_faces):
        idx0 = inverse_indices[i*3]
        idx1 = inverse_indices[i*3+1]
        idx2 = inverse_indices[i*3+2]
        new_faces.append([int(idx0), int(idx1), int(idx2)])
    return unique_vertices.tolist(), new_faces

@app.post("/get_tooth_mesh/")
def get_tooth_mesh(payload: dict = Body(...)):
    """
    Returns vertices and faces for crown and root for a given tooth_id and stage.
    """
    file_path = payload.get("file_path", "backend/oas/00000000.oas")
    tooth_id = payload["tooth_id"]
    # stage = payload.get("stage", 0)
    ortho_case = get_cached_ortho_case(file_path)

    crown_vertices, crown_faces = ortho_case.get_crown_vertices_faces(int(tooth_id))
    crown_vertices, crown_faces = convert_expanded_mesh_to_standard(crown_vertices, crown_faces)
    
    root_vertices, root_faces = ortho_case.get_root_vertices_faces(int(tooth_id))
    root_vertices, root_faces = convert_expanded_mesh_to_standard(root_vertices, root_faces)
    
    short_root_vertices, short_root_faces = ortho_case.get_short_root_vertices_faces(int(tooth_id))
    short_root_vertices, short_root_faces = convert_expanded_mesh_to_standard(short_root_vertices, short_root_faces)

    return {
        "crown": {"vertices": crown_vertices, "faces": crown_faces},
        "root": {"vertices": root_vertices, "faces": root_faces},
        "short_root": {"vertices": short_root_vertices, "faces": short_root_faces}    
    }

