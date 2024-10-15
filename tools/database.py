#!/usr/bin/env python3
from __future__ import annotations

import traceback
from pathlib import Path
from typing import Annotated, Final

import typer
from lib.content import (
    add_image,
    make_database,
    parse_images,
)

app = typer.Typer(
    help="Manage content database", no_args_is_help=True, add_completion=False
)
image_app = typer.Typer(help="Manipulate images in database", no_args_is_help=True)
app.add_typer(image_app, name="image")

CONTENT_DEFAULT_PATH: Final[str] = "content"
DATABASE_DEFAULT_PATH: Final[str] = "dist"


@app.command("build")
def build(
    content_root: Annotated[
        str, typer.Option(help="Path to content directory")
    ] = CONTENT_DEFAULT_PATH,
    database_root: Annotated[
        str, typer.Option(help="Path to directory where database should be created")
    ] = DATABASE_DEFAULT_PATH,
) -> None:
    """
    Create database from content directory
    """
    try:
        make_database(Path(content_root).resolve(), Path(database_root).resolve())
    except Exception:
        traceback.print_exc()
        print("Problem occurred when creating database")
        exit(1)


@image_app.command("add")
def image_add(
    image: str,
    id: str,
    content_root: Annotated[
        str, typer.Option(help="Path to content directory")
    ] = CONTENT_DEFAULT_PATH,
) -> None:
    """
    Add or replace existing image
    """
    try:
        add_image(Path(image).resolve(), id, Path(content_root).resolve())
    except Exception:
        traceback.print_exc()
        print("Problem occurred when adding image")
        exit(1)


@image_app.command("tags")
def image_tags(
    content_root: Annotated[
        str, typer.Option(help="Path to content directory")
    ] = CONTENT_DEFAULT_PATH,
) -> None:
    """
    List all tags used in images
    """
    try:
        images = parse_images(Path(content_root).resolve())
        tags = list(set(tag.lower() for image in images for tag in image.tags))
        tags.sort()

        for tag in tags:
            print(tag)
    except Exception:
        traceback.print_exc()
        print("Problem occurred when reading tags")
        exit(1)


if __name__ == "__main__":
    app()
