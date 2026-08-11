from django.urls import path

from .views import rating_detail, ratings_list_create

urlpatterns = [
    path('', ratings_list_create),
    path('<int:movie_id>/', rating_detail),
]
