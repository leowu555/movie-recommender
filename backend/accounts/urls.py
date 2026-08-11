from django.urls import path

from .views import login, logout, me, register

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('logout/', logout),
    path('me/', me),
]
