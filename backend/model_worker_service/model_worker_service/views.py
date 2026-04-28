import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from utils.modelHelper import predict_video

@csrf_exempt
@require_http_methods(["POST"])
def predict(request):
    try:
        video_file = request.FILES.get("video")

        if not video_file:
            return JsonResponse({"error": "video file is required"}, status=400)

        # Save to a temp file so predict_video can access it by path
        import tempfile, os
        suffix = os.path.splitext(video_file.name)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in video_file.chunks():
                tmp.write(chunk)
            video_path = tmp.name

        result = predict_video(video_path,isTestVedio=True)

        return JsonResponse(result, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)