from djongo import models
from django.contrib.auth.models import User
from django.utils import timezone

class Profile(models.Model):
    USER_ROLES = (
        ('admin', 'Admin'),
        ('seller', 'Seller'),
        ('bidder', 'Bidder'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=USER_ROLES, default='bidder')

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class AuctionItem(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('closed', 'Closed'),
    )
    seller = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_highest_bid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    highest_bidder = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_items')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    image_url = models.URLField(max_length=500, blank=True, null=True) # Or use ImageField
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Bid(models.Model):
    item = models.ForeignKey(AuctionItem, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp'] # Show newest bids first

    def __str__(self):
        return f"{self.amount} by {self.bidder.username} on {self.item.title}"