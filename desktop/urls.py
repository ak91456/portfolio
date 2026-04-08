from django.urls import path

from . import views

urlpatterns = [
    path("", views.desktop, name="desktop"),
    path("fs/tree/", views.file_tree, name="file_tree"),
    path("api/terminal/", views.terminal_api, name="terminal_api"),
    path("api/about/", views.about_content, name="about_content"),
    path("api/projects/", views.projects_list, name="projects_list"),
]
