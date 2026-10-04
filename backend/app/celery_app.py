from celery import Celery
from app.core.config import settings

celery = Celery(
    "shopverse_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery.task(name="tasks.send_email_async")
def send_email_async(to_email: str, subject: str, body: str):
    # Asynchronous worker email job (mocked for development)
    print(f"[Celery Worker] Sending email to {to_email}: {subject}")
    return True


@celery.task(name="tasks.generate_invoice_pdf_async")
def generate_invoice_pdf_async(order_id: str):
    print(f"[Celery Worker] Generating PDF invoice for order {order_id}...")
    return f"https://shopverse.storage/invoices/{order_id}.pdf"
