import uuid
from datetime import datetime

from pydantic import BaseModel


class ResumeRead(BaseModel):
    id: uuid.UUID
    version_label: str
    file_name: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}
