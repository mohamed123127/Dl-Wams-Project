from utils.modelHelper import predict_video 
from utils.threadManager import ThreadManager
from utils.videoHelper import save_clip
import cv2
import time
import queue


# CONFIG
STREAM_URL = "http://192.168.100.106:4747/video"
CLIP_DURATION = 5

# General variables
manager = ThreadManager()
stop_event = manager.stop_event
clip_queue = queue.Queue()
# prediction_queue = queue.Queue()
latest_prediction = None



# STREAM WORKER
def stream_worker():
    global latest_prediction

    while not stop_event.is_set():
        print("🔌 Connecting to stream...")

        cap = cv2.VideoCapture(STREAM_URL)

        if not cap.isOpened():
            print("❌ Failed to connect. Retrying...")
            time.sleep(3)
            continue

        print("✅ Stream connected")

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps == 0:
            fps = 20

        buffer = []
        start_time = time.time()

        while not stop_event.is_set():
            ret, frame = cap.read()

            if not ret:
                print("⚠️ Stream lost...")
                break

            # write the result on the frame
            if latest_prediction:
                text = f"{latest_prediction['label']} ({latest_prediction['score']:.2f}%)"
                color = (0, 0, 255) if latest_prediction['score'] > 50 else (0, 255, 0)

                cv2.putText(frame, text, (20, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

            cv2.imshow("LIVE STREAM", frame)

            buffer.append(frame)

            # save the clip
            if time.time() - start_time >= CLIP_DURATION:
                clip_path = save_clip(buffer, fps)

                if clip_path:
                    clip_queue.put(clip_path)
                    print(f"💾 Clip saved: {clip_path}")

                buffer = []
                start_time = time.time()

            if cv2.waitKey(1) & 0xFF == ord('q'):
                stop_event.set()
                break

        cap.release()

    cv2.destroyAllWindows()


# MODEL WORKER
def model_worker():
    global latest_prediction

    while not stop_event.is_set():
        try:
            video_path = clip_queue.get(timeout=1)

            print(f"🧠 Running model on: {video_path}")

            results, scores = predict_video(video_path)

            if scores:
                best_score, start, end = max(scores, key=lambda x: x[0])

                latest_prediction = {
                    "label": "SHOPLIFTING" if best_score > 50 else "NORMAL",
                    "score": best_score,
                    "video": video_path
                }
                print("🔥 FINAL RESULT:", latest_prediction)

                # prediction_queue.put(latest_prediction)

        except:
            pass
        

# MAIN
def run():

    print("🚀 Starting AI Surveillance System...")

    manager = ThreadManager()
    stop_event = manager.stop_event

    manager.start(stream_worker)
    manager.start(model_worker)

    try:
        while not stop_event.is_set():
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Stopping...")
        manager.stop_all()

    print("✅ Shutdown complete")

