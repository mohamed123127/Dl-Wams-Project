import threading

class ThreadManager:
    def __init__(self):
        self.threads = []
        self.stop_event = threading.Event()

    def start(self, target):
        t = threading.Thread(target=target, daemon=True)
        self.threads.append(t)
        t.start()
        return t

    def stop_all(self):
        print("🧹 Stopping all threads...")
        self.stop_event.set()

        for t in self.threads:
            if t.is_alive():
                t.join(timeout=2)

        self.threads.clear()
        print("✅ All threads cleaned")
