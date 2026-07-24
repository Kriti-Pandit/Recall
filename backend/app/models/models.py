import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Index, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import ApplicationType, InteractionType, Platform, SalaryType, Status


def uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid_pk()
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    google_id: Mapped[str | None] = mapped_column(unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    resumes: Mapped[list["Resume"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    applications: Mapped[list["Application"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    version_label: Mapped[str] = mapped_column(nullable=False)
    file_name: Mapped[str] = mapped_column(nullable=False)
    file_path: Mapped[str] = mapped_column(nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="resumes")


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        Index("idx_applications_user_company", "user_id", "company_name"),
        Index("idx_applications_user_status", "user_id", "status"),
    )

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    company_name: Mapped[str] = mapped_column(nullable=False)
    role_title: Mapped[str] = mapped_column(nullable=False)
    platform: Mapped[Platform] = mapped_column(Enum(Platform, name="platform_enum"), nullable=False)
    application_type: Mapped[ApplicationType] = mapped_column(
        Enum(ApplicationType, name="application_type_enum"), default=ApplicationType.standard
    )
    status: Mapped[Status] = mapped_column(Enum(Status, name="status_enum"), default=Status.applied)
    salary_type: Mapped[SalaryType | None] = mapped_column(Enum(SalaryType, name="salary_type_enum"))
    salary_fixed_lpa: Mapped[float | None] = mapped_column(Numeric(6, 2))
    salary_variable_lpa: Mapped[float | None] = mapped_column(Numeric(6, 2))
    stipend_monthly: Mapped[int | None]
    resume_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("resumes.id", ondelete="SET NULL"))
    applied_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="applications")
    resume: Mapped["Resume | None"] = relationship()
    job_description: Mapped["JobDescription"] = relationship(
        back_populates="application", uselist=False, cascade="all, delete-orphan"
    )
    campus_drive_details: Mapped["CampusDriveDetails | None"] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    referral_details: Mapped["ReferralDetails | None"] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    interactions: Mapped[list["Interaction"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    contacts: Mapped[list["Contact"]] = relationship(back_populates="application", cascade="all, delete-orphan")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id: Mapped[uuid.UUID] = uuid_pk()
    application_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), unique=True
    )
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str | None]
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    application: Mapped["Application"] = relationship(back_populates="job_description")


class CampusDriveDetails(Base):
    __tablename__ = "campus_drive_details"

    application_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True
    )
    drive_date: Mapped[date | None] = mapped_column(Date)
    eligibility_criteria: Mapped[str | None] = mapped_column(Text)
    shortlist_rounds: Mapped[str | None] = mapped_column(Text)
    placement_cell_contact: Mapped[str | None]

    application: Mapped["Application"] = relationship(back_populates="campus_drive_details")


class ReferralDetails(Base):
    __tablename__ = "referral_details"

    application_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True
    )
    referrer_name: Mapped[str] = mapped_column(nullable=False)
    relationship_: Mapped[str | None] = mapped_column("relationship")
    notes: Mapped[str | None] = mapped_column(Text)

    application: Mapped["Application"] = relationship(back_populates="referral_details")


class Interaction(Base):
    __tablename__ = "interactions"
    __table_args__ = (Index("idx_interactions_application", "application_id", "occurred_at"),)

    id: Mapped[uuid.UUID] = uuid_pk()
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"))
    type: Mapped[InteractionType] = mapped_column(Enum(InteractionType, name="interaction_type_enum"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    application: Mapped["Application"] = relationship(back_populates="interactions")


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[uuid.UUID] = uuid_pk()
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[str | None]
    email: Mapped[str | None]
    phone: Mapped[str | None]
    notes: Mapped[str | None] = mapped_column(Text)

    application: Mapped["Application | None"] = relationship(back_populates="contacts")
