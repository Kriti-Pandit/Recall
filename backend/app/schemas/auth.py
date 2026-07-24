import uuid

from pydantic import BaseModel


class GoogleLoginRequest(BaseModel):
    credential: str


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    name: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
