import os
from pathlib import Path
from typing import Callable


def input_maybe(prompt: str) -> str | None:
    return None if (result := input(prompt)) == "" else result


def iterdirs(basedir: Path, func: Callable[[Path], None]) -> None:
    """
    Call func on each directory inside basedir, providing
    basedir/dirname as argument
    """
    for dirname in os.listdir(basedir):
        fullpath = basedir.joinpath(dirname)

        if fullpath.is_dir():
            func(fullpath)
