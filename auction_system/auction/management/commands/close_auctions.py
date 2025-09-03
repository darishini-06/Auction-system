# auction/management/commands/close_auctions.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from auction.models import AuctionItem
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class Command(BaseCommand):
    help = 'Finds and closes auctions whose end time has passed, and notifies the winner.'

    def handle(self, *args, **options):
        self.stdout.write(f'[{timezone.now()}] Running close_auctions command...')
        
        # 1. Find all active auctions that have ended.
        # The __lte lookup means "less than or equal to".
        expired_auctions = AuctionItem.objects.filter(
            status='active',
            end_time__lte=timezone.now()
        )
        
        auctions_closed_count = 0

        # 2. Loop through each expired auction.
        for item in expired_auctions:
            self.stdout.write(f'Closing auction for "{item.title}"...')
            
            # 3. Update the status to 'closed'.
            item.status = 'closed'
            item.save()
            auctions_closed_count += 1

            # 4. If there's a winner, send them a notification.
            if item.highest_bidder:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f'notifications_user_{item.highest_bidder.id}',
                    {
                        'type': 'send.notification',
                        'message': f"Congratulations! You won the auction for '{item.title}'! 🏆",
                    }
                )
        
        success_message = f'Successfully closed {auctions_closed_count} expired auction(s).'
        self.stdout.write(self.style.SUCCESS(success_message))