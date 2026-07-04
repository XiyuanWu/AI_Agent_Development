import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from api.ai_service import ask_ai
from api.models import ChatMessage, Conversation


@ensure_csrf_cookie
def chat(request):
    return render(request, "chat.html")


def conversations_api(request):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    conversations = Conversation.objects.values("id", "title")
    return JsonResponse({"conversations": list(conversations)})


def conversation_detail_api(request, conversation_id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return JsonResponse({"error": "Conversation not found."}, status=404)

    conversation.delete()
    return JsonResponse({"ok": True})


def chat_api(request):
    if request.method == "GET":
        conversation_id = request.GET.get("conversation_id")
        if not conversation_id:
            return JsonResponse({"messages": []})

        messages = ChatMessage.objects.filter(
            conversation_id=conversation_id
        ).values("role", "content")
        return JsonResponse({"messages": list(messages)})

    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    message = data.get("message", "").strip()
    if not message:
        return JsonResponse({"error": "Message cannot be empty."}, status=400)

    conversation = None
    conversation_id = data.get("conversation_id")
    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return JsonResponse({"error": "Conversation not found."}, status=404)

    try:
        reply = ask_ai(message)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    if not conversation:
        conversation = Conversation.objects.create(title=message[:50])

    ChatMessage.objects.create(conversation=conversation, role="user", content=message)
    ChatMessage.objects.create(conversation=conversation, role="assistant", content=reply)

    return JsonResponse({"reply": reply, "conversation_id": conversation.id, "title": conversation.title})
