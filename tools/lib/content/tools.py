from pathlib import Path


def parse_numbered_dir_name(image_dir: Path) -> tuple[int, str]:
    """
    Dirname is in format xxxx-image-name where xxxx is four digits
    used to order images. Split at first dash and get only
    last part containing actual id
    """
    [idx, id] = image_dir.name.split("-", 1)
    return int(idx), id
