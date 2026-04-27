from django.db import models

class Camera(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=2500)
    rtsp_url = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name