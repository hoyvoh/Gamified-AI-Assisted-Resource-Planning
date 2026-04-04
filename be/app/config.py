from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        yaml_file=["config/default.yaml", "config/local.yaml"],
        yaml_file_encoding="utf-8",
        env_nested_delimiter="__",
        extra="ignore",
    )
    database_url: str
    secret_key: str
    debug: bool = False


def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
