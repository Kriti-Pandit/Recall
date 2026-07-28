import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Application, JobDescription, Resume, User
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationUpdate

router = APIRouter(prefix="/api/applications", tags=["applications"])

SORTABLE_FIELDS = {
    "applied_date": Application.applied_date,
    "status": Application.status,
    "company_name": Application.company_name,
}


def _to_read(application: Application) -> ApplicationRead:
    return ApplicationRead(
        id=application.id,
        company_name=application.company_name,
        role_title=application.role_title,
        platform=application.platform,
        application_type=application.application_type,
        status=application.status,
        salary_type=application.salary_type,
        salary_fixed_lpa=application.salary_fixed_lpa,
        salary_variable_lpa=application.salary_variable_lpa,
        stipend_monthly=application.stipend_monthly,
        applied_date=application.applied_date,
        notes=application.notes,
        jd_text=application.job_description.raw_text if application.job_description else None,
        jd_source_url=application.job_description.source_url if application.job_description else None,
        resume_id=application.resume_id,
        resume_file_name=application.resume.file_name if application.resume else None,
        resume_version_label=application.resume.version_label if application.resume else None,
        created_at=application.created_at,
        updated_at=application.updated_at,
    )


def _get_owned_application(db: Session, current_user: User, application_id: uuid.UUID) -> Application:
    application = (
        db.query(Application)
        .options(joinedload(Application.job_description), joinedload(Application.resume))
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .one_or_none()
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application


def _check_resume_ownership(db: Session, current_user: User, resume_id: uuid.UUID | None) -> None:
    if resume_id is None:
        return
    exists = (
        db.query(Resume.id)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .one_or_none()
    )
    if exists is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resume not found")


@router.get("", response_model=list[ApplicationRead])
def list_applications(
    search: str | None = Query(default=None, description="Filter by company name"),
    sort_by: str = Query(default="applied_date"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if sort_by not in SORTABLE_FIELDS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"sort_by must be one of {list(SORTABLE_FIELDS)}")

    query = (
        db.query(Application)
        .options(joinedload(Application.job_description), joinedload(Application.resume))
        .filter(Application.user_id == current_user.id)
    )
    if search:
        query = query.filter(Application.company_name.ilike(f"%{search}%"))

    order_fn = asc if sort_dir == "asc" else desc
    query = query.order_by(order_fn(SORTABLE_FIELDS[sort_by]))

    return [_to_read(a) for a in query.all()]


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(
    body: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _check_resume_ownership(db, current_user, body.resume_id)

    data = body.model_dump(exclude={"jd_text", "jd_source_url"}, exclude_none=True)
    application = Application(user_id=current_user.id, **data)
    db.add(application)
    db.flush()

    if body.jd_text:
        db.add(
            JobDescription(
                application_id=application.id,
                raw_text=body.jd_text,
                source_url=body.jd_source_url,
            )
        )

    db.commit()
    db.refresh(application)
    return _to_read(_get_owned_application(db, current_user, application.id))


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _to_read(_get_owned_application(db, current_user, application_id))


@router.put("/{application_id}", response_model=ApplicationRead)
def update_application(
    application_id: uuid.UUID,
    body: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = _get_owned_application(db, current_user, application_id)
    if "resume_id" in body.model_fields_set:
        _check_resume_ownership(db, current_user, body.resume_id)
    data = body.model_dump(exclude={"jd_text", "jd_source_url"}, exclude_unset=True)
    for field, value in data.items():
        setattr(application, field, value)

    if body.jd_text is not None or body.jd_source_url is not None:
        jd = application.job_description
        if jd is None:
            jd = JobDescription(application_id=application.id, raw_text=body.jd_text or "")
            db.add(jd)
        if body.jd_text is not None:
            jd.raw_text = body.jd_text
        if body.jd_source_url is not None:
            jd.source_url = body.jd_source_url

    db.commit()
    return _to_read(_get_owned_application(db, current_user, application_id))


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = _get_owned_application(db, current_user, application_id)
    db.delete(application)
    db.commit()
