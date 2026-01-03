import os

BASE_DIR = os.path.abspath("aryaos_storage")

def safe_path(path):
    full = os.path.normpath(os.path.join(BASE_DIR, path.lstrip("/")))
    if not full.startswith(BASE_DIR):
        raise ValueError("Invalid path")
    return full

def execute_command(cwd, command):
    command = command.strip()
    current_path = safe_path(cwd)

    # pwd
    if command == "pwd":
        return {"output": cwd}

    # ls
    if command == "ls":
        items = os.listdir(current_path)
        return {"output": "  ".join(items)}

    # cd
    if command.startswith("cd"):
        target = command.split(" ", 1)[1] if " " in command else "/"
        new_path = safe_path(os.path.join(cwd, target))

        if not os.path.isdir(new_path):
            return {"error": "Not a directory"}

        new_cwd = os.path.normpath(os.path.join(cwd, target))
        if not new_cwd.startswith("/"):
            new_cwd = "/" + new_cwd

        return {"cwd": new_cwd}

    # cat
    if command.startswith("cat"):
        file = command.split(" ", 1)[1]
        file_path = safe_path(os.path.join(cwd, file))

        if not os.path.isfile(file_path):
            return {"error": "File not found"}

        with open(file_path, "r") as f:
            return {"output": f.read()}

    return {"error": "Command not found"}
