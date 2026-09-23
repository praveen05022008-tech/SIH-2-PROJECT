import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)


def _build_html_template(
    title: str,
    preheader: str,
    greeting: str,
    main_message: str,
    details_list: Optional[list] = None,
    action_url: Optional[str] = None,
    action_text: Optional[str] = None,
) -> str:
    """
    Renders a responsive, modern HTML email template branded for the
    Academia-Industry Collaboration Portal.
    """
    portal_name = settings.EMAILS_FROM_NAME
    frontend_url = settings.FRONTEND_URL

    details_html = ""
    if details_list:
        items = "".join(
            f"""
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 14px; font-weight: 600; color: #475569; width: 35%;">{k}</td>
                <td style="padding: 10px 14px; color: #0f172a; font-family: monospace, sans-serif;">{v}</td>
            </tr>
            """
            for k, v in details_list
        )
        details_html = f"""
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 14px;">
            <tbody>
                {items}
            </tbody>
        </table>
        """

    button_html = ""
    if action_url and action_text:
        target_url = action_url if action_url.startswith("http") else f"{frontend_url.rstrip('/')}{action_url}"
        button_html = f"""
        <div style="margin: 32px 0 24px 0; text-align: center;">
            <a href="{target_url}" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                {action_text} &rarr;
            </a>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
    <div style="display: none; max-height: 0; overflow: hidden;">{preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center;">
                            <div style="color: #38bdf8; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">NATIONAL PLATFORM</div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">{portal_name}</h1>
                        </td>
                    </tr>
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px 28px 32px;">
                            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">{title}</h2>
                            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">{greeting},</p>
                            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">{main_message}</p>

                            {details_html}
                            {button_html}

                            <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                                If you did not request or expect this email, you can safely disregard it. For assistance, contact our administrative support team.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 13px; color: #64748b;">&copy; 2026 Academia-Industry Collaboration Portal. All rights reserved.</p>
                            <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">Government of India &bull; Ministry of Education &bull; AICTE Initiative</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""


def send_email_sync(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    """
    Synchronously dispatches an email via SMTP.
    If SMTP is not configured or disabled, simulates email dispatch in logs.
    """
    if not settings.SMTP_ENABLED:
        logger.info(f"[EMAIL_SERVICE: DISABLED] Skipped email to {to_email}: {subject}")
        return True

    # If no SMTP username/password provided, log simulation
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(
            f"[EMAIL_SERVICE: SIMULATED] To: {to_email} | Subject: '{subject}' | Host: {settings.SMTP_HOST}:{settings.SMTP_PORT}"
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email

        if text_content:
            part1 = MIMEText(text_content, "plain", "utf-8")
            msg.attach(part1)

        part2 = MIMEText(html_content, "html", "utf-8")
        msg.attach(part2)

        if settings.SMTP_SSL:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())

        logger.info(f"[EMAIL_SERVICE: DELIVERED] Successfully sent email to {to_email} with subject: '{subject}'")
        return True
    except Exception as e:
        logger.error(f"[EMAIL_SERVICE: ERROR] Failed sending email to {to_email}: {str(e)}", exc_info=True)
        return False


async def send_email_async(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    """
    Dispatches email asynchronously without blocking the event loop.
    """
    return await asyncio.to_thread(send_email_sync, to_email, subject, html_content, text_content)


def trigger_background_email(
    to_email: str, subject: str, html_content: str, text_content: Optional[str] = None
) -> None:
    """
    Safe fire-and-forget email helper for background execution.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(send_email_async(to_email, subject, html_content, text_content))
        else:
            send_email_sync(to_email, subject, html_content, text_content)
    except Exception:
        # Fallback to direct thread if event loop state is inactive
        import threading

        t = threading.Thread(target=send_email_sync, args=(to_email, subject, html_content, text_content), daemon=True)
        t.start()


# High-Level Transactional Notification Helpers


