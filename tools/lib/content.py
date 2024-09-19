import os
import shutil
from os import path
from pathlib import Path
from typing import Final, Optional

import yaml
from lib.image import get_width
from lib.model import Database, ImageInfo
from pydantic import BaseModel

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


def make_image(image_dir: Path, result_images: Path) -> tuple[int, ImageInfo]:
    """Creates database entry and copies files for a single image

    Args:
        image_dir: directory with info.yaml and image files
        result_images: path to `images` directory where new
            directory will be created

    Returns:
        index in resulting array, value for database
    """
    # Dirname is in format xxxx-image-name where xxxx is four digits
    # used to order images. Split at first dash and get only
    # last part containing actual id
    [idx, id] = path.basename(image_dir).split("-", 1)

    result_image = result_images.joinpath(id)
    result_image.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(
        image_dir.joinpath(PREVIEW_FILENAME),
        result_image.joinpath(PREVIEW_FILENAME),
        follow_symlinks=True,
    )

    shutil.copyfile(
        image_dir.joinpath(IMAGE_FILENAME),
        result_image.joinpath(IMAGE_FILENAME),
        follow_symlinks=True,
    )
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


def make_images(content_root: Path, result_root: Path) -> list[ImageInfo]:
    result: list[tuple[int, ImageInfo]] = []

    content_images = content_root.joinpath("images")
    result_images = result_root.joinpath("images")
    for f in os.listdir(content_images):
        content_image = content_images.joinpath(f)

        if content_image.is_dir():
            result.append(make_image(content_image, result_images))

    result.sort(key=lambda tup: tup[0], reverse=True)
    return [info for _, info in result]


def make_database(content_root: Path, result_root: Path) -> None:
    content_root = content_root.resolve()
    result_root = result_root.resolve()

    db = Database(images=make_images(content_root, result_root))

    result_root.mkdir(parents=True, exist_ok=True)
    with open(result_root.joinpath("db.json"), "w") as file:
        file.write(db.model_dump_json(exclude_none=True, exclude_unset=True))
