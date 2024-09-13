import os
from os import path
from typing import Optional

import yaml
from lib.image import get_width
from lib.model import Database, ImageInfo
from pydantic import BaseModel


class ContentImageInfo(BaseModel):
    name: str
    description: Optional[str] = None
    camera: Optional[str] = None
    lens: Optional[str] = None
    film: Optional[str] = None
    tags: list[str] = []


def make_image(dirname: str) -> ImageInfo:
    id = path.basename(dirname)

    print(dirname)

    with open(path.join(dirname, "info.yaml")) as file:
        image_info = ContentImageInfo(**yaml.safe_load(file))

    preview_width = get_width(path.join(dirname, "preview.jpg"))

    return ImageInfo(
        id=id,
        name=image_info.name,
        previewWidth=preview_width,
        description=image_info.description,
        camera=image_info.camera,
        lens=image_info.lens,
        film=image_info.film,
        tags=image_info.tags,
    )


def make_images(dirname: str) -> list[ImageInfo]:
    result: list[ImageInfo] = []

    images_dir = path.join(dirname, "images")
    for f in os.listdir(images_dir):
        image_dir = path.join(images_dir, f)
        if path.isdir(image_dir):
            result.append(make_image(image_dir))

    return result


def make_database(dirname: str) -> Database:
    return Database(images=make_images(dirname))
