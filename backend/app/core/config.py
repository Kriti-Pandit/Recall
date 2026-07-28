from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/trackmyapply"
    cors_origins: list[str] = ["http://localhost:5173"]

    google_client_id: str = ""
    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 14

    upload_dir: str = "uploads"
    max_resume_size_bytes: int = 10 * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        path = BACKEND_DIR / self.upload_dir
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
