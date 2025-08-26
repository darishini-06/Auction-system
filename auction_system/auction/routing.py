# auction/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # This URL pattern directs WebSocket connections for a specific auction
    # to your AuctionConsumer.
    re_path(r'ws/auction/(?P<item_id>\w+)/$', consumers.AuctionConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]