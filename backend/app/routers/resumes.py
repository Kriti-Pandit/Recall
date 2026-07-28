import uuid

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Resume, User
from app.schemas.resume import ResumeRead

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

PDF_MAGIC_BYTES = b"%PDF-"


def _get_owned_resume(db: Session, current_user: User, resume_id: uuid.UUID) -> Resume:
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .one_or_none()
    )
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return resume


@router.get("", response_model=list[ResumeRead])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(desc(Resume.uploaded_at))
        .all()
    )


@router.post("", response_model=ResumeRead, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile,
    version_label: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")

    body = await file.read(settings.max_resume_size_bytes + 1)
    if len(body) > settings.max_resume_size_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Resume file is too large")
    if not body.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File does not look like a valid PDF")

    resume_id = uuid.uuid4()
    stored_name = f"{resume_id}.pdf"
    (settings.upload_path / stored_name).write_bytes(body)

    resume = Resume(
        id=resume_id,
        user_id=current_user.id,
        version_label=version_label,
        file_name=file.filename,
        file_path=stored_name,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/{resume_id}/file")
def download_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_owned_resume(db, current_user, resume_id)
    disk_path = settings.upload_path / resume.file_path
    if not disk_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume file missing from storage")
    return FileResponse(disk_path, media_type="application/pdf", filename=resume.file_name)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_owned_resume(db, current_user, resume_id)
    disk_path = settings.upload_path / resume.file_path
    db.delete(resume)
    db.commit()
    disk_path.unlink(missing_ok=True)
