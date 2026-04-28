from rest_framework import serializers
from .models import Shoplifting

class ShopliftingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shoplifting
        fields = '__all__'
