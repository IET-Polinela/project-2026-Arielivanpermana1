// ======================================
// SAVE TOKEN
// ======================================

function saveToken(
    access,
    refresh
) {

    localStorage.setItem(
        "access_token",
        access
    );

    localStorage.setItem(
        "refresh_token",
        refresh
    );

}


// ======================================
// GET TOKEN
// ======================================

function getAccessToken() {

    return localStorage.getItem(
        "access_token"
    );

}


// ======================================
// LOGOUT
// ======================================

function logout() {

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "refresh_token"
    );

    alert(
        "Logout berhasil"
    );

    location.reload();

}


// ======================================
// LOGIN
// ======================================

async function login(
    username,
    password
) {

    try {

        const response = await requestAPI(

            "/api/token/",

            "POST",

            {
                username,
                password
            }
        );



        if (response.status !== 200) {

            alert(
                "Login gagal!"
            );

            console.log(
                response.data
            );

            return false;

        }



        saveToken(

            response.data.access,

            response.data.refresh

        );



        alert(
            "Login berhasil!"
        );



        window.location.hash =
            "#dashboard";



        return true;

    }

    catch (error) {

        console.log(
            error
        );

        alert(
            "Terjadi error!"
        );

        return false;

    }

}


// ======================================
// SETUP LOGIN FORM
// ======================================

function setupLoginForm() {

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) return;



    form.addEventListener(

        "submit",

        async function (e) {

            e.preventDefault();



            const username =

                document.getElementById(
                    "username"
                ).value;



            const password =

                document.getElementById(
                    "password"
                ).value;



            await login(
                username,
                password
            );

        }

    );

}