def send_welcome_email(to_email: str, full_name: str, role: str) -> None:
    """Sent when a new user registers on the platform."""
    subject = "Welcome to Academia-Industry Collaboration Portal"
    greeting = f"Hello {full_name}"
    main_msg = (
        f"Thank you for registering as a <strong>{role.capitalize()}</strong> on the "
        f"Academia-Industry Collaboration Portal. Your registration has been submitted and is currently "
        f"being reviewed by platform administrators."
    )
    details = [
        ("Account Email", to_email),
        ("Role", role.capitalize()),
        ("Status", "Pending Administrator Approval"),
    ]
    html = _build_html_template(
        title="Welcome to AIC Portal",
        preheader="Your registration has been received.",
        greeting=greeting,
        main_message=main_msg,
        details_list=details,
        action_url="/login",
        action_text="View Portal Status",
    )
    trigger_background_email(to_email, subject, html)


def send_approval_status_email(to_email: str, full_name: str, is_approved: bool) -> None:
    """Sent when an admin approves or rejects a user registration."""
    status_str = "Approved & Activated" if is_approved else "Registration Not Approved"
    subject = f"Your AIC Portal Account Has Been {status_str}"
    greeting = f"Hello {full_name}"
    if is_approved:
        main_msg = (
            "Great news! Your account registration on the Academia-Industry Collaboration Portal has been approved. "
            "You can now log in to explore curated industry internships, collaborative R&D projects, and AI-driven career matching."
        )
        action_text = "Log In to Your Dashboard"
        action_url = "/login"
    else:
        main_msg = (
            "Your registration request could not be approved at this time by the administration. "
            "If you believe this is a mistake, please reach out to our support team."
        )
        action_text = "Contact Support"
        action_url = "/"

    details = [
        ("Account Email", to_email),
        ("Account Status", status_str),
    ]
    html = _build_html_template(
        title=f"Account Status Update: {status_str}",
        preheader=f"Your account status is now {status_str}.",
        greeting=greeting,
        main_message=main_msg,
        details_list=details,
        action_url=action_url,
        action_text=action_text,
    )
    trigger_background_email(to_email, subject, html)


def send_bulk_onboarding_email(to_email: str, full_name: str, username: str, temp_password: str, role: str) -> None:
    """Sent when an administrator provisions accounts via CSV bulk onboarding."""
    subject = "Your AIC Portal Account Credentials"
    greeting = f"Hello {full_name}"
    main_msg = (
        f"An institutional account has been provisioned for you on the "
        f"Academia-Industry Collaboration Portal as a <strong>{role.capitalize()}</strong>. "
        f"Please use the temporary credentials below to log in and update your security settings."
    )
    details = [
        ("Portal Role", role.capitalize()),
        ("Username", username),
        ("Email", to_email),
        ("Temporary Password", temp_password),
    ]
    html = _build_html_template(
        title="Account Provisioned - AIC Portal",
        preheader="Your institutional account credentials have arrived.",
        greeting=greeting,
        main_message=main_msg,
        details_list=details,
        action_url="/login",
        action_text="Log In to Portal",
    )
    trigger_background_email(to_email, subject, html)


def send_application_submitted_email(
    to_email: str, applicant_name: str, opportunity_title: str, company_name: str
) -> None:
    """Sent to a student when they submit an application."""
    subject = f"Application Submitted: {opportunity_title}"
    greeting = f"Hello {applicant_name}"
    main_msg = (
        f"Your application for <strong>{opportunity_title}</strong> at <strong>{company_name}</strong> "
        f"has been successfully delivered. The hiring team has been notified and will review your profile."
    )
    details = [
        ("Opportunity", opportunity_title),
        ("Organization", company_name),
        ("Application Status", "Applied / Under Review"),
    ]
    html = _build_html_template(
        title="Application Confirmed",
        preheader=f"Successfully applied to {opportunity_title}.",
        greeting=greeting,
        main_message=main_msg,
        details_list=details,
        action_url="/student/applications",
        action_text="Track Applications",
    )
    trigger_background_email(to_email, subject, html)


