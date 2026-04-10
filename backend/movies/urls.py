from django.urls import path
from .views import search_movies, get_movie_details

urlpatterns = [
    path('search', search_movies),
    path('search/', search_movies),
    path('<int:movie_id>/', get_movie_details),
]