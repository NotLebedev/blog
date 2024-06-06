#!/usr/bin/env python3
from os import path
from typing import Final

import typer
from lib import input_maybe
from lib.image import create_resized
from lib.model import ImageInfo, load_database
from lib.validation_context import ValidationContext, init_context
from pydantic import ValidationError

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
        except FileNotFoundError as e:
            print(f"Could not open file {e.filename}")


@image_app.command("add")
def image_add(image: str, db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    with init_context(ValidationContext(base_path=db_dir)):
        try:
            db = load_database(db_dir)
        except ValidationError as e:
            print(f"Validation failed: {e}")
            return
        except FileNotFoundError as e:
            print(f"Could not open file {e.filename}")
            return

        id = input("Image id: ")
        name = input("Image name: ")
        camera = input_maybe("Camera used (optional): ")
        lens = input_maybe("Lens used (optional): ")
        film = input_maybe("Film used (optional): ")
        previewWidth = create_resized(id, image)

        if any(image.id == id for image in db.images):
            raise ValueError(f"Image with id {id} already exists in database")

        db.add_image(
            ImageInfo(
                id=id,
                name=name,
                previewWidth=previewWidth,
                camera=camera,
                lens=lens,
                film=film,
            )
        )

        with open(path.join(db_dir, "db.json"), "w") as file:
            file.write(db.model_dump_json())


if __name__ == "__main__":
    app()