def send_new_application_received_email(
    to_email: str,
    employer_name: str,
    applicant_name: str,
    opportunity_title: str,
    match_score: Optional[int] = None,
) -> None:
    """Sent to an industry recruiter when a candidate applies."""
    subject = f"New Candidate Application: {opportunity_title}"
    greeting = f"Hello {employer_name}"
    score_display = f"{match_score}%" if match_score else "Calculated upon review"
    main_msg = (
        f"A new candidate, <strong>{applicant_name}</strong>, has submitted an application for your posting "
        f"<strong>{opportunity_title}</strong>."
    )
    details = [
        ("Candidate Name", applicant_name),
        ("Opportunity", opportunity_title),
        ("AI Match Score", score_display),
    ]
    html = _build_html_template(
        title="New Application Received",
        preheader=f"{applicant_name} applied for {opportunity_title}.",
        greeting=greeting,
        main_message=main_msg,
        details_list=details,
        action_url="/industry/applications",
        action_text="Review Candidate Profile",
    )
    trigger_background_email(to_email, subject, html)


def send_application_status_update_email(
    to_email: str, applicant_name: str, opportunity_title: str, company_name: str, status: str
) -> None:
    """Sent when an application status changes (shortlisted, selected, rejected)."""
    status_clean = status.replace("_", " ").capitalize()
    subject = f"Update on Your Application: {opportunity_title} ({status_clean})"
    greeting = f"Hello {applicant_name}"
    main_msg = (
        f"There is a status update regarding your application for <strong>{opportunity_title}</strong> "
        f"at <strong>{company_name}</strong>. Your application status is now marked as <strong>{status_clean}</strong>."
    )
    details = [
        ("Opportunity", opportunity_title),
        ("Organization", company_name),
        ("New Status", status_clean),
    ]
    html = _build_html_template(
        title=f"Application Update: {status_clean}",
        preheader=f"Status changed to {status_clean} for {opportunity_title}.",
        greeting=greeting,
        main_message=main_msg,
        details_list=details,
        action_url="/student/applications",
        action_text="View Application Details",
    )
    trigger_background_email(to_email, subject, html)


def send_issue_status_update_email(
    to_email: str,
    reporter_name: str,
    issue_title: str,
    issue_status: str,
    admin_notes: Optional[str] = None,
) -> None:
    """Sent when a platform issue ticket status is updated by administrators."""
    status_clean = issue_status.replace("_", " ").capitalize()
    subject = f"Support Ticket Update: #{issue_title} ({status_clean})"
    greeting = f"Hello {reporter_name}"
    main_msg = (
        f"Your reported platform issue <strong>'{issue_title}'</strong> has been updated to <strong>{status_clean}</strong> "
        f"by the AIC Portal Engineering Team."
    )
    details = [
        ("Issue Title", issue_title),
        ("Current Status", status_clean),
    ]
    if admin_notes:
        details.append(("Admin Resolution Notes", admin_notes))

    html = _build_html_template(
        title=f"Support Ticket: {status_clean}",
        preheader=f"Your issue ticket is now {status_clean}.",
        greeting=greeting,
        main_message=main_msg,
        details_list=details,
        action_url="/",
        action_text="Go to Portal",
    )
    trigger_background_email(to_email, subject, html)


def send_generic_notification_email(
    to_email: str, recipient_name: str, title: str, message: str, link_url: Optional[str] = None
) -> None:
    """Sent as an email companion to in-app system notifications."""
    subject = f"[AIC Portal] {title}"
    greeting = f"Hello {recipient_name}"
    html = _build_html_template(
        title=title,
        preheader=message[:120],
        greeting=greeting,
        main_message=message,
        action_url=link_url,
        action_text="Open Notification in Portal" if link_url else None,
    )
    trigger_background_email(to_email, subject, html)


# Aliases for compatibility
send_application_received_email = send_new_application_received_email
