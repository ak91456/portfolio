import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import AboutContent, Project
from .services.filesystem.commands import execute_command
from .services.filesystem.tree import build_tree


# ── Desktop UI ────────────────────────────────────────────────────────────────

def desktop(request):
    return render(request, "desktop/index.html")


# ── About API ─────────────────────────────────────────────────────────────────

def about_content(request):
    obj = AboutContent.objects.first()
    text = obj.text if obj else ""
    return JsonResponse({"text": text}, json_dumps_params={"ensure_ascii": False})


# ── Projects API ──────────────────────────────────────────────────────────────

def projects_list(request):
    projects = list(
        Project.objects.values("name", "github_url", "description")
    )
    return JsonResponse({"projects": projects}, json_dumps_params={"ensure_ascii": False})


# ── File Tree API ─────────────────────────────────────────────────────────────

def file_tree(request):
    path = request.GET.get("path", "")
    tree = build_tree(path)

    if tree is None:
        return JsonResponse({"error": "invalid path"}, status=404)

    return JsonResponse(tree, safe=False)


# ── Terminal API ──────────────────────────────────────────────────────────────

@csrf_exempt
def terminal_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "invalid request method"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid JSON"}, status=400)

    command = data.get("command", "").strip()
    cwd = data.get("cwd", "/")

    if not command:
        return JsonResponse({"cwd": cwd})

    result = execute_command(cwd, command)
    return JsonResponse(result)
