def account_verification_email(name: str, link: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Hello {name},</h2>
        <p>Thank you for registering on HealthScan. Please verify your account by clicking the button below:</p>
        <p style="text-align:center;">
            <a href="{link}" style="
                background-color:#4CAF50;
                color:white;
                padding:12px 20px;
                text-decoration:none;
                border-radius:5px;
                display:inline-block;
                font-weight:bold;">
                Verify Account
            </a>
        </p>
        <p>If you did not register, please ignore this email.</p>
        <p>Best regards,<br>Team HealthScan</p>
    </body>
    </html>
    """

def forgot_password_email(name: str, link: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Hello {name},</h2>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p style="text-align:center;">
            <a href="{link}" style="
                background-color:#FF5722;
                color:white;
                padding:12px 20px;
                text-decoration:none;
                border-radius:5px;
                display:inline-block;
                font-weight:bold;">
                Reset Password
            </a>
        </p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>Team HealthScan</p>
    </body>
    </html>
    """