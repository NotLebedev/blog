#!/usr/bin/env python3
from __future__ import annotations

import os
import shutil
from os import path
from typing import Final, Optional

import typer
from lib.edit import edit
from lib.image import create_resized
from lib.model import ImageInfo, load_database
from lib.validation_context import ValidationContext, init_context
from pydantic import BaseModel, ValidationError

app = typer.Typer()
image_app = typer.Typer()
app.add_typer(image_app, name="image")

DATABASE_DEFAULT_PATH: Final[str] = "public"


@app.command()
def validate(db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    with init_context(ValidationContext(base_path=db_dir)):
        try:
            load_database(db_dir)
        except ValidationError as e:
            print(f"Validation failed: {e}")
            exit(1)
        except FileNotFoundError as e:
            print(f"Could not open file {e.filename}")
            exit(1)


class ImageInfoPrompt(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    camera: Optional[str] = None
    lens: Optional[str] = None
    film: Optional[str] = None

    @staticmethod
    def copy_of(copy_of: ImageInfo) -> ImageInfoPrompt:
        return ImageInfoPrompt(
            id=copy_of.id,
            name=copy_of.name,
            description=copy_of.description,
            camera=copy_of.camera,
            lens=copy_of.lens,
            film=copy_of.film,
        )

    def to_image_info(self, previewWidth: int) -> ImageInfo:
        return ImageInfo(
            id=self.id,
            name=self.name,
            previewWidth=previewWidth,
            description=self.description,
            camera=self.camera,
            lens=self.lens,
            film=self.film,
        )


@image_app.command("add")
def image_add(image: str, db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    with init_context(ValidationContext(base_path=db_dir)):
        try:
            db = load_database(db_dir)
        except ValidationError as e:
            print(f"Validation failed: {e}")
            exit(1)
        except FileNotFoundError as e:
            print(f"Could not open file {e.filename}")
            exit(1)

        info = edit(ImageInfoPrompt)

        previewWidth = create_resized(info.id, image)

        if any(image.id == info.id for image in db.images):
            raise ValueError(f"Image with id {id} already exists in database")

        db.add_image(info.to_image_info(previewWidth))

        with open(path.join(db_dir, "db.json"), "w") as file:
            file.write(db.model_dump_json())


@image_app.command("edit")
def image_edit(image: str, db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    with init_context(ValidationContext(base_path=db_dir)):
        try:
            db = load_database(db_dir)
        except ValidationError as e:
            print(f"Validation failed: {e}")
            exit(1)
        except FileNotFoundError as e:
            print(f"Could not open file {e.filename}")
            exit(1)

        try:
            info = next(filter(lambda el: el.id == image, db.images))
        except StopIteration:
            print(f"Image {image} not found")
            exit(1)

        prompt = ImageInfoPrompt.copy_of(info)

        prompt = edit(prompt)

        if prompt.id != info.id:
            os.rename(
                path.join(db_dir, "images", info.id),
                path.join(db_dir, "images", prompt.id),
            )

        try:
            db.images[db.images.index(info)] = prompt.to_image_info(info.previewWidth)
        except Exception as e:
            if prompt.id != info.id:
                # If editing database failed rollback filesystem change
                os.rename(
                    path.join(db_dir, "images", prompt.id),
                    path.join(db_dir, "images", info.id),
                )
            raise e

        with open(path.join(db_dir, "db.json"), "w") as file:
            file.write(db.model_dump_json())


@image_app.command("remove")
def image_remove(image: str, db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    with init_context(ValidationContext(base_path=db_dir)):
        try:
            db = load_database(db_dir)
        except ValidationError as e:
            print(f"Validation failed: {e}")
            exit(1)
        except FileNotFoundError as e:
            print(f"Could not open file {e.filename}")
            exit(1)

        try:
            info = next(filter(lambda el: el.id == image, db.images))
        except StopIteration:
            print(f"Image {image} not found")
            exit(1)

        db.images.remove(info)

        with open(path.join(db_dir, "db.json"), "w") as file:
            file.write(db.model_dump_json())

        shutil.rmtree(
            path.join(db_dir, "images", info.id),
        )


@image_app.command("list")
def image_list(db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    with init_context(ValidationContext(base_path=db_dir)):
        try:
            db = load_database(db_dir)
        except ValidationError as e:
            print(f"Validation failed: {e}")
            exit(1)
        except FileNotFoundError as e:
            print(f"Could not open file {e.filename}")
            exit(1)

    for image in db.images:
        print(image.id)


if __name__ == "__main__":
    app()
