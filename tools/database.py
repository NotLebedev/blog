#!/usr/bin/env python3

import json
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from os import path
from typing import Any, Iterator, Optional, TypedDict, cast

import typer
from pydantic import AfterValidator, BaseModel, Field, ValidationError, ValidationInfo
from typing_extensions import Annotated

app = typer.Typer()


@dataclass
class ValidationContext(TypedDict):
    base_path: str


_init_context_var = ContextVar(
    "_init_context_var", default=cast(ValidationContext, {"base_path": "."})
)


def set_context(model: BaseModel, data: Any):
    model.__pydantic_validator__.validate_python(
        data,
        self_instance=model,
        context=cast(dict[str, Any], _init_context_var.get()),
    )


@contextmanager
def init_context(value: ValidationContext) -> Iterator[None]:
    token = _init_context_var.set(value)
    try:
        yield
    finally:
        _init_context_var.reset(token)


def get_context(info: ValidationInfo) -> ValidationContext:
    if info.context is None:
        raise ValueError("context is not set")
    return cast(ValidationContext, info.context)


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


class ImageInfo(BaseModel):
    id: Annotated[str, AfterValidator(valid_id)]
    name: str
    # All previews are 512 high
    previewWidth: int = Field(gt=0)
    camera: Optional[str] = None
    lens: Optional[str] = None
    flim: Optional[str] = None


# Use pydantic class that will create a type-checking constructor
class Database(BaseModel):
    images: list[ImageInfo]

    def __init__(self, /, **data: Any) -> None:
        set_context(self, data)


def load_database(filename: str) -> Database:
    with open(filename) as file, init_context(ValidationContext(base_path=filename)):
        return Database(**json.load(file))


@app.command()
def validate(filaname: Annotated[str, typer.Argument()] = "public/db.json"):
    try:
        load_database(filaname)
    except ValidationError as e:
        print(f"Validation failed: {e}")
    except FileNotFoundError as e:
        print(f"Could not open file {e.filename}")


if __name__ == "__main__":
    app()
