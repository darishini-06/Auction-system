# auction/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuctionItemViewSet, BidViewSet, UserViewSet # 1. Import UserViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'items', AuctionItemViewSet, basename='auctionitem')
router.register(r'bids', BidViewSet, basename='bid')
router.register(r'users', UserViewSet) # 2. Register the new UserViewSet

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]