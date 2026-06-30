from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase
from django.urls import reverse
from rest_framework.test import APIRequestFactory

from dashboard_24782038.views import DashboardView
from main_app.forms import ReportForm
from main_app.models import Report
from main_app.permissions import IsOwnerAndDraftOrReadOnly, is_app_admin
from usermanagement_24782038.forms import RegisterForm
from usermanagement_24782038.serializers import RegisterSerializer


User = get_user_model()


class Lab15CoverageSupportTests(TestCase):
    def setUp(self):
        self.citizen = User.objects.create_user(
            username="coverage_citizen",
            password="CoveragePass123!",
            is_admin=False,
            is_staff=False,
        )
        self.admin = User.objects.create_user(
            username="coverage_admin",
            password="CoveragePass123!",
            is_admin=True,
            is_staff=True,
            is_superuser=True,
        )

    def test_about_and_contacts_pages_render(self):
        about_response = self.client.get(reverse("about"))
        contacts_response = self.client.get(reverse("contacts"))

        self.assertEqual(about_response.status_code, 200)
        self.assertTemplateUsed(about_response, "about/about.html")
        self.assertEqual(contacts_response.status_code, 200)
        self.assertTemplateUsed(contacts_response, "contacts/contacts.html")

    def test_report_form_validates_report_fields(self):
        form = ReportForm(
            data={
                "title": "Form Coverage Report",
                "category": "Infrastruktur",
                "description": "Jalan rusak perlu diperbaiki.",
                "location": "Polinela",
            }
        )

        self.assertTrue(form.is_valid(), form.errors)
        report = form.save(commit=False)
        report.reporter = self.citizen
        report.save()

        self.assertEqual(report.title, "Form Coverage Report")
        self.assertEqual(report.status, "DRAFT")

    def test_register_form_sets_member_role(self):
        form = RegisterForm(
            data={
                "username": "coverage_register",
                "email": "coverage@example.com",
                "password1": "CoveragePass123!",
                "password2": "CoveragePass123!",
            }
        )

        self.assertTrue(form.is_valid(), form.errors)
        user = form.save()

        self.assertFalse(user.is_admin)
        self.assertTrue(user.is_member)
        self.assertEqual(user.email, "coverage@example.com")

    def test_register_serializer_creates_user_with_hashed_password(self):
        serializer = RegisterSerializer(
            data={
                "username": "coverage_api_register",
                "email": "coverage_api@example.com",
                "password": "CoveragePass123!",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertEqual(user.username, "coverage_api_register")
        self.assertEqual(user.email, "coverage_api@example.com")
        self.assertTrue(user.check_password("CoveragePass123!"))

    def test_dashboard_view_allows_admin_and_rejects_citizen(self):
        factory = RequestFactory()

        admin_request = factory.get(reverse("dashboard"))
        admin_request.user = self.admin
        admin_view = DashboardView()
        admin_view.setup(admin_request)
        self.assertTrue(admin_view.test_func())

        citizen_request = factory.get(reverse("dashboard"))
        citizen_request.user = self.citizen
        citizen_view = DashboardView()
        citizen_view.setup(citizen_request)
        self.assertFalse(citizen_view.test_func())

    def test_dashboard_data_returns_report_summary(self):
        Report.objects.create(
            title="Reported Coverage",
            category="Jalan",
            description="Laporan masuk.",
            location="Kota",
            status="REPORTED",
            reporter=self.citizen,
        )
        Report.objects.create(
            title="Resolved Coverage",
            category="Lampu",
            description="Laporan selesai.",
            location="Kota",
            status="RESOLVED",
            reporter=self.citizen,
        )

        response = self.client.get(reverse("dashboard_data"))
        payload = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["total_reports"], 2)
        self.assertEqual(payload["reported_count"], 1)
        self.assertEqual(payload["resolved_count"], 1)
        self.assertEqual(len(payload["latest_reported"]), 1)
        self.assertEqual(len(payload["latest_resolved"]), 1)

    def test_permission_admin_status_only_rule(self):
        report = Report.objects.create(
            title="Permission Coverage",
            category="Jalan",
            description="Uji permission.",
            location="Kota",
            status="REPORTED",
            reporter=self.citizen,
        )
        permission = IsOwnerAndDraftOrReadOnly()
        factory = APIRequestFactory()

        status_only_request = factory.patch(
            "/api/report/1/",
            {"status": "VERIFIED"},
            format="json",
        )
        status_only_request.user = self.admin
        status_only_request.data = {"status": "VERIFIED"}

        content_change_request = factory.patch(
            "/api/report/1/",
            {"title": "Tidak boleh", "status": "VERIFIED"},
            format="json",
        )
        content_change_request.user = self.admin
        content_change_request.data = {
            "title": "Tidak boleh",
            "status": "VERIFIED",
        }

        self.assertTrue(is_app_admin(self.admin))
        self.assertTrue(
            permission.has_object_permission(status_only_request, None, report)
        )
        self.assertFalse(
            permission.has_object_permission(content_change_request, None, report)
        )
