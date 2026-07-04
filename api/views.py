from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
import json

@ensure_csrf_cookie
def chat(request):
    return render(request, "chat.html")

def chat_api(request):
    if request.method == "POST":
        data = json.loads(request.body)
        message = data.get("message")
        return JsonResponse({"reply": f"You said {message}."})
    return JsonResponse({"error": "Invalid request method."}, status=405)