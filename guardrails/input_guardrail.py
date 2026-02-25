def validate_text_input(text: str):
    if not text or len(text.strip()) < 5:
        return False, "Invalid message"
    return True, None