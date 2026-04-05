from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class BaseResponse(BaseModel):
    model_config = {"from_attributes": True}


class DataEnvelope(BaseModel, Generic[T]):
    data: T
