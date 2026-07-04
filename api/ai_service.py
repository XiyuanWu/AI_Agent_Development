import json
from pathlib import Path

from django.conf import settings
from google import genai
from google.genai import types

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MAX_CONTEXT_MESSAGES = 20
MOCK_DATA_PATH = Path(__file__).resolve().parent / "data" / "mock_users.json"


def load_mock_data():
    with open(MOCK_DATA_PATH, encoding="utf-8") as file:
        return json.load(file)


def build_system_prompt(user_id="user_001"):
    data = load_mock_data()
    user = next((u for u in data["users"] if u["id"] == user_id), data["users"][0])
    agent = data["agent"]
    instructions = "\n".join(f"- {item}" for item in agent["instructions"])

    return f"""You are {agent["name"]}.

Personality: {agent["personality"]}
Role: {agent["role"]}

Instructions:
{instructions}

Current user profile (use when relevant, do not invent data beyond this):
{json.dumps(user, indent=2)}
"""


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
        config=types.GenerateContentConfig(system_instruction=build_system_prompt()),
    )
    return response.text
