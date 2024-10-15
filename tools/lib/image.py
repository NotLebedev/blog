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
    WIDE_SIZE_PREFFERED: Final[int] = 2560
    NARROW_SIZE_PREFFERED: Final[int] = 1440

    minimal_size = (
        (WIDE_SIZE_PREFFERED, NARROW_SIZE_PREFFERED)
        if original.width > original.height
        else (NARROW_SIZE_PREFFERED, WIDE_SIZE_PREFFERED)
    )

    if original.width <= minimal_size[0] or original.height <= minimal_size[1]:
        # Don't upscale small images
        return original.copy()
    else:
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
