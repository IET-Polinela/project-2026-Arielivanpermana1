from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),
    path('accounts/', include('usermanagement_24782038.urls')),
    path('dashboard/', include('dashboard_24782038.urls')),

    path('api/', include('main_app.api_urls')),
]