from pathlib import Path
from typing import Final

from PIL import ImageOps
from PIL.Image import Image, Resampling
from PIL.Image import open as image_open


def make_preview(original: Image) -> Image:
    """
    Create a preview for original image, that is exactly 512 pixels in height
    """
    return ImageOps.cover(original, (0, 512), method=Resampling.LANCZOS)


def make_image(original: Image) -> Image:
    LANDSCAPE_SIZE: Final[tuple[int, int]] = (1920, 1080)
    PORTRAIT_SIZE: Final[tuple[int, int]] = (1080, 1920)

    minimal_size = LANDSCAPE_SIZE if original.width > original.height else PORTRAIT_SIZE
    return ImageOps.cover(original, minimal_size, method=Resampling.LANCZOS)


def create_resized(dir: Path, original_file: Path) -> int:
    with image_open(original_file) as original:
        preview = make_preview(original)
        image = make_image(original)

        dir.mkdir(parents=True, exist_ok=True)

        preview.save(dir.joinpath("preview.jpg"))
        image.save(dir.joinpath("image.jpg"))

        return preview.width


def get_width(filename: Path) -> int:
    with image_open(filename) as file:
        return file.width
