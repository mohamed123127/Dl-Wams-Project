from django.db import models

class Shoplifting(models.Model):
    location = models.CharField(max_length=255)
    camera = models.CharField(max_length=100)
    video_path = models.FileField(upload_to='media/shoplifting_videos/')
    viewed = models.BooleanField(default=False)
    
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.location} - {self.camera}"