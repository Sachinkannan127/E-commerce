import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.models.order import Order


def generate_order_invoice_pdf(order: Order) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#4f46e5"),
    )
    header_style = ParagraphStyle(
        "InvoiceHeader",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
    )
    bold_style = ParagraphStyle(
        "BoldText",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        fontName="Helvetica-Bold",
    )

    story = []

    # Invoice Header / Brand
    story.append(Paragraph("<b>ShopVerse E-Commerce Private Limited</b>", title_style))
    story.append(Paragraph("Tax Invoice / Bill of Supply", bold_style))
    story.append(Spacer(1, 10))

    # Order & Invoice Meta Table
    meta_data = [
        [
            Paragraph(f"<b>Invoice No:</b> INV-{order.order_number}", header_style),
            Paragraph(f"<b>Order No:</b> {order.order_number}", header_style),
        ],
        [
            Paragraph(f"<b>Order Date:</b> {order.created_at.strftime('%d %b %Y')}", header_style),
            Paragraph(f"<b>Payment Method:</b> {order.payment_method.value} ({order.payment_status.value})", header_style),
        ],
        [
            Paragraph(
                f"<b>Billed To:</b><br/>{order.shipping_address.full_name}<br/>"
                f"{order.shipping_address.address_line1}<br/>"
                f"{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}<br/>"
                f"Phone: {order.shipping_address.phone}",
                header_style,
            ),
            Paragraph(
                f"<b>Shipped From (Verified Seller):</b><br/>"
                f"ShopVerse Fulfilment Hub<br/>"
                f"Bangalore, Karnataka - 560001<br/>"
                f"GSTIN: 29AABCU9603R1ZN",
                header_style,
            ),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    story.append(meta_table)
    story.append(Spacer(1, 16))

    # Items Table
    items_data = [
        ["#", "Item Description", "Qty", "Unit Price", "Total (INR)"]
    ]
    for idx, item in enumerate(order.items, 1):
        items_data.append([
            str(idx),
            Paragraph(f"<b>{item.title}</b>", header_style),
            str(item.quantity),
            f"INR {item.unit_price_paise / 100:.2f}",
            f"INR {item.total_price_paise / 100:.2f}",
        ])

    # Summary Rows
    items_data.append(["", "", "", "Subtotal:", f"INR {order.subtotal_paise / 100:.2f}"])
    if order.discount_paise > 0:
        items_data.append(["", "", "", "Coupon Discount:", f"-INR {order.discount_paise / 100:.2f}"])
    items_data.append(["", "", "", "Shipping Charges:", f"INR {order.shipping_fee_paise / 100:.2f}"])
    items_data.append(["", "", "", "Taxes (18% GST incl.):", f"INR {order.tax_paise / 100:.2f}"])
    items_data.append(["", "", "", "Grand Total:", f"INR {order.total_amount_paise / 100:.2f}"])

    items_table = Table(items_data, colWidths=[24, 250, 40, 100, 106])
    items_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, len(order.items)), 0.5, colors.HexColor("#cbd5e1")),
            ("LINEBELOW", (0, -1), (-1, -1), 1, colors.HexColor("#4f46e5")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(items_table)
    story.append(Spacer(1, 20))

    # Footer note
    story.append(
        Paragraph(
            "This is a computer-generated invoice and requires no physical signature. "
            "For support or returns, visit shopverse.in/help or email support@shopverse.in.",
            ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.gray)
        )
    )

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
