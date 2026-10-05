import time
from http import HTTPStatus
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.logging import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip logging for spammy noise if needed, or log everything cleanly
        start_time = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query = f"?{request.url.query}" if request.url.query else ""
        
        try:
            response: Response = await call_next(request)
            process_time_ms = (time.perf_counter() - start_time) * 1000
            status_code = response.status_code
            
            # Get standard HTTP phrase e.g. "200 OK", "404 Not Found"
            try:
                status_phrase = HTTPStatus(status_code).phrase
            except ValueError:
                status_phrase = "Unknown"

            log_msg = (
                f"[{status_code} {status_phrase}] {method} {path}{query} "
                f"from {client_ip} - {process_time_ms:.2f}ms"
            )

            # Categorize log level based on HTTP status code
            if status_code < 400:
                logger.info(log_msg)
            elif status_code < 500:
                logger.warning(log_msg)
            else:
                logger.error(log_msg)

            # Add process time to response header for debugging
            response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"
            return response

        except Exception as exc:
            process_time_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"[500 Internal Server Error] {method} {path}{query} "
                f"from {client_ip} - {process_time_ms:.2f}ms | Exception: {str(exc)}",
                exc_info=True,
            )
            raise exc
