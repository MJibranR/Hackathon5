def format_response(message: str, channel: str) -> str:
    """Applies channel-specific formatting rules."""
    if channel == 'gmail':
        return f"Hi,\n\n{message}\n\nBest regards,\nThe NovaSaaS Team"
    elif channel == 'whatsapp':
        # WhatsApp usually has a 4096 char limit, but we'll stick to a concise version for UX
        msg = message[:250] + "..." if len(message) > 250 else message
        return f"{msg}\n\n📱 Tip: Use @mentions to notify team members!"
    elif channel == 'web_form':
        return f"{message}\n\n—\nNovaSaaS Support"
    return message
