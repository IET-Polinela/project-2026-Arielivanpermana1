from rest_framework.permissions import BasePermission


def is_app_admin(user):

    return (

        getattr(user, 'is_admin', False)

        or

        getattr(user, 'is_staff', False)

        or

        getattr(user, 'is_superuser', False)
    )


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
        if is_app_admin(request.user):

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
