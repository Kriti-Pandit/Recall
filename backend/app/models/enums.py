import enum


class Platform(str, enum.Enum):
    linkedin = "linkedin"
    naukri = "naukri"
    campus_drive = "campus_drive"
    referral = "referral"
    company_website = "company_website"
    other = "other"


class ApplicationType(str, enum.Enum):
    standard = "standard"
    campus_drive = "campus_drive"
    referral = "referral"


class Status(str, enum.Enum):
    applied = "applied"
    oa_test = "oa_test"
    interview = "interview"
    offer = "offer"
    rejected = "rejected"
    withdrawn = "withdrawn"


class SalaryType(str, enum.Enum):
    ctc = "ctc"
    stipend = "stipend"


class InteractionType(str, enum.Enum):
    status_change = "status_change"
    note = "note"
    email_linked = "email_linked"
    resume_attached = "resume_attached"
    custom = "custom"
