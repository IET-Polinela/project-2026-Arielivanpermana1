from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    LandingPageView,
    ReportListView,
    ReportDetailView,
    ReportCreateView,
    ReportUpdateView,
    ReportDeleteView,
    ReportUpdateStatusView,
    live_search_reports,
    report_detail_json,
    ReportViewSet
)

router = DefaultRouter()

router.register(
    r'api/report',
    ReportViewSet,
    basename='api-report'
)

urlpatterns = [

    path('', LandingPageView.as_view(), name='landing'),

    path(
        'reports/',
        ReportListView.as_view(),
        name='report_list'
    ),

    path(
        'add/',
        ReportCreateView.as_view(),
        name='add_report'
    ),

    path(
        'detail/<int:pk>/',
        ReportDetailView.as_view(),
        name='detail_report'
    ),

    path(
        'edit/<int:pk>/',
        ReportUpdateView.as_view(),
        name='edit_report'
    ),

    path(
        'delete/<int:pk>/',
        ReportDeleteView.as_view(),
        name='delete_report'
    ),

    path(
        'update-status/<int:pk>/',
        ReportUpdateStatusView.as_view(),
        name='update_status'
    ),

    path(
        'ajax/live-search/',
        live_search_reports,
        name='live_search_reports'
    ),

    path(
        'ajax/report-detail/<int:pk>/',
        report_detail_json,
        name='report_detail_json'
    ),
]

urlpatterns += router.urls