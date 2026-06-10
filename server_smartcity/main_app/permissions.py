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

        # ADMIN hanya boleh mengubah status.
        if request.user.is_admin:

            return (

                request.method in [
                    "PUT",
                    "PATCH"
                ]

                and

                set(request.data.keys()) == {
                    "status"
                }
            )

        # CITIZEN:
        # hanya milik sendiri
        # dan status draft
        return (

            obj.reporter == request.user

            and

            obj.status == "DRAFT"

        )
