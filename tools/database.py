#!/usr/bin/env python3
import typer
from lib.model import load_database
from pydantic import ValidationError
from typing_extensions import Annotated

app = typer.Typer()


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
