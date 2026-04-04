class NotFoundError(Exception):
    def __init__(self, resource: str, id: str) -> None:
        self.resource = resource
        self.id = id
        super().__init__(f"{resource} '{id}' not found")


class ConflictError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)


class ValidationError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)
