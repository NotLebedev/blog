from pathlib import Path

from lib.model import Database
from lib.content.images import parse_images, copy_images
from lib.content.blog import parse_posts


def make_database(content_root: Path, result_root: Path) -> None:
    db = parse_database(content_root)

    result_root.mkdir(parents=True, exist_ok=True)
    with open(result_root / "db.json", "w") as file:
        file.write(db.model_dump_json(exclude_none=True, exclude_unset=True))

    copy_images(content_root, result_root)


def parse_database(content_root: Path) -> Database:
    return Database(images=parse_images(content_root), posts=parse_posts(content_root))
