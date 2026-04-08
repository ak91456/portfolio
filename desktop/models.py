from django.db import models


class AboutContent(models.Model):
    text = models.TextField(default="")

    class Meta:
        verbose_name_plural = "About Content"

    def __str__(self):
        return "About Content"


class Project(models.Model):
    name = models.CharField(max_length=200)
    github_url = models.URLField()
    description = models.TextField(blank=True, default="")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name
