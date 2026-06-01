const API_BASE_URL = "http://127.0.0.1:8000";



function saveToken(access, refresh) {

    localStorage.setItem("access_token", access);

    localStorage.setItem("refresh_token", refresh);

}



function getAccessToken() {

    return localStorage.getItem("access_token");

}



function logout() {

    localStorage.removeItem("access_token");

    localStorage.removeItem("refresh_token");

    window.location.hash = "#login";

}



async function login(username, password) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/token/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );



        const data = await response.json();



        if (!response.ok) {

            alert("Login gagal!");

            console.log(data);

            return;

        }



        saveToken(
            data.access,
            data.refresh
        );



        alert("Login berhasil!");



        window.location.hash = "#dashboard";

    }

    catch (error) {

        console.log(error);

        alert("Terjadi error!");

    }

}



function setupLoginForm() {

    const form = document.getElementById("loginForm");



    if (!form) return;



    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();



            const username =
                document.getElementById("username").value;

            const password =
                document.getElementById("password").value;



            await login(
                username,
                password
            );

        }
    );

}