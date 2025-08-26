# --- Imports (Cleaned Up) ---
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import AuctionItem, Bid, Profile
from .serializers import UserSerializer, AuctionItemSerializer, BidSerializer
from .permissions import IsSellerOrReadOnly, IsBidder


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class AuctionItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and creating auction items.
    """
    queryset = AuctionItem.objects.filter(status='active')
    serializer_class = AuctionItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]

    def perform_create(self, serializer):
        # Ensure only users with a 'seller' role can create items
        if self.request.user.profile.role != 'seller':
            raise PermissionDenied("You must be a seller to list an item.")
        serializer.save(seller=self.request.user)

    # --- PROFILE PAGE ACTIONS ---
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_listings(self, request):
        """
        Returns a list of auction items listed by the current user.
        """
        my_items = AuctionItem.objects.filter(seller=request.user)
        serializer = self.get_serializer(my_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_bids(self, request):
        """
        Returns a list of items where the current user is the highest bidder.
        """
        my_winning_bids = AuctionItem.objects.filter(highest_bidder=request.user, status='active')
        serializer = self.get_serializer(my_winning_bids, many=True)
        return Response(serializer.data)


class BidViewSet(viewsets.ModelViewSet):
    """
    API endpoint for placing bids.
    """
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated, IsBidder]

    # --- UPDATED with Notification Logic ---
    def perform_create(self, serializer):
        item = serializer.validated_data['item']
        amount = serializer.validated_data['amount']

        if amount <= item.current_highest_bid:
            raise serializers.ValidationError("Your bid must be higher than the current highest bid.")

        # 1. Get the previous highest bidder BEFORE we update the item
        previous_highest_bidder = item.highest_bidder

        # 2. Save the new bid and update the item
        bid = serializer.save(bidder=self.request.user)
        item.current_highest_bid = amount
        item.highest_bidder = self.request.user
        item.save()

        # 3. Broadcast the public price update to the auction room
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'auction_{item.id}',
            {
                'type': 'broadcast.bid',
                'amount': str(bid.amount),
                'bidder': bid.bidder.username,
            }
        )

        # 4. Send a private notification to the user who was just outbid
        if previous_highest_bidder and previous_highest_bidder != self.request.user:
            async_to_sync(channel_layer.group_send)(
                f'notifications_user_{previous_highest_bidder.id}',
                {
                    'type': 'send.notification',
                    'message': f"You have been outbid on '{item.title}'!",
                }
            )