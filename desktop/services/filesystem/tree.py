import os

from django.conf import settings

BASE_FS_PATH = os.path.join(str(settings.BASE_DIR), "aryaos_storage")


def build_tree(relative_path=""):
    full_path = os.path.normpath(os.path.join(BASE_FS_PATH, relative_path))

    if not full_path.startswith(BASE_FS_PATH):
        return None

    if not os.path.exists(full_path):
        return None

    node = {
        "name": os.path.basename(full_path) or "/",
        "type": "folder" if os.path.isdir(full_path) else "file",
        "path": "/" + relative_path.replace("\\", "/"),
    }

    if os.path.isdir(full_path):
        node["children"] = []
        for item in sorted(os.listdir(full_path)):
            child_rel = os.path.join(relative_path, item)
            child = build_tree(child_rel)
            if child:
                node["children"].append(child)

    return node
