from rest_framework.permissions import BasePermission


class IsOwnerAndDraftOrReadOnly(
    BasePermission
):

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        # GET aman
        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS"
        ]:
            return True

        # ADMIN boleh semua
        if request.user.is_admin:
            return True

        # CITIZEN:
        # hanya milik sendiri
        # dan status draft
        return (

            obj.reporter == request.user

            and

            obj.status == "DRAFT"

        )