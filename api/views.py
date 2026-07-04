from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
import json
from api.ai_service import ask_ai

@ensure_csrf_cookie
def chat(request):
    return render(request, "chat.html")

def chat_api(request):
    if request.method == "POST":
        data = json.loads(request.body)
        message = data.get("message", "")
        ai_reply = ask_ai(message)
        return JsonResponse({"reply": ai_reply})
    return JsonResponse({"error": "Invalid request method."}, status=405)