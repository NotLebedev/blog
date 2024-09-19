#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from typing import Final

import typer
from lib.content import make_database

app = typer.Typer()
image_app = typer.Typer()
app.add_typer(image_app, name="image")

CONTENT_DEFAULT_PATH: Final[str] = "content"
DATABASE_DEFAULT_PATH: Final[str] = "dist"


@app.command("build")
def build(
    content_root: str = CONTENT_DEFAULT_PATH, database_root: str = DATABASE_DEFAULT_PATH
) -> None:
    try:
        make_database(Path(content_root), Path(database_root))
    except Exception as e:
        print(f"problem {e}")
        exit(1)


@image_app.command("add")
def image_add(image: str, db_dir: str = CONTENT_DEFAULT_PATH) -> None:
    print("Unimplemented")
    exit(1)


@image_app.command("tags")
def image_tags(db_dir: str = CONTENT_DEFAULT_PATH) -> None:
    print("Unimplemented")
    exit(1)


if __name__ == "__main__":
    app()
