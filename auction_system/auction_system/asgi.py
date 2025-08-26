# auction_system/asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import auction.routing # IMPORTANT: Replace 'yourapp' with the actual name of your Django app

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auction_system.settings')

# This is the standard Django HTTP handler
http_application = get_asgi_application()

# This is the new Channels router
application = ProtocolTypeRouter({
    # (http->django views is added by default)
    "http": http_application,

    # WebSocket handler
    "websocket": AuthMiddlewareStack(
        URLRouter(
            auction.routing.websocket_urlpatterns
        )
    ),
})