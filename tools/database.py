#!/usr/bin/env python3
from __future__ import annotations

from typing import Final

import typer
from lib.content import make_database
from pydantic import ValidationError

app = typer.Typer()
image_app = typer.Typer()
app.add_typer(image_app, name="image")

DATABASE_DEFAULT_PATH: Final[str] = "content"


@app.command()
def validate(db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    try:
        make_database(db_dir)
    except ValidationError as e:
        print(f"Validation failed: {e}")
        exit(1)
    except FileNotFoundError as e:
        print(f"File {e.filename} not found")
        exit(1)


@image_app.command("add")
def image_add(image: str, db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    print("Unimplemented")
    exit(1)


@image_app.command("tags")
def image_tags(db_dir: str = DATABASE_DEFAULT_PATH) -> None:
    print("Unimplemented")
    exit(1)


if __name__ == "__main__":
    app()
