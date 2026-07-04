import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from api.ai_service import ask_ai


@ensure_csrf_cookie
def chat(request):
    return render(request, "chat.html")


def chat_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    message = data.get("message", "").strip()
    if not message:
        return JsonResponse({"error": "Message cannot be empty."}, status=400)

    try:
        reply = ask_ai(message)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"reply": reply})
