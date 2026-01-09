import json
from pathlib import Path

PERM_FILE = Path("aryaos_storage/.permissions.json")

def load_permissions():
    if not PERM_FILE.exists():
        return {}
    return json.loads(PERM_FILE.read_text())

def save_permissions(perms):
    PERM_FILE.write_text(json.dumps(perms, indent=2))

def get_permissions(path):
    perms = load_permissions()
    return perms.get(path, "755")  # default

def _has_bit(digit, bit):
    return int(digit) & bit == bit

def can_read(path):
    return _has_bit(get_permissions(path)[0], 4)

def can_write(path):
    return _has_bit(get_permissions(path)[0], 2)

def can_execute(path):
    return _has_bit(get_permissions(path)[0], 1)
