from pydantic import BaseModel as PydanticBaseModel, ValidationError as PydanticValidationError


class BaseModel(PydanticBaseModel):
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


class ValidationError(PydanticValidationError):
    pass
