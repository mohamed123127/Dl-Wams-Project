import requests
import os

def sendShopliftingWarning(video_path, location="Clothes area", camera="Camera 1"):
    url = "http://127.0.0.1:8004/api/shoplifting/"
    
    if not os.path.exists(video_path):
        print(f"❌ Video file not found for warning: {video_path}")
        return

    # Data to be sent along with the video file
    data = {
        "location": location,
        "camera": camera,
    }
    
    try:
        # Open the video file in binary mode
        with open(video_path, 'rb') as video_file:
            files = {
                'video_path': video_file
            }
            
            # Send the POST request
            response = requests.post(url, data=data, files=files)
            
            if response.status_code == 201:
                print("✅ Shoplifting incident successfully registered in security service.")
            else:
                print(f"❌ Failed to register shoplifting incident. Status: {response.status_code}")
                print(f"Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the security service. Please check the port?")
    except Exception as e:
        print(f"❌ An error occurred while sending shoplifting warning: {str(e)}")
