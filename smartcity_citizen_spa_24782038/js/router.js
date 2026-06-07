// ======================================
// ROUTER SPA
// ======================================

function renderLoginPage() {

    document.body.classList.add(
        "is-login-page"
    );

    const app = document.getElementById(
        "app-content"
    );

    app.innerHTML = `

        <section class="login-stage">

            <div class="login-shell">

                <div class="login-visual">

                    <span class="login-badge mb-4">
                        <i class="bi bi-buildings-fill"></i>
                        IET City Portal
                    </span>

                    <div class="login-symbol mb-4">
                        <i class="bi bi-clipboard-data"></i>
                    </div>

                    <h1 class="fw-bold mb-3">
                        Portal Laporan Warga
                    </h1>

                    <p class="fs-5 text-white-50 mb-0">
                        Masuk untuk memantau laporan pribadi, melihat feed kota,
                        dan mengirim laporan baru melalui sistem Smart City.
                    </p>

                </div>

                <div class="login-card">

                    <h3 class="fw-bold mb-1">
                        Login Citizen
                    </h3>

                    <p class="text-white-50 mb-4">
                        Gunakan username dan password akun warga.
                    </p>

                    <form id="loginForm">

                        <label
                            for="username"
                            class="form-label fw-semibold"
                        >
                            Username
                        </label>

                        <input
                            type="text"
                            id="username"
                            class="form-control mb-3"
                            placeholder="Masukkan username"
                            required
                        >

                        <label
                            for="password"
                            class="form-label fw-semibold"
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            id="password"
                            class="form-control mb-4"
                            placeholder="Masukkan password"
                            required
                        >

                        <button
                            type="submit"
                            class="btn btn-primary w-100"
                        >
                            <i class="bi bi-box-arrow-in-right me-1"></i>
                            Login
                        </button>

                    </form>

                </div>

            </div>

        </section>

    `;

    setupLoginForm();
}



function handleRouting() {

    const hash = window.location.hash || "#login";

    if (hash === "#login") {

        renderLoginPage();

        return;
    }

    const token = localStorage.getItem(
        "access_token"
    );

    if (!token) {

        if (window.location.hash !== "#login") {

            window.location.hash = "#login";

            return;
        }

        renderLoginPage();

        return;
    }

    if (hash !== "#dashboard") {

        window.location.hash = "#dashboard";

        return;
    }

    document.body.classList.remove(
        "is-login-page"
    );

    loadDashboardData(
        "feed",
        1
    );
}



window.addEventListener(
    "hashchange",
    handleRouting
);

window.addEventListener(
    "DOMContentLoaded",
    handleRouting
);
