import os

from .permissions import (
    can_execute,
    can_read,
    can_write,
    get_permissions,
    load_permissions,
    save_permissions,
)

from django.conf import settings

BASE_DIR = str(settings.BASE_DIR)
BASE_FS = os.path.join(BASE_DIR, "aryaos_storage")


def safe_path(path):
    full = os.path.normpath(os.path.join(BASE_FS, path.lstrip("/")))
    if not full.startswith(BASE_FS):
        raise PermissionError("permission denied")
    return full


def execute_command(cwd, command):
    command = command.strip()
    if not command:
        return {"output": ""}

    parts = command.split()
    cmd = parts[0]
    args = parts[1:]

    current_path = safe_path(cwd)

    # ── help ──────────────────────────────────────────────
    if cmd == "help":
        return {
            "output": (
                "Available commands:\n"
                "  pwd              print working directory\n"
                "  ls [-l]          list directory contents\n"
                "  cd <dir>         change directory\n"
                "  cat <file>       display file contents\n"
                "  mkdir <dir>      create directory\n"
                "  touch <file>     create empty file\n"
                "  rm <file>        remove file\n"
                "  rmdir <dir>      remove empty directory\n"
                "  chmod <mode> <path>  change permissions (e.g. chmod 755 dir)\n"
                "  echo <text>      print text\n"
                "  clear            clear terminal output"
            )
        }

    # ── echo ──────────────────────────────────────────────
    if cmd == "echo":
        return {"output": " ".join(args)}

    # ── pwd ───────────────────────────────────────────────
    if cmd == "pwd":
        return {"output": cwd}

    # ── ls / ls -l ────────────────────────────────────────
    if cmd == "ls":
        if not can_read(cwd):
            return {"error": "permission denied"}

        detailed = len(args) == 1 and args[0] == "-l"
        try:
            items = os.listdir(current_path)
        except FileNotFoundError:
            return {"error": "no such directory"}

        if not detailed:
            return {"output": "  ".join(items) if items else ""}

        lines = []
        for item in items:
            item_rel = cwd.rstrip("/") + "/" + item
            perm = get_permissions(item_rel)
            abs_item = os.path.join(current_path, item)
            prefix = "d" if os.path.isdir(abs_item) else "-"
            lines.append(f"{prefix}{perm}  {item}")
        return {"output": "\n".join(lines)}

    # ── cd ────────────────────────────────────────────────
    if cmd == "cd":
        target = args[0] if args else "/"

        if target == "/":
            return {"cwd": "/"}

        if target == "..":
            parts_cwd = cwd.rstrip("/").rsplit("/", 1)
            new_cwd = parts_cwd[0] if parts_cwd[0] else "/"
        else:
            new_cwd = cwd.rstrip("/") + "/" + target

        try:
            new_abs = safe_path(new_cwd)
        except PermissionError:
            return {"error": "permission denied"}

        if not os.path.isdir(new_abs):
            return {"error": f"cd: {target}: no such directory"}

        if not can_execute(new_cwd):
            return {"error": "permission denied"}

        return {"cwd": new_cwd}

    # ── cat ───────────────────────────────────────────────
    if cmd == "cat":
        if not args:
            return {"error": "cat: missing file operand"}

        file_rel = cwd.rstrip("/") + "/" + args[0]
        if not can_read(file_rel):
            return {"error": "permission denied"}

        try:
            abs_path = safe_path(file_rel)
        except PermissionError:
            return {"error": "permission denied"}

        if not os.path.isfile(abs_path):
            return {"error": f"cat: {args[0]}: no such file"}

        with open(abs_path, "r", encoding="utf-8") as f:
            return {"output": f.read()}

    # ── mkdir ─────────────────────────────────────────────
    if cmd == "mkdir":
        if not args:
            return {"error": "mkdir: missing operand"}

        if not can_write(cwd):
            return {"error": "permission denied"}

        dir_rel = cwd.rstrip("/") + "/" + args[0]
        try:
            path = safe_path(dir_rel)
        except PermissionError:
            return {"error": "permission denied"}

        if os.path.exists(path):
            return {"error": f"mkdir: {args[0]}: already exists"}

        os.makedirs(path)

        perms = load_permissions()
        perms[dir_rel] = "755"
        save_permissions(perms)

        return {"output": ""}

    # ── touch ─────────────────────────────────────────────
    if cmd == "touch":
        if not args:
            return {"error": "touch: missing file operand"}

        if not can_write(cwd):
            return {"error": "permission denied"}

        file_rel = cwd.rstrip("/") + "/" + args[0]
        try:
            path = safe_path(file_rel)
        except PermissionError:
            return {"error": "permission denied"}

        open(path, "a").close()

        perms = load_permissions()
        perms[file_rel] = "644"
        save_permissions(perms)

        return {"output": ""}

    # ── rm ────────────────────────────────────────────────
    if cmd == "rm":
        if not args:
            return {"error": "rm: missing operand"}

        file_rel = cwd.rstrip("/") + "/" + args[0]
        if not can_write(file_rel):
            return {"error": "permission denied"}

        try:
            abs_path = safe_path(file_rel)
        except PermissionError:
            return {"error": "permission denied"}

        if os.path.isdir(abs_path):
            return {"error": "rm: is a directory (use rmdir)"}

        if not os.path.isfile(abs_path):
            return {"error": f"rm: {args[0]}: no such file"}

        os.remove(abs_path)

        perms = load_permissions()
        perms.pop(file_rel, None)
        save_permissions(perms)

        return {"output": ""}

    # ── rmdir ─────────────────────────────────────────────
    if cmd == "rmdir":
        if not args:
            return {"error": "rmdir: missing operand"}

        dir_rel = cwd.rstrip("/") + "/" + args[0]
        if not can_write(dir_rel):
            return {"error": "permission denied"}

        try:
            abs_path = safe_path(dir_rel)
        except PermissionError:
            return {"error": "permission denied"}

        if not os.path.isdir(abs_path):
            return {"error": f"rmdir: {args[0]}: not a directory"}

        try:
            os.rmdir(abs_path)
        except OSError:
            return {"error": f"rmdir: {args[0]}: directory not empty"}

        perms = load_permissions()
        perms.pop(dir_rel, None)
        save_permissions(perms)

        return {"output": ""}

    # ── chmod ─────────────────────────────────────────────
    if cmd == "chmod":
        if len(args) != 2:
            return {"error": "usage: chmod <mode> <path>  (e.g. chmod 755 mydir)"}

        mode, target = args
        if not mode.isdigit() or len(mode) != 3:
            return {"error": "chmod: invalid mode (use three digits, e.g. 755)"}

        target_rel = cwd.rstrip("/") + "/" + target
        perms = load_permissions()
        perms[target_rel] = mode
        save_permissions(perms)

        return {"output": ""}

    # ── unknown ───────────────────────────────────────────
    return {"error": f"{cmd}: command not found  (type 'help' for commands)"}
