from django.urls import reverse_lazy
from django.views.generic import (
    TemplateView,
    ListView,
    DetailView,
    CreateView,
    UpdateView,
    DeleteView
)

from django.views import View
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q
from django.contrib.auth.mixins import LoginRequiredMixin

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .models import Report
from .serializers import ReportSerializer


# ==========================================
# REPORT ACCESS RULES
# ==========================================

def visible_reports_for(user):

    queryset = Report.objects.all()

    if user.is_admin:

        return queryset.exclude(
            status='DRAFT'
        )

    return queryset.filter(

        Q(
            status='DRAFT',
            reporter=user
        )

        |

        (
            ~Q(status='DRAFT')

            &

            (
                Q(reporter__is_admin=True)

                |

                Q(reporter__isnull=True)
            )
        )
    )


# ==========================================
# ADMIN MIXIN
# ==========================================

class AdminRequiredMixin:

    def dispatch(self, request, *args, **kwargs):

        if not request.user.is_authenticated:

            messages.error(
                request,
                "Silakan login terlebih dahulu."
            )

            return redirect('login')

        if not request.user.is_admin:

            messages.error(
                request,
                "Akses Ditolak. Hanya admin yang dapat mengakses fitur ini."
            )

            return redirect('report_list')

        return super().dispatch(request, *args, **kwargs)


# ==========================================
# LANDING PAGE
# ==========================================

class LandingPageView(TemplateView):

    template_name = 'main_app/landing.html'


# ==========================================
# REPORT LIST
# ==========================================

class ReportListView(LoginRequiredMixin, ListView):

    model = Report

    template_name = 'main_app/home.html'

    context_object_name = 'reports'

    ordering = ['-created_at']

    login_url = 'login'

    def get_queryset(self):

        return visible_reports_for(
            self.request.user
        ).order_by('-created_at')


# ==========================================
# DETAIL REPORT
# ==========================================

class ReportDetailView(LoginRequiredMixin, DetailView):

    model = Report

    template_name = 'main_app/detail_report.html'

    context_object_name = 'report'

    login_url = 'login'

    def get_queryset(self):

        return visible_reports_for(
            self.request.user
        )


# ==========================================
# CREATE REPORT
# ==========================================

class ReportCreateView(LoginRequiredMixin, CreateView):

    model = Report

    fields = [
        'title',
        'category',
        'description',
        'location'
    ]

    template_name = 'main_app/add_report.html'

    success_url = reverse_lazy('report_list')

    login_url = 'login'

    def dispatch(self, request, *args, **kwargs):

        if request.user.is_admin:

            messages.error(
                request,
                "Admin tidak boleh membuat laporan."
            )

            return redirect('report_list')

        return super().dispatch(
            request,
            *args,
            **kwargs
        )

    def form_valid(self, form):

        form.instance.reporter = self.request.user

        form.instance.status = 'DRAFT'

        messages.success(
            self.request,
            "Laporan berhasil ditambahkan."
        )

        return super().form_valid(form)


# ==========================================
# UPDATE REPORT
# ==========================================

class ReportUpdateView(LoginRequiredMixin, UpdateView):

    model = Report

    fields = [
        'title',
        'category',
        'description',
        'location'
    ]

    template_name = 'main_app/edit_report.html'

    success_url = reverse_lazy('report_list')

    login_url = 'login'

    def get_queryset(self):

        return Report.objects.filter(
            reporter=self.request.user,
            status='DRAFT'
        )

    def dispatch(self, request, *args, **kwargs):

        report = self.get_object()

        if (
            report.reporter != request.user

            or

            report.status != 'DRAFT'
        ):

            messages.error(
                request,
                "Hanya laporan draft milik sendiri yang bisa diedit."
            )

            return redirect('report_list')

        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):

        messages.success(
            self.request,
            "Laporan berhasil diperbarui."
        )

        return super().form_valid(form)


# ==========================================
# DELETE REPORT
# ==========================================

class ReportDeleteView(LoginRequiredMixin, DeleteView):

    model = Report

    template_name = 'main_app/delete_report.html'

    success_url = reverse_lazy('report_list')

    login_url = 'login'

    def get_queryset(self):

        return Report.objects.filter(
            reporter=self.request.user,
            status='DRAFT'
        )

    def dispatch(self, request, *args, **kwargs):

        report = self.get_object()

        if (
            report.reporter != request.user

            or

            report.status != 'DRAFT'
        ):

            messages.error(
                request,
                "Hanya laporan draft milik sendiri yang bisa dihapus."
            )

            return redirect('report_list')

        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):

        messages.success(
            self.request,
            "Laporan berhasil dihapus."
        )

        return super().form_valid(form)


# ==========================================
# UPDATE STATUS
# ==========================================

class ReportUpdateStatusView(AdminRequiredMixin, View):

    def post(self, request, pk):

        report = get_object_or_404(
            Report.objects.exclude(
                status='DRAFT'
            ),
            pk=pk
        )

        new_status = request.POST.get('status')

        if (
            report.status == 'REPORTED' and
            new_status == 'VERIFIED'
        ):

            report.status = 'VERIFIED'

        elif (
            report.status == 'VERIFIED' and
            new_status == 'IN_PROGRESS'
        ):

            report.status = 'IN_PROGRESS'

        elif (
            report.status == 'IN_PROGRESS' and
            new_status == 'RESOLVED'
        ):

            report.status = 'RESOLVED'

        report.save()

        return redirect('report_list')


# ==========================================
# LIVE SEARCH AJAX
# ==========================================

def live_search_reports(request):

    keyword = request.GET.get('q', '')

    reports = visible_reports_for(request.user).filter(

        Q(title__icontains=keyword) |
        Q(category__icontains=keyword) |
        Q(location__icontains=keyword) |
        Q(status__icontains=keyword)

    ).order_by('-created_at')

    data = []

    for report in reports:

        data.append({
            'id': report.id,
            'title': report.title,
            'category': report.category,
            'location': report.location,
            'status': report.status,
        })

    return JsonResponse({
        'reports': data
    })


# ==========================================
# DETAIL REPORT AJAX
# ==========================================

def report_detail_json(request, pk):

    report = get_object_or_404(
        visible_reports_for(request.user),
        pk=pk
    )

    return JsonResponse({

        'id': report.id,

        'title': report.title,

        'category': report.category,

        'description': report.description,

        'location': report.location,

        'status': report.status,

        'created_at': report.created_at.strftime(
            '%d %B %Y %H:%M'
        ),

    })


# ==========================================
# API PAGINATION
# ==========================================

class ReportPagination(PageNumberPagination):

    page_size = 10

    page_size_query_param = 'page_size'

    max_page_size = 100


# ==========================================
# REPORT API VIEWSET
# ==========================================

class ReportViewSet(viewsets.ModelViewSet):

    serializer_class = ReportSerializer

    permission_classes = [IsAuthenticated]

    pagination_class = ReportPagination

    def get_queryset(self):

        user = self.request.user

        queryset = Report.objects.all().order_by(
            '-updated_at'
        )

        tab = self.request.query_params.get(
            'tab',
            None
        )

        if tab == 'my_reports':

            queryset = queryset.filter(
                reporter=user
            )

        elif tab == 'feed':

            queryset = queryset.filter(
                ~Q(reporter=user) &
                ~Q(status='DRAFT')
            )

        else:

            queryset = queryset.filter(
                ~Q(status='DRAFT') |
                Q(
                    status='DRAFT',
                    reporter=user
                )
            )

        return queryset

    def perform_create(self, serializer):

        serializer.save(
            reporter=self.request.user
        )
