import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.enums import ApplicationType, Platform, SalaryType, Status


class ApplicationBase(BaseModel):
    company_name: str
    role_title: str
    platform: Platform
    application_type: ApplicationType = ApplicationType.standard
    status: Status = Status.applied
    salary_type: SalaryType | None = None
    salary_fixed_lpa: float | None = None
    salary_variable_lpa: float | None = None
    stipend_monthly: int | None = None
    applied_date: date | None = None
    notes: str | None = None
    jd_text: str | None = Field(default=None, description="Full job description snapshot")
    jd_source_url: str | None = None
    resume_id: uuid.UUID | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company_name: str | None = None
    role_title: str | None = None
    platform: Platform | None = None
    application_type: ApplicationType | None = None
    status: Status | None = None
    salary_type: SalaryType | None = None
    salary_fixed_lpa: float | None = None
    salary_variable_lpa: float | None = None
    stipend_monthly: int | None = None
    applied_date: date | None = None
    notes: str | None = None
    jd_text: str | None = None
    jd_source_url: str | None = None
    resume_id: uuid.UUID | None = None


class ApplicationRead(BaseModel):
    id: uuid.UUID
    company_name: str
    role_title: str
    platform: Platform
    application_type: ApplicationType
    status: Status
    salary_type: SalaryType | None
    salary_fixed_lpa: float | None
    salary_variable_lpa: float | None
    stipend_monthly: int | None
    applied_date: date
    notes: str | None
    jd_text: str | None = None
    jd_source_url: str | None = None
    resume_id: uuid.UUID | None = None
    resume_file_name: str | None = None
    resume_version_label: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
