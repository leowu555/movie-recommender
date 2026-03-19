from django.urls import path
from .views import search_movies

urlpatterns = [
    path('search/', search_movies),
]