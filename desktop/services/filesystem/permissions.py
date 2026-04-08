import json
import os

from django.conf import settings

PERM_FILE = os.path.join(str(settings.BASE_DIR), "aryaos_storage", ".permissions.json")


def load_permissions():
    if not os.path.exists(PERM_FILE):
        return {}
    with open(PERM_FILE, "r") as f:
        return json.load(f)


def save_permissions(perms):
    with open(PERM_FILE, "w") as f:
        json.dump(perms, f, indent=2)


def get_permissions(path):
    perms = load_permissions()
    return perms.get(path, "755")


def _has_bit(digit, bit):
    return int(digit) & bit == bit


def can_read(path):
    return _has_bit(get_permissions(path)[0], 4)


def can_write(path):
    return _has_bit(get_permissions(path)[0], 2)


def can_execute(path):
    return _has_bit(get_permissions(path)[0], 1)
