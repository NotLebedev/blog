import os
from tempfile import NamedTemporaryFile
from typing import Optional, Type, TypeVar

from pydantic import BaseModel


def edit(content: str) -> str:
    """
    Prompt user to edit content using his preferred editor
    """
    editor = os.getenv("EDITOR")
    with NamedTemporaryFile(suffix=".yaml", delete_on_close=False) as file:
        file.write(content.encode())
        file.close()

        os.system(f"{editor} {file.name}")

        with open(file.name, mode="rb") as file:
            return file.read().decode()


T = TypeVar("T", bound=BaseModel)


def yaml_stub(clazz: Type[T]) -> str:
    """
    Generate yaml stub for users to fill in
    Currently only supports str and Optinal[str] fileds
    """
    result = ""
    for field, annotation in clazz.__annotations__.items():
        if annotation == str:
            optional = False
        elif annotation == Optional[str]:
            optional = True
        else:
            raise TypeError(f"Type {type} is unsupported when creating yaml stub")

        result += f"{"# " if optional else ""}{field}: \n"

    return result
