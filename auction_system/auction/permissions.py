# yourapp/permissions.py

from rest_framework import permissions

class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Allows full access to the user who created the item (seller).
    Allows read-only access to other authenticated users.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the seller of the item.
        return obj.seller == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows full access to admin users.
    Allows read-only access to other authenticated users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class IsBidder(permissions.BasePermission):
    """
    Allows access only to users with the 'bidder' role.
    (Assumes you have a Profile model with a 'role' field)
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == 'bidder'