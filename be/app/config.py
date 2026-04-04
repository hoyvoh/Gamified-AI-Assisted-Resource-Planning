from typing import ClassVar, Literal

from pydantic import BaseModel
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
    YamlConfigSettingsSource,
)


class LLMSettings(BaseModel):
    # LLM ops run via CLI subprocess (claude / codex) — no API keys stored here.
    # Authenticate once with: `claude auth login` or similar.
    cli_tool: Literal["claude", "codex"] = "claude"
    model: str = "claude-sonnet-4-6"
    timeout_seconds: int = 120
    max_retries: int = 2


class AnalysisSettings(BaseModel):
    max_period_days: int = 365
    scoring_version: str = "1.0"
    taxonomy_version: str = "1.0"
    github_timeout_seconds: int = 60
    max_job_timeout_seconds: int = 3600  # kill a run if it takes longer than this


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_nested_delimiter="__",
        extra="ignore",
    )

    _yaml_files: ClassVar[list[str]] = ["config/default.yaml", "config/local.yaml"]

    database_url: str
    secret_key: str
    debug: bool = False
    llm: LLMSettings = LLMSettings()
    analysis: AnalysisSettings = AnalysisSettings()

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        return (
            init_settings,
            env_settings,
            YamlConfigSettingsSource(settings_cls, yaml_file=cls._yaml_files),
        )


def get_settings() -> Settings:
    return Settings()
