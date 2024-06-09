import os
from tempfile import NamedTemporaryFile
from typing import Any, List, Optional, Type, TypeVar

import pytest
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


def yaml_stub(clazz: Type[T] | T) -> str:
    """
    Generate yaml stub for users to fill in
    Currently only supports str and Optinal[str] fileds
    """
    if isinstance(clazz, type):
        return yaml_type_stub(clazz)
    else:
        return yaml_object_stub(clazz)


def yaml_type_stub(clazz: Type[T]) -> str:
    result: List[str] = []
    for field, annotation in clazz.__annotations__.items():
        result.append(f"{"# " if is_optional(annotation) else ""}{field}: ")

    return "\n".join(result) + "\n"


def yaml_object_stub(object: BaseModel) -> str:
    result: List[str] = []
    for field, value in object.__dict__.items():
        # Check that type annotation is valid
        _ = is_optional(object.__annotations__[field])

        if value is None:
            result.append(f"# {field}: ")
        else:
            result.append(f"{field}: {value}")
    return "\n".join(result) + "\n"


def is_optional(annotation: Any) -> bool:
    if annotation == str:
        return False
    elif annotation == Optional[str]:
        return True
    else:
        raise TypeError(f"Type {type} is unsupported when creating yaml stub")


def test_yaml_type_stub_correct() -> None:
    class TestClass(BaseModel):
        a: str
        b: str
        c: Optional[str] = None
        d: str
        e: Optional[str] = None

    expected = """a: 
b: 
# c: 
d: 
# e: 
"""

    assert yaml_stub(TestClass) == expected


def test_yaml_type_stub_incorrect() -> None:
    class TestClass(BaseModel):
        a: str
        b: int

    with pytest.raises(TypeError):
        yaml_stub(TestClass)


def test_yaml_object_stub_correct() -> None:
    class TestClass(BaseModel):
        a: str
        b: str
        c: Optional[str] = None
        d: str
        e: Optional[str] = None

    obj = TestClass(a="qwe", b="rty", d="zxc", e="asd")
    expected = """a: qwe
b: rty
# c: 
d: zxc
e: asd
"""

    assert yaml_stub(obj) == expected


def test_yaml_object_stub_incorrect() -> None:
    class BadType(BaseModel):
        a: str
        b: int

    with pytest.raises(TypeError):
        yaml_stub(BadType(a="qwe", b=10))
