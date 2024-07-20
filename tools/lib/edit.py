import os
from tempfile import NamedTemporaryFile
from typing import Any, List, Optional, Type, TypeGuard, TypeVar, cast

import pytest
import yaml
from pydantic import BaseModel
from yaml import CLoader


def _edit(content: str) -> str:
    """
    Prompt user to edit content using his preferred editor
    """
    editor = os.getenv("EDITOR")
    with NamedTemporaryFile(suffix=".yaml", delete_on_close=False) as file:
        file.write(content.encode())
        file.close()

        os.system(f"{editor} {file.name}")

        with open(file.name, mode="rb") as reader:
            return reader.read().decode()


T = TypeVar("T", bound=BaseModel)


def edit(clazz: Type[T] | T) -> T:
    if isinstance(clazz, type):
        typ = clazz
    else:
        typ = type(clazz)
    return typ(**yaml.load(_edit(yaml_stub(clazz)), Loader=CLoader))


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
        prefix = "# " if is_optional(annotation) else ""
        default_val = "[]" if annotation in [list[str], "list[str]"] else ""
        result.append(f"{prefix}{field}: {default_val}")

    return "\n".join(result) + "\n"


def yaml_object_stub(obj: BaseModel) -> str:
    result: List[str] = []
    for field, value in obj.__dict__.items():
        # Check that type annotation is valid
        _ = is_optional(obj.__annotations__[field])

        if value is None:
            result.append(f"# {field}: ")
        elif isinstance(value, str) and "\n" in value:
            result.append(f"{field}: |-\n" + ident_string(value) + "\n")
        elif is_list_str(value):
            result.append(f"{field}: [{", ".join(value)}]")
        else:
            result.append(f"{field}: {value}")
    return "\n".join(result) + "\n"


def is_list_str(value: Any) -> TypeGuard[list[str]]:
    if not isinstance(value, list):
        return False
    value = cast(list[object], value)
    return all(isinstance(elem, str) for elem in value)


def ident_string(string: str, ident_size: int = 4):
    return "\n".join([(" " * ident_size) + line for line in string.split("\n")])


def is_optional(annotation: Any) -> bool:
    if annotation in [str, "str", list[str], "list[str]"]:
        return False
    elif annotation in [Optional[str], "Optional[str]"]:
        return True
    else:
        raise TypeError(f"Type {annotation} is unsupported when creating yaml stub")


def test_yaml_type_stub_correct() -> None:
    class TestClass(BaseModel):
        a: str
        b: str
        c: Optional[str] = None
        d: str
        e: Optional[str] = None
        f: list[str] = []

    expected = """a: 
b: 
# c: 
d: 
# e: 
f: []
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
        f: list[str] = []

    obj = TestClass(a="qwe", b="rty", d="zxc", e="asd", f=["qwe", "rty"])
    expected = """a: qwe
b: rty
# c: 
d: zxc
e: asd
f: [qwe, rty]
"""

    assert yaml_stub(obj) == expected


def test_yaml_object_stub_incorrect() -> None:
    class BadType(BaseModel):
        a: str
        b: int

    with pytest.raises(TypeError):
        yaml_stub(BadType(a="qwe", b=10))


def test_yaml_object_stub_multiline() -> None:
    class TestClass(BaseModel):
        a: str

    obj = TestClass(a="qwe\nqwe")
    expected = """a: |-
    qwe
    qwe

"""

    assert yaml_stub(obj) == expected
