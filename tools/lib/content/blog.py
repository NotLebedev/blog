import yaml
from datetime import date
from pathlib import Path
from typing import Final, Literal
from pydantic import BaseModel

from lib import iterdirs
from lib.model import PostInfo
from .tools import parse_numbered_dir_name

INFO_FILENAME: Final[str] = "info.yaml"


class ContentPostInfo(BaseModel):
    """Model for blog/xxxx-post-name/info.yaml"""

    title: str
    date_published: date
    date_modified: date
    status: Literal["draft"] | Literal["published"] | Literal["hidden"]


def parse_post(post_dir: Path) -> tuple[int, PostInfo]:
    idx, id = parse_numbered_dir_name(post_dir)

    with open(post_dir / INFO_FILENAME) as file:
        post_info = ContentPostInfo(**yaml.safe_load(file))

    return (
        int(idx),
        PostInfo(
            id=id,
            title=post_info.title,
            date_published=post_info.date_published,
            date_modified=post_info.date_modified,
            status=post_info.status,
        ),
    )


def parse_posts(content_root: Path) -> list[PostInfo]:
    result: list[tuple[int, PostInfo]] = []

    iterdirs(
        content_root.joinpath("blog"),
        lambda content_post: result.append(parse_post(content_post)),
    )

    result.sort(key=lambda tup: tup[0], reverse=True)
    return [info for _, info in result]
