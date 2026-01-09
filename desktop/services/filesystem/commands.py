import os
from .permissions import (
    can_read,
    can_write,
    can_execute,
    get_permissions,
    load_permissions,
    save_permissions
)

BASE_DIR = os.path.abspath("aryaos_storage")


def safe_path(path):
    full = os.path.normpath(os.path.join(BASE_DIR, path.lstrip("/")))
    if not full.startswith(BASE_DIR):
        raise ValueError("Invalid path")
    return full


def execute_command(cwd, command):
    command = command.strip()
    if not command:
        return {"output": ""}

    parts = command.split()
    cmd = parts[0]
    args = parts[1:]

    current_path = safe_path(cwd)

    # ---------------- pwd ----------------
    if cmd == "pwd":
        return {"output": cwd}

    # ---------------- ls / ls -l ----------------
    if cmd == "ls":
        if not can_read(cwd):
            return {"error": "Permission denied"}

        detailed = len(args) == 1 and args[0] == "-l"
        items = os.listdir(current_path)

        if not detailed:
            return {"output": "  ".join(items)}

        lines = []
        for item in items:
            item_path = os.path.join(cwd, item)
            perm = get_permissions(item_path)
            prefix = "d" if os.path.isdir(safe_path(item_path)) else "-"
            lines.append(f"{prefix}{perm} {item}")

        return {"output": "\n".join(lines)}

    # ---------------- cd ----------------
    if cmd == "cd":
        target = args[0] if args else "/"
        new_path = safe_path(os.path.join(cwd, target))

        if not os.path.isdir(new_path):
            return {"error": "Not a directory"}

        if not can_execute(os.path.join(cwd, target)):
            return {"error": "Permission denied"}

        new_cwd = os.path.normpath(os.path.join(cwd, target))
        if not new_cwd.startswith("/"):
            new_cwd = "/" + new_cwd

        return {"cwd": new_cwd}

    # ---------------- cat ----------------
    if cmd == "cat":
        if not args:
            return {"error": "Missing file name"}

        file = args[0]
        file_path = os.path.join(cwd, file)

        if not can_read(file_path):
            return {"error": "Permission denied"}

        abs_path = safe_path(file_path)
        if not os.path.isfile(abs_path):
            return {"error": "File not found"}

        with open(abs_path, "r") as f:
            return {"output": f.read()}

    # ---------------- mkdir ----------------
    if cmd == "mkdir":
        if not args:
            return {"error": "Missing directory name"}

        if not can_write(cwd):
            return {"error": "Permission denied"}

        path = safe_path(os.path.join(cwd, args[0]))
        os.makedirs(path, exist_ok=True)

        perms = load_permissions()
        perms[os.path.join(cwd, args[0])] = "755"
        save_permissions(perms)

        return {"output": ""}

    # ---------------- touch ----------------
    if cmd == "touch":
        if not args:
            return {"error": "Missing file name"}

        if not can_write(cwd):
            return {"error": "Permission denied"}

        path = safe_path(os.path.join(cwd, args[0]))
        open(path, "a").close()

        perms = load_permissions()
        perms[os.path.join(cwd, args[0])] = "644"
        save_permissions(perms)

        return {"output": ""}

    # ---------------- rm ----------------
    if cmd == "rm":
        if not args:
            return {"error": "Missing file name"}

        file_path = os.path.join(cwd, args[0])

        if not can_write(file_path):
            return {"error": "Permission denied"}

        abs_path = safe_path(file_path)
        if not os.path.isfile(abs_path):
            return {"error": "File not found"}

        os.remove(abs_path)

        perms = load_permissions()
        perms.pop(file_path, None)
        save_permissions(perms)

        return {"output": ""}

    # ---------------- rmdir ----------------
    if cmd == "rmdir":
        if not args:
            return {"error": "Missing directory name"}

        dir_path = os.path.join(cwd, args[0])

        if not can_write(dir_path):
            return {"error": "Permission denied"}

        abs_path = safe_path(dir_path)
        if not os.path.isdir(abs_path):
            return {"error": "Not a directory"}

        os.rmdir(abs_path)

        perms = load_permissions()
        perms.pop(dir_path, None)
        save_permissions(perms)

        return {"output": ""}

    # ---------------- chmod ----------------
    if cmd == "chmod":
        if len(args) != 2:
            return {"error": "Usage: chmod MODE PATH"}

        mode, target = args
        if not mode.isdigit() or len(mode) != 3:
            return {"error": "Invalid mode"}

        target_path = os.path.join(cwd, target)

        perms = load_permissions()
        perms[target_path] = mode
        save_permissions(perms)

        return {"output": ""}

    # ---------------- unknown ----------------
    return {"error": "Command not found"}
