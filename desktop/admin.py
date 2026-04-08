from django.contrib import admin

from .models import AboutContent, Project


@admin.register(AboutContent)
class AboutContentAdmin(admin.ModelAdmin):
    pass


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "github_url", "order"]
    list_editable = ["order"]
