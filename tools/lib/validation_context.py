from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Any, Iterator, TypedDict, cast

from pydantic import BaseModel, ValidationInfo


@dataclass
class ValidationContext(TypedDict):
    base_path: str


_init_context_var = ContextVar(
    "_init_context_var", default=cast(ValidationContext, {"base_path": "."})
)


def set_context(model: BaseModel, data: Any) -> None:
    model.__pydantic_validator__.validate_python(
        data,
        self_instance=model,
        context=cast(dict[str, Any], _init_context_var.get()),
    )


@contextmanager
def init_context(value: ValidationContext) -> Iterator[None]:
    token = _init_context_var.set(value)
    try:
        yield
    finally:
        _init_context_var.reset(token)


def get_context(info: ValidationInfo) -> ValidationContext:
    if info.context is None:
        raise ValueError("context is not set")
    return cast(ValidationContext, info.context)
