from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/movies/', include('movies.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/ratings/', include('ratings.urls')),
    path('api/recommendations/', include('recommendations.urls')),
]