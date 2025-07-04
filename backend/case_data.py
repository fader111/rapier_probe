import sys
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import glob
from subprocess import run, PIPE
import sys
# from server.inference.model_inference import get_pediction, get_predicted_transforms
from fastapi import Body

# sys.path.append(os.path.join(os.path.dirname(__file__), 'Cython'))
# import torch
from typing import List, Dict, Any
# from server.inference.models import ArchFormRegressor, InitAutoencoder
from autosetup_ml.utils import *
from ormco import JawType

def get_tooth_relative_transform(tooth, stage):
    try:
        rel_transform = tooth.relativeTransform(stage)
        if rel_transform is None:
            print(f"[ERROR] Null pointer: relativeTransform({stage}) is None for tooth {getattr(tooth, 'cl_id', 'unknown')}")
            return None
        translation = rel_transform.translation
        rotation = rel_transform.rotation
        return {
            "translation": {
                "x": translation.x, "y": translation.y, "z": translation.z},
            "rotation": {
                "x": rotation.im.x, "y": rotation.im.y, "z": rotation.im.z,
                "w": rotation.re}
        }
    except Exception as e:
        print(f"[ERROR] Exception in getToothRelativeTransform for tooth {getattr(tooth, 'cl_id', 'unknown')}: {e}")
        return None
    
def get_stage_relative_transforms(base_ortho_case, stage=0):
    stage_data = {}
    tp = base_ortho_case.get_treatment_plan()
    
    for jawType in JawType:
        jaw = tp.GetJaw(jawType)
        for tooth in jaw.getTeeth():
            tooth_id = tooth.getClinicalID()
            tooth_rt = get_tooth_relative_transform(tooth, stage)
            stage_data[tooth_id] = tooth_rt
    
    return stage_data
