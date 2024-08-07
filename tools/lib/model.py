import json
from os import path
from typing import Any, Optional

from pydantic import AfterValidator, BaseModel, Field, ValidationInfo
from typing_extensions import Annotated

from .validation_context import (
    get_context,
    set_context,
)


def valid_id(id: str, info: ValidationInfo) -> str:
    base_path = get_context(info)["base_path"]
    required_files = [
        path.join(base_path, "images", id, "image.jpg"),
        path.join(base_path, "images", id, "preview.jpg"),
    ]

    def absent(file: str) -> bool:
        return not path.isfile(file)

    if len(missing := list(filter(absent, required_files))) != 0:
        raise ValueError(f"File(s) {missing} not found, required for image {id}")

    return id


def valid_tags(tags: list[str], info: ValidationInfo) -> list[str]:
    def no_commas(tag: str) -> bool:
        return "," in tag

    if tag := next(filter(no_commas, tags), None):
        raise ValueError(f"Tag '{tag}' contains ',' (comma) in it's name")

    # Ensure that all tags are unique in tags list
    # Normalize all tags to lowercase
    return list({tag.lower() for tag in tags})


class ImageInfo(BaseModel):
    id: Annotated[str, AfterValidator(valid_id)]
    name: str
    # All previews are 512 high
    previewWidth: int = Field(gt=0)
    description: Optional[str] = None
    camera: Optional[str] = None
    lens: Optional[str] = None
    film: Optional[str] = None
    tags: Annotated[list[str], AfterValidator(valid_tags)] = []

    def __init__(self, /, **data: Any) -> None:
        set_context(self, data)


# Use pydantic class that will create a type-checking constructor
class Database(BaseModel):
    images: list[ImageInfo]

    def __init__(self, /, **data: Any) -> None:
        set_context(self, data)

    def add_image(self, image: ImageInfo) -> None:
        self.images.insert(0, image)


def load_database(filename: str) -> Database:
    with open(path.join(filename, "db.json")) as file:
        return Database(**json.load(file))
