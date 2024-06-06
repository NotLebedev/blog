def input_maybe(prompt: str) -> str | None:
    return None if (result := input(prompt)) == "" else result
