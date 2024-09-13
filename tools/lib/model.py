from typing import Optional

from pydantic import AfterValidator, BaseModel, Field
from typing_extensions import Annotated


def valid_tags(tags: list[str]) -> list[str]:
    def no_commas(tag: str) -> bool:
        return "," in tag

    if tag := next(filter(no_commas, tags), None):
        raise ValueError(f"Tag '{tag}' contains ',' (comma) in it's name")

    # Ensure that all tags are unique in tags list
    # Normalize all tags to lowercase
    return list({tag.lower() for tag in tags})


class ImageInfo(BaseModel):
    id: str
    name: str
    # All previews are 512 high
    previewWidth: int = Field(gt=0)
    description: Optional[str] = None
    camera: Optional[str] = None
    lens: Optional[str] = None
    film: Optional[str] = None
    tags: Annotated[list[str], AfterValidator(valid_tags)] = []


# Use pydantic class that will create a type-checking constructor
class Database(BaseModel):
    images: list[ImageInfo]

    def add_image(self, image: ImageInfo) -> None:
        self.images.insert(0, image)
