const routes = {

    "#login": `

        <div class="container mt-5">

            <div class="row justify-content-center">

                <div class="col-md-4">

                    <div class="card shadow p-4">

                        <h3 class="text-center mb-4">
                            Login Citizen
                        </h3>

                        <form id="loginForm">

                            <input
                                type="text"
                                id="username"
                                class="form-control mb-3"
                                placeholder="Username"
                                required
                            >

                            <input
                                type="password"
                                id="password"
                                class="form-control mb-3"
                                placeholder="Password"
                                required
                            >

                            <button
                                type="submit"
                                class="btn btn-primary w-100"
                            >
                                Login
                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </div>

    `,



    "#dashboard": `

        <div class="container mt-4">

            <div class="row g-4">

                <div class="col-lg-3">

                    <div class="card shadow p-3">

                        <h4>
                            Citizen Menu
                        </h4>

                        <hr>

                        <button
                            onclick="logout()"
                            class="btn btn-danger w-100 mb-3"
                        >
                            Logout
                        </button>

                        <a
                            href="#reports"
                            class="btn btn-success w-100 mb-3"
                        >
                            Lihat Laporan
                        </a>

                        <a
                            href="#add-report"
                            class="btn btn-primary w-100"
                        >
                            Tambah Laporan
                        </a>

                    </div>

                </div>



                <div class="col-lg-6">

                    <div class="card shadow p-5 text-center">

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Selamat datang di Smart City Portal
                        </p>

                    </div>

                </div>



                <div class="col-lg-3">

                    <div class="card shadow p-3">

                        <h4>
                            Statistik
                        </h4>

                        <hr>

                        <p id="total-report">
                            Total laporan aktif : 0
                        </p>

                    </div>

                </div>

            </div>

        </div>

    `,



    "#reports": `

        <div class="container mt-4">

            <div class="card shadow p-4">

                <h2 class="mb-4">
                    Daftar Laporan
                </h2>

                <a
                    href="#dashboard"
                    class="btn btn-secondary mb-4"
                >
                    Kembali Dashboard
                </a>

                <div id="report-list">
                    Loading...
                </div>

            </div>

        </div>

    `,



    "#add-report": `

        <div class="container mt-4">

            <div class="row justify-content-center">

                <div class="col-md-6">

                    <div class="card shadow p-4">

                        <h2 class="mb-4">
                            Tambah Laporan
                        </h2>

                        <form id="reportForm">

                            <input
                                type="text"
                                id="title"
                                class="form-control mb-3"
                                placeholder="Judul"
                                required
                            >

                            <input
                                type="text"
                                id="category"
                                class="form-control mb-3"
                                placeholder="Kategori"
                                required
                            >

                            <textarea
                                id="description"
                                class="form-control mb-3"
                                placeholder="Deskripsi"
                                required
                            ></textarea>

                            <input
                                type="text"
                                id="location"
                                class="form-control mb-3"
                                placeholder="Lokasi"
                                required
                            >

                            <select
                                id="status"
                                class="form-select mb-3"
                            >

                                <option value="DRAFT">
                                    DRAFT
                                </option>

                                <option value="REPORTED">
                                    REPORTED
                                </option>

                            </select>

                            <button
                                type="submit"
                                class="btn btn-primary w-100"
                            >
                                Simpan Laporan
                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </div>

    `
};



// ======================================
// ROUTING
// ======================================

function handleRouting() {

    const hash =
        window.location.hash || "#login";

    const app =
        document.getElementById(
            "app-content"
        );



    // route tidak ditemukan
    if (!routes[hash]) {

        app.innerHTML = `

            <div class="container mt-5">

                <div class="alert alert-danger">

                    Halaman tidak ditemukan

                </div>

            </div>

        `;

        return;

    }



    // render halaman
    app.innerHTML = routes[hash];



    // login
    if (
        hash === "#login"
        &&
        typeof setupLoginForm === "function"
    ) {

        setupLoginForm();

    }



    // reports
    if (
        hash === "#reports"
        &&
        typeof loadReports === "function"
    ) {

        loadReports();

    }



    // tambah laporan
    if (
        hash === "#add-report"
        &&
        typeof setupReportForm === "function"
    ) {

        setupReportForm();

    }



    // dashboard statistik
    if (
        hash === "#dashboard"
        &&
        typeof loadStatistics === "function"
    ) {

        loadStatistics();

    }

}



