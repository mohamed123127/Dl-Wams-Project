from datetime import datetime
import cv2
import os
import numpy as np
import torch

clip_counter = 1 

SAVE_FOLDER = "../clips"
os.makedirs(SAVE_FOLDER, exist_ok=True)

def extract_clip(frames, start, end, size=(112, 112), num_frames=16):
    segment = frames[start:end]

    processed = []
    for f in segment:
        f = cv2.resize(f, size)
        f = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        processed.append(f)

    if len(processed) == 0:
        return None

    # fix length
    while len(processed) < num_frames:
        processed.append(processed[-1])

    processed = processed[:num_frames]

    clip = np.stack(processed) / 255.0
    clip = torch.tensor(clip, dtype=torch.float32)

    # (1, 1, T, H, W)
    clip = clip.unsqueeze(0).unsqueeze(0)

    return clip


def save_clip(frames, fps=20):
    global clip_counter

    if not frames:
        return None

    h, w, _ = frames[0].shape

    # get datetime
    now = datetime.now()
    timestamp = now.strftime("%d-%m-%Y_%H-%M")  

    # filename
    filename = f"{SAVE_FOLDER}/{clip_counter}_{timestamp}.mp4"

    clip_counter += 1  

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filename, fourcc, fps, (w, h))

    for f in frames:
        out.write(f)

    out.release()
    return filename
