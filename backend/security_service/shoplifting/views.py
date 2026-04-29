from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Shoplifting
from .serializers import ShopliftingSerializer
from security_service.permissions import IsGuard


class ShopliftingViewSet(viewsets.ModelViewSet):
    queryset = Shoplifting.objects.all()
    serializer_class = ShopliftingSerializer
    permission_classes = [IsGuard]

    @action(detail=False, methods=['get'])
    def unviewed(self, request):
        data = Shoplifting.objects.filter(viewed=False).order_by('-id')
        serializer = self.get_serializer(data, many=True)

        return Response({
            "count": data.count(),
            "results": serializer.data
        })