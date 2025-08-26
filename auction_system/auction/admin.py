from django.contrib import admin
from .models import Profile, AuctionItem, Bid

# This simple registration is redundant and should be removed.
# admin.site.register(AuctionItem) 

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role']
    search_fields = ['user__username']

@admin.register(AuctionItem)
class AuctionItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'status', 'current_highest_bid', 'end_time']
    list_filter = ['status', 'end_time']
    search_fields = ['title', 'description', 'seller__username']

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['item', 'bidder', 'amount', 'timestamp']
    search_fields = ['item__title', 'bidder__username']