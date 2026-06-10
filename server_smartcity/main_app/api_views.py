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

        public_filter = (

            ~Q(status='DRAFT')

            &

            (
                Q(reporter__is_admin=True)

                |

                Q(reporter__isnull=True)
            )
        )

        public_queryset = queryset.filter(
            public_filter
        )

        if user.is_admin:

            return queryset.exclude(
                status='DRAFT'
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

            return public_queryset.exclude(
                reporter=user
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

            public_filter

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

    def create(

        self,

        request,

        *args,

        **kwargs

    ):

        if request.user.is_admin:

            return Response(

                {
                    "detail":
                    "Admin tidak boleh membuat laporan."
                },

                status=status.HTTP_403_FORBIDDEN
            )

        return super().create(

            request,

            *args,

            **kwargs
        )

    def perform_create(

        self,

        serializer

    ):

        serializer.save(
            reporter=self.request.user
        )

    # ======================================
    # UPDATE
    # ======================================

    def update(

        self,

        request,

        *args,

        **kwargs

    ):

        if request.user.is_admin:

            kwargs['partial'] = True

        return super().update(

            request,

            *args,

            **kwargs
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

        if request.user.is_admin:

            return Response(

                {
                    "detail":
                    "Admin hanya boleh mengubah status laporan."
                },

                status=status.HTTP_403_FORBIDDEN
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
