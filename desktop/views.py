from django.http import JsonResponse
from django.shortcuts import render
from .services.filesystem.tree import build_tree
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .services.filesystem.commands import execute_command
import os
from django.http import JsonResponse

# BASE_FS = os.path.abspath("aryaos_storage")

# def desktop(request):
#     return render(request, "desktop/index.html")


# def file_tree(request):
#     path = request.GET.get("path", "")
#     tree = build_tree(path)

#     if tree is None:
#         return JsonResponse({"error": "Invalid path"}, status=404)

#     return JsonResponse(tree, safe=False)

# @csrf_exempt
# def terminal_command(request):
#     if request.method != "POST":
#         return JsonResponse({"error": "Invalid request"})

#     data = json.loads(request.body)
#     cwd = data.get("cwd", "/")
#     command = data.get("command", "")

#     result = execute_command(cwd, command)
#     return JsonResponse(result)


# def resolve_path(cwd, target=None):
#     if target:
#         new_path = os.path.normpath(os.path.join(BASE_FS, cwd.lstrip("/"), target))
#     else:
#         new_path = os.path.normpath(os.path.join(BASE_FS, cwd.lstrip("/")))

#     if not new_path.startswith(BASE_FS):
#         raise PermissionError("permission denied")

#     return new_path

# import json
# import os

# from django.http import JsonResponse
# from django.shortcuts import render
# from django.views.decorators.csrf import csrf_exempt

# from .services.filesystem.tree import build_tree

# ================================
# SANDBOX BASE DIRECTORY
# ================================
BASE_FS = os.path.abspath("aryaos_storage")


# ================================
# SAFE PATH RESOLVER
# ================================
def resolve_path(cwd, target=None):
    if target:
        path = os.path.normpath(os.path.join(BASE_FS, cwd.lstrip("/"), target))
    else:
        path = os.path.normpath(os.path.join(BASE_FS, cwd.lstrip("/")))

    if not path.startswith(BASE_FS):
        raise PermissionError("permission denied")

    return path


# ================================
# DESKTOP UI
# ================================
def desktop(request):
    return render(request, "desktop/index.html")


# ================================
# FILE TREE API (FILES APP)
# ================================
def file_tree(request):
    path = request.GET.get("path", "")
    tree = build_tree(path)

    if tree is None:
        return JsonResponse({"error": "Invalid path"}, status=404)

    return JsonResponse(tree, safe=False)


# ================================
# TERMINAL API (STEP 7)
# ================================
@csrf_exempt
def terminal_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "invalid request method"})

    data = json.loads(request.body.decode("utf-8"))
    command = data.get("command", "").strip()
    cwd = data.get("cwd", "/")

    try:
        if not command:
            return JsonResponse({"cwd": cwd})

        parts = command.split()
        cmd = parts[0]

        cwd_path = resolve_path(cwd)

        # ---------- pwd ----------
        if cmd == "pwd":
            return JsonResponse({"output": cwd})

        # ---------- ls ----------
        elif cmd == "ls":
            items = os.listdir(cwd_path)
            return JsonResponse({"output": "\n".join(items)})

        # ---------- cd ----------
        elif cmd == "cd":
            if len(parts) != 2:
                return JsonResponse({"error": "cd: missing operand"})

            target = parts[1]
            new_path = resolve_path(cwd, target)

            if not os.path.isdir(new_path):
                return JsonResponse({"error": f"cd: no such directory: {target}"})

            new_cwd = "/" + os.path.relpath(new_path, BASE_FS).replace("\\", "/")
            if new_cwd == "/.":
                new_cwd = "/"

            return JsonResponse({"cwd": new_cwd})

        # ---------- cat ----------
        elif cmd == "cat":
            if len(parts) != 2:
                return JsonResponse({"error": "cat: missing file operand"})

            file_path = resolve_path(cwd, parts[1])

            if not os.path.isfile(file_path):
                return JsonResponse({"error": f"cat: {parts[1]}: no such file"})

            with open(file_path, "r", encoding="utf-8") as f:
                return JsonResponse({"output": f.read()})

        # ---------- mkdir ----------
        elif cmd == "mkdir":
            if len(parts) != 2:
                return JsonResponse({"error": "mkdir: missing operand"})

            path = resolve_path(cwd, parts[1])
            os.makedirs(path, exist_ok=False)
            return JsonResponse({"output": ""})

        # ---------- touch ----------
        elif cmd == "touch":
            if len(parts) != 2:
                return JsonResponse({"error": "touch: missing file operand"})

            path = resolve_path(cwd, parts[1])
            open(path, "a").close()
            return JsonResponse({"output": ""})

        # ---------- rm ----------
        elif cmd == "rm":
            if len(parts) != 2:
                return JsonResponse({"error": "rm: missing operand"})

            path = resolve_path(cwd, parts[1])

            if os.path.isdir(path):
                return JsonResponse({"error": "rm: is a directory"})

            os.remove(path)
            return JsonResponse({"output": ""})

        # ---------- rmdir ----------
        elif cmd == "rmdir":
            if len(parts) != 2:
                return JsonResponse({"error": "rmdir: missing operand"})

            path = resolve_path(cwd, parts[1])
            os.rmdir(path)
            return JsonResponse({"output": ""})

        # ---------- unknown ----------
        else:
            return JsonResponse({"error": f"{cmd}: command not found"})

    except PermissionError:
        return JsonResponse({"error": "permission denied"})
    except FileExistsError:
        return JsonResponse({"error": f"{parts[1]}: already exists"})
    except FileNotFoundError:
        return JsonResponse({"error": "no such file or directory"})
    except OSError as e:
        return JsonResponse({"error": str(e)})
