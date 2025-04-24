from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Your other URLs...
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('member-registration/', include('member_registration.urls')),
    path('api/members/', include('member.urls')),
    path('api/header/', include('header_app.urls')),
    path('api/accounts/', include('account.urls')),
    path('api/loans/', include('loan.urls')),
    path('api/deposits/', include('deposit.urls')),
    path('api/withdraws/', include('withdraw.urls')),
    path('api/balance/', include('balance.urls')),
    path('api/reports/', include('report.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
 