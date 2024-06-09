#!/usr/bin/env python3
from os import path
from typing import Final, Optional

import typer
import yaml
from lib.edit import edit, yaml_stub
from lib.image import create_resized
from lib.model import ImageInfo, load_database
from lib.validation_context import ValidationContext, init_context
from pydantic import BaseModel, ValidationError
from yaml import CLoader

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

        class Test(BaseModel):
            id: str
            name: str
            camera: Optional[str] = None
            lens: Optional[str] = None
            film: Optional[str] = None

        info = Test(**yaml.load(edit(yaml_stub(Test)), Loader=CLoader))

        previewWidth = create_resized(info.id, image)

        if any(image.id == info.id for image in db.images):
            raise ValueError(f"Image with id {id} already exists in database")

        db.add_image(
            ImageInfo(
                id=info.id,
                name=info.name,
                previewWidth=previewWidth,
                camera=info.camera,
                lens=info.lens,
                film=info.film,
            )
        )

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


if __name__ == "__main__":
    app()
