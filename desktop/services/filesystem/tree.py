import os

# Base directory AryaOS is allowed to see
BASE_FS_PATH = os.path.abspath("aryaos_storage")


def build_tree(relative_path=""):
    """
    Builds a tree for a given relative path inside aryaos_storage
    """
    full_path = os.path.join(BASE_FS_PATH, relative_path)

    if not os.path.exists(full_path):
        return None

    node = {
        "name": os.path.basename(full_path) or "/",
        "type": "folder" if os.path.isdir(full_path) else "file",
        "path": "/" + relative_path.replace("\\", "/"),
    }

    if os.path.isdir(full_path):
        node["children"] = []
        for item in os.listdir(full_path):
            child_rel_path = os.path.join(relative_path, item)
            child = build_tree(child_rel_path)
            if child:
                node["children"].append(child)

    return node
