from pathlib import Path
from typing import Callable


def input_maybe(prompt: str) -> str | None:
    return None if (result := input(prompt)) == "" else result


def iterdirs(basedir: Path, func: Callable[[Path], None]) -> None:
    """
    Call func on each directory inside basedir, providing
    directories Path as argument
    """
    for dirname in basedir.iterdir():
        fullpath = basedir / dirname

        if fullpath.is_dir():
            func(fullpath)
