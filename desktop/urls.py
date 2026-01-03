from django.urls import path
from .views import desktop, file_tree
from django.urls import path
from . import views

urlpatterns = [
    path("", views.desktop, name="desktop"),
    path("fs/tree/", views.file_tree, name="file_tree"),
    path("api/terminal/", views.terminal_api, name="terminal_api"),
]