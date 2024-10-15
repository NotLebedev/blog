import os
import shutil
from os import path
from pathlib import Path
from typing import Final, Optional

import yaml
from pydantic import BaseModel

from lib import iterdirs
from lib.image import create_resized, get_width
from lib.model import Database, ImageInfo

PREVIEW_FILENAME: Final[str] = "preview.jpg"
IMAGE_FILENAME: Final[str] = "image.jpg"


class ContentImageInfo(BaseModel):
    """Model for images/xxxx-image-name/info.yaml"""

    name: str
    description: Optional[str] = None
    camera: Optional[str] = None
    lens: Optional[str] = None
    film: Optional[str] = None
    tags: list[str] = []


def parse_image_dir_name(image_dir: Path) -> tuple[int, str]:
    """
    Dirname is in format xxxx-image-name where xxxx is four digits
    used to order images. Split at first dash and get only
    last part containing actual id
    """
    [idx, id] = path.basename(image_dir).split("-", 1)
    return int(idx), id


def parse_image(image_dir: Path) -> tuple[int, ImageInfo]:
    """Creates database entry and copies files for a single image

    Args:
        image_dir: directory with info.yaml and image files
        result_images: path to `images` directory where new
            directory will be created

    Returns:
        index in resulting array, value for database
    """
    idx, id = parse_image_dir_name(image_dir)

    preview_width = get_width(image_dir.joinpath(PREVIEW_FILENAME))

    with open(path.join(image_dir, "info.yaml")) as file:
        image_info = ContentImageInfo(**yaml.safe_load(file))

    return (
        int(idx),
        ImageInfo(
            id=id,
            name=image_info.name,
            previewWidth=preview_width,
            description=image_info.description,
            camera=image_info.camera,
            lens=image_info.lens,
            film=image_info.film,
            tags=image_info.tags,
        ),
    )


def parse_images(content_root: Path) -> list[ImageInfo]:
    result: list[tuple[int, ImageInfo]] = []

    content_images = content_root.joinpath("images")
    iterdirs(
        content_images,
        lambda content_image: result.append(parse_image(content_image)),
    )

    result.sort(key=lambda tup: tup[0], reverse=True)
    return [info for _, info in result]


def parse_database(content_root: Path) -> Database:
    return Database(images=parse_images(content_root))


def copy_images(content_root: Path, result_root: Path) -> None:
    content_images = content_root.joinpath("images")
    result_images = result_root.joinpath("images")

    def copy_image(content_image: Path) -> None:
        _, id = parse_image_dir_name(content_image)
        result_image = result_images.joinpath(id)

        result_image.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(
            content_image.joinpath(PREVIEW_FILENAME),
            result_image.joinpath(PREVIEW_FILENAME),
            follow_symlinks=True,
        )

        shutil.copyfile(
            content_image.joinpath(IMAGE_FILENAME),
            result_image.joinpath(IMAGE_FILENAME),
            follow_symlinks=True,
        )

    iterdirs(content_images, copy_image)


def make_database(content_root: Path, result_root: Path) -> None:
    db = parse_database(content_root)

    result_root.mkdir(parents=True, exist_ok=True)
    with open(result_root.joinpath("db.json"), "w") as file:
        file.write(db.model_dump_json(exclude_none=True, exclude_unset=True))

    copy_images(content_root, result_root)


INFO_YAML_DEFAULT: Final[str] = """# yaml-language-server: $schema=../.schema.yaml

name:
description:
camera:
lens:
tags: []
"""


def touch_info(image_dir: Path):
    info = image_dir.joinpath("info.yaml")
    if info.exists():
        return

    with open(info, "w") as file:
        file.write(INFO_YAML_DEFAULT)


def add_image(image: Path, id: str, content_root: Path):
    images = [
        parse_image_dir_name(Path(img))
        for img in os.listdir(Path(content_root).joinpath("images"))
        if Path(content_root, "images", img).is_dir()
    ]

    next_idx = max((tup[0] for tup in images), default=-1) + 1

    if tup := next((tup for tup in images if tup[1] == id), None):
        # Images already exists, use existing idx
        next_idx = tup[0]

    image_dir = Path(content_root, "images", f"{next_idx:04d}-{id}")
    create_resized(image_dir, image)
    touch_info(image_dir)