// ======================================
// LOAD REPORTS
// ======================================

async function loadReports() {

    const reportList =
        document.getElementById(
            "report-list"
        );

    if (!reportList) {
        return;
    }



    try {

        const reports =
            await getReports();

        let html = "";



        reports.forEach(function(report) {

            html += `

                <div class="card mb-3 p-3">

                    <h4>
                        ${report.title}
                    </h4>

                    <p>
                        ${report.description}
                    </p>

                    <p>
                        <b>Lokasi:</b>
                        ${report.location}
                    </p>

                    <span class="badge bg-primary">
                        ${report.status}
                    </span>

                    ${report.status === "DRAFT" ? `

                        <button
                            onclick="deleteReport(${report.id})"
                            class="btn btn-danger btn-sm mt-3"
                        >
                            Hapus
                        </button>

                    ` : ""}

                </div>

            `;

        });



        if (reports.length === 0) {

            html = `

                <div class="alert alert-warning">

                    Belum ada laporan

                </div>

            `;

        }



        reportList.innerHTML = html;

    }

    catch(error) {

        console.error(error);

        reportList.innerHTML = `

            <div class="alert alert-danger">

                Gagal memuat laporan

            </div>

        `;

    }

}



// ======================================
// DELETE REPORT
// ======================================

async function deleteReport(id) {

    const confirmDelete =
        confirm(
            "Yakin ingin hapus?"
        );

    if (!confirmDelete) {
        return;
    }



    try {

        const response =
            await requestAPI(

                "/api/report/" + id + "/",

                "DELETE"
            );



        if (
            response.status === 204
        ) {

            alert(
                "Berhasil dihapus"
            );

            loadReports();

            loadStatistics();

        }

        else {

            alert(
                "Gagal hapus"
            );

        }

    }

    catch(error) {

        console.error(error);

        alert(
            "Terjadi error"
        );

    }

}



// ======================================
// LOAD STATISTICS
// ======================================

async function loadStatistics() {

    try {

        const reports =
            await getReports();

        const total =
            reports.length;

        const element =
            document.getElementById(
                "total-report"
            );



        if (element) {

            element.innerHTML =
                "Total laporan aktif : " + total;

        }

    }

    catch(error) {

        console.error(error);

    }

}



// ======================================
// REPORT FORM
// ======================================

function setupReportForm() {

    const form =
        document.getElementById(
            "reportForm"
        );

    if (!form) {
        return;
    }



    form.addEventListener(

        "submit",

        async function(event) {

            event.preventDefault();



            const reportData = {

                title:
                    document.getElementById(
                        "title"
                    ).value,

                category:
                    document.getElementById(
                        "category"
                    ).value,

                description:
                    document.getElementById(
                        "description"
                    ).value,

                location:
                    document.getElementById(
                        "location"
                    ).value,

                status:
                    document.getElementById(
                        "status"
                    ).value
            };



            try {

                const response =
                    await createReport(
                        reportData
                    );



                if (
                    response.status === 201
                ) {

                    alert(
                        "Laporan berhasil dibuat"
                    );

                    window.location.hash =
                        "#reports";

                }

                else {

                    alert(
                        "Gagal membuat laporan"
                    );

                }

            }

            catch(error) {

                console.error(error);

                alert(
                    "Terjadi error"
                );

            }

        }

    );

}



// ======================================
// EVENT LISTENER
// ======================================

window.addEventListener(
    "hashchange",
    handleRouting
);

window.addEventListener(
    "DOMContentLoaded",
    handleRouting
);