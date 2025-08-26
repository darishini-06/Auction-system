from rest_framework import serializers
from .models import AuctionItem, Bid, Profile
from django.contrib.auth.models import User

# Serializer for creating users
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user) # Create a default profile
        return user

# Serializer for Auction Items
class AuctionItemSerializer(serializers.ModelSerializer):
    seller = serializers.ReadOnlyField(source='seller.username') # Show username, not ID

    class Meta:
        model = AuctionItem
        fields = '__all__'

# Serializer for Bids
class BidSerializer(serializers.ModelSerializer):
    bidder = serializers.ReadOnlyField(source='bidder.username')

    class Meta:
        model = Bid
        fields = '__all__'