from django.db.models import Q

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import Report
from .serializers import ReportSerializer
from .permissions import IsOwnerAndDraftOrReadOnly


class ReportViewSet(viewsets.ModelViewSet):

    serializer_class = ReportSerializer

    # ======================================
    # QUERYSET
    # ======================================
    def get_queryset(self):

        user = self.request.user

        # ADMIN -> lihat semua laporan
        if user.is_admin:
            return Report.objects.all().order_by('-created_at')

        # CITIZEN
        # lihat semua non-draft
        # + draft milik sendiri
        return Report.objects.filter(

            Q(status__in=[
                'REPORTED',
                'VERIFIED',
                'IN_PROGRESS',
                'RESOLVED'
            ])

            |

            Q(
                status='DRAFT',
                reporter=user
            )

        ).order_by('-created_at')

    # ======================================
    # PERMISSION
    # ======================================
    def get_permissions(self):

        permission_classes = [permissions.IsAuthenticated]

        # citizen dicek ownership
        if (
            self.action in ['update', 'partial_update', 'destroy']
            and not self.request.user.is_admin
        ):
            permission_classes.append(
                IsOwnerAndDraftOrReadOnly
            )

        return [permission() for permission in permission_classes]

    # ======================================
    # CREATE
    # ======================================
    def perform_create(self, serializer):

        serializer.save(
            reporter=self.request.user
        )

    # ======================================
    # DELETE
    # ======================================
    def destroy(self, request, *args, **kwargs):

        report = self.get_object()

        # ADMIN boleh hapus semua
        if request.user.is_admin:
            return super().destroy(request, *args, **kwargs)

        # CITIZEN hanya boleh hapus miliknya sendiri
        if report.reporter == request.user:
            return super().destroy(request, *args, **kwargs)

        return Response(
            {
                "detail": "Tidak diizinkan menghapus laporan ini."
            },
            status=status.HTTP_403_FORBIDDEN
        )