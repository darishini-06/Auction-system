# yourapp/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import AuctionItem, Bid, User

class AuctionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the item ID from the URL
        self.item_id = self.scope['url_route']['kwargs']['item_id']
        self.room_group_name = f'auction_{self.item_id}'

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # This method is called when a message is sent to the group
    async def broadcast_bid(self, event):
        # Send the message data to the WebSocket
        await self.send(text_data=json.dumps({
            'amount': event['amount'],
            'bidder': event['bidder'],
        }))
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
        else:
            # Create a unique group name for the authenticated user
            self.room_group_name = f'notifications_user_{self.scope["user"].id}'
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # This method is called when a message is sent to the user's group
    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event['message'],
        }))