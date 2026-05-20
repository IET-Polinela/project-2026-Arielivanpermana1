from rest_framework import permissions


class IsOwnerAndDraftOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):

        # GET aman untuk semua user login
        if request.method in permissions.SAFE_METHODS:
            return True

        # PUT DELETE hanya owner dan status DRAFT
        return (
            obj.reporter == request.user
            and obj.status == 'DRAFT'
        )