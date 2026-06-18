from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:mustafa@localhost/stocksDB"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:8080,http://localhost:8081,http://127.0.0.1:8081"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
