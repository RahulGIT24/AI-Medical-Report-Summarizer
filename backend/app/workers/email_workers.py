import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.lib import account_verification_email,forgot_password_email,EMAIL, PASSWORD,CLIENT_URL,get_logger

logger = get_logger("email_worker", "email_worker.log")

def send_email(email=None,name=None, type=None, token=None):
    msg = MIMEMultipart('alternative')
    msg['From'] = EMAIL
    msg['To'] = email
    body=""
    if type=="VERIFICATION":
        msg['Subject'] = "Account Verification Required"
        body = account_verification_email(name=name, link=f"{CLIENT_URL}verify-account?token={token}")
    if type=="RECOVER_PASSWORD":
        msg['Subject'] = "Password Recovery"
        body = forgot_password_email(name=name, link=f"{CLIENT_URL}recover-password?token={token}")

    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(msg)
        logger.info(f"Email sent successfully to {email}")
    except Exception as e:
        logger.info(f"Error while sending mail to {email}. Error is {e}")
        raise ValueError("Can't send emails")
    finally:
        server.quit()
