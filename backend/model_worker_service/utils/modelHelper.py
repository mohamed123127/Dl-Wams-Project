import cv2
import torch
import torch.nn as nn
import numpy as np
import os
from utils.videoHelper import extract_clip
from services.shoplifting_service import sendShopliftingWarning
from pathlib import Path

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
BASE_DIR = Path(__file__).resolve().parent  # file directory
model_path = BASE_DIR / "../resources/models/train3_2.pth"

class SimpleI3D(nn.Module):
    def __init__(self):
        super(SimpleI3D, self).__init__()

        self.conv1 = nn.Conv3d(1, 32, 3, padding=1)
        self.pool1 = nn.MaxPool3d(2)

        self.conv2 = nn.Conv3d(32, 64, 3, padding=1)
        self.pool2 = nn.MaxPool3d(2)

        self.conv3 = nn.Conv3d(64, 128, 3, padding=1)
        self.pool3 = nn.MaxPool3d(2)

        self.conv4 = nn.Conv3d(128, 256, 3, padding=1)
        self.pool4 = nn.AdaptiveAvgPool3d((1, 1, 1))

        self.fc = nn.Linear(256, 2)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = self.pool1(x)

        x = torch.relu(self.conv2(x))
        x = self.pool2(x)

        x = torch.relu(self.conv3(x))
        x = self.pool3(x)

        x = torch.relu(self.conv4(x))
        x = self.pool4(x)

        x = x.view(x.size(0), -1)
        return self.fc(x)


model = SimpleI3D().to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()



def predict_video(video_path, chunk_seconds=2, threshold=70,isTestVedio=False):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)

    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)

    cap.release()

    chunk_size = int(fps * chunk_seconds)

    results = []
    shoplifting_scores = []

    alert_sent = False 

    for start in range(0, len(frames), chunk_size):
        end = min(start + chunk_size, len(frames))

        # extract part of clip to predict
        clip = extract_clip(frames, start, end)

        if clip is None:
            continue

        clip = clip.to(device)

        with torch.no_grad():
            output = model(clip)
            prob = torch.softmax(output, dim=1)

            shoplifting_prob = prob[0, 1].item() * 100

        start_sec = start / fps
        end_sec = end / fps

        print("===================================")
        print(f"Time: {start_sec:.2f}s → {end_sec:.2f}s")
        print(f"Shoplifting risk: {shoplifting_prob:.2f}%")
        print("===================================")

        results.append((start_sec, end_sec, shoplifting_prob))
        shoplifting_scores.append((shoplifting_prob, start_sec, end_sec))

        # save the shoplifting in security service
        if shoplifting_prob >= threshold and not alert_sent and not isTestVedio:
            print("🚨 Shoplifting detected! Sending warning...")
            sendShopliftingWarning(video_path)
            alert_sent = True  

        if shoplifting_scores:
            max_score, max_start, max_end = max(shoplifting_scores, key=lambda x: x[0])
        else:
            max_score, max_start, max_end = 0, None, None

        finalResults = { 
            "isShoplifting": max_score >= threshold,
            "confidence": round(max_score, 2)
        }
    return finalResults
