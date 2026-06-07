from django.db.models import Q

from rest_framework import (
    viewsets,
    permissions,
    status
)

from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Report
from .serializers import ReportSerializer
from .permissions import (
    IsOwnerAndDraftOrReadOnly
)


# ======================================
# PAGINATION
# ======================================

class ReportPagination(PageNumberPagination):

    page_size = 10

    page_size_query_param = 'page_size'

    max_page_size = 1000


# ======================================
# REPORT VIEWSET
# ======================================

class ReportViewSet(
    viewsets.ModelViewSet
):

    serializer_class = ReportSerializer

    pagination_class = ReportPagination

    # ======================================
    # QUERYSET
    # ======================================

    def get_queryset(self):

        user = self.request.user

        queryset = Report.objects.all().order_by(
            '-updated_at'
        )

        tab = self.request.query_params.get(
            'tab',
            None
        )

        # ======================================
        # MY REPORTS
        # ======================================

        if tab == 'my_reports':

            return queryset.filter(
                reporter=user
            )

        # ======================================
        # FEED KOTA
        # ======================================

        elif tab == 'feed':

            return queryset.filter(

                ~Q(reporter=user),

                ~Q(status='DRAFT')

            )

        # ======================================
        # DEFAULT
        # ======================================

        return queryset.filter(

            Q(
                status='DRAFT',
                reporter=user
            )

            |

            ~Q(status='DRAFT')

        )

    # ======================================
    # PERMISSION
    # ======================================

    def get_permissions(self):

        permission_classes = [
            permissions.IsAuthenticated
        ]

        if (

            self.action in [
                'update',
                'partial_update',
                'destroy'
            ]

            and

            not self.request.user.is_admin

        ):

            permission_classes.append(
                IsOwnerAndDraftOrReadOnly
            )

        return [

            permission()

            for permission

            in permission_classes
        ]

    # ======================================
    # SERIALIZER CONTEXT
    # ======================================

    def get_serializer_context(self):

        context = super().get_serializer_context()

        context['request'] = self.request

        return context

    # ======================================
    # CREATE
    # ======================================

    def perform_create(

        self,

        serializer

    ):

        serializer.save(
            reporter=self.request.user
        )

    # ======================================
    # DELETE
    # ======================================

    def destroy(

        self,

        request,

        *args,

        **kwargs

    ):

        report = self.get_object()

        # ======================================
        # ADMIN
        # ======================================

        if request.user.is_admin:

            return super().destroy(

                request,

                *args,

                **kwargs
            )

        # ======================================
        # CITIZEN
        # ======================================

        if (

            report.reporter == request.user

            and

            report.status == 'DRAFT'

        ):

            return super().destroy(

                request,

                *args,

                **kwargs
            )

        return Response(

            {
                "detail":
                "Hanya laporan draft milik sendiri yang bisa dihapus."
            },

            status=status.HTTP_403_FORBIDDEN
        )
