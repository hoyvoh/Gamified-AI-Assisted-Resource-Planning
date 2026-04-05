"""Centralized logging — SLF4J-style factory + mode-based setup.

INFO mode  — key milestones per pipeline phase (phase start/end, counts, errors).
DEBUG mode — every step with content: LLM prompts/responses, chunk breakdown,
             per-dimension results, intermediate data shapes.

Usage
-----
    # In any module:
    from app.logger import get_logger
    logger = get_logger(__name__)

    # Once at server startup (pass LoggingSettings from config):
    from app.logger import configure_logging
    configure_logging(settings.logging)
"""

import json
import logging
import sys
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.config import LoggingSettings

_APP_ROOT = "app"

_TEXT_INFO_FORMAT = "%(asctime)s [%(levelname)-8s] %(name)s: %(message)s"
_TEXT_DEBUG_FORMAT = "%(asctime)s [%(levelname)-8s] %(name)s.%(funcName)s:%(lineno)d — %(message)s"
_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


class _JsonFormatter(logging.Formatter):
    """Emit one JSON object per log line — useful for log aggregators."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict = {
            "time": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.levelno >= logging.DEBUG and record.funcName:
            payload["func"] = f"{record.funcName}:{record.lineno}"
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def get_logger(name: str) -> logging.Logger:
    """Return a logger under the 'app' hierarchy.

    Equivalent to SLF4J's LoggerFactory.getLogger(ClassName.class).
    Always pass __name__ so the hierarchy mirrors the package tree.

        logger = get_logger(__name__)
    """
    return logging.getLogger(name)


def configure_logging(log_settings: "LoggingSettings") -> None:
    """Attach a console handler to the 'app' logger hierarchy.

    Call this once at server startup (before the ASGI lifespan begins).
    Calling it again is safe — duplicate handlers are prevented.

    Reads from LoggingSettings (config/default.yaml → logging:):
        level     — app logger level: DEBUG | INFO | WARNING
        sql_level — SQLAlchemy engine level: DEBUG | INFO | WARNING
        format    — output format: text | json
    """
    level = logging.getLevelName(log_settings.level)
    sql_level = logging.getLevelName(log_settings.sql_level)

    # Build formatter
    if log_settings.format == "json":
        formatter = _JsonFormatter(datefmt=_DATE_FORMAT)
    else:
        fmt = _TEXT_DEBUG_FORMAT if level == logging.DEBUG else _TEXT_INFO_FORMAT
        formatter = logging.Formatter(fmt, datefmt=_DATE_FORMAT)

    # App logger
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(formatter)

    app_logger = logging.getLogger(_APP_ROOT)
    app_logger.setLevel(level)
    app_logger.propagate = False  # don't double-print via uvicorn's root handler

    # Guard: skip if a StreamHandler is already attached (e.g. hot-reload)
    if not any(isinstance(h, logging.StreamHandler) for h in app_logger.handlers):
        app_logger.addHandler(handler)

    # SQLAlchemy engine — controls SQL statement verbosity
    for sa_logger_name in ("sqlalchemy.engine", "sqlalchemy.pool", "sqlalchemy.dialects"):
        sa_logger = logging.getLogger(sa_logger_name)
        sa_logger.setLevel(sql_level)

    app_logger.info(
        "Logging configured: level=%s sql_level=%s format=%s",
        log_settings.level,
        log_settings.sql_level,
        log_settings.format,
    )
