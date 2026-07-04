from django.urls import path
from . import views

urlpatterns = [
    path("chat/", views.chat_api, name="chat_api"),
    path("conversations/", views.conversations_api, name="conversations_api"),
    path("conversations/<int:conversation_id>/", views.conversation_detail_api, name="conversation_detail_api"),
]
