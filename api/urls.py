from django.urls import path
from django.views.generic import RedirectView

urlpatterns = [
    path('chat/', RedirectView.as_view(url='/chat/', permanent=False)),
]
