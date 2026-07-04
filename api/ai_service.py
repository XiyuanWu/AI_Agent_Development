from django.conf import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MAX_CONTEXT_MESSAGES = 20


def ask_ai(messages):
    """Send conversation history to Gemini. Each message: {role, content}."""
    recent = messages[-MAX_CONTEXT_MESSAGES:]
    contents = []
    for msg in recent:
        role = "model" if msg["role"] == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL_NAME,
        contents=contents,
    )
    return response.text
