const BASE_URL = "http://127.0.0.1:8000";

const API_URL =
    `${BASE_URL}/api/report/`;



// ======================================
// LOAD REPORTS
// ======================================

async function loadReports() {

    const token = localStorage.getItem(
        "access_token"
    );

    if (!token) {

        window.location.hash =
            "#login";

        return;

    }

    try {

        const response = await fetch(

            API_URL,

            {
                method: "GET",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                }

            }

        );



        // token invalid
        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.hash =
                "#login";

            return;

        }



        const data =
            await response.json();



        console.log(data);



        const reports =
            data.results || data;



        let html = `

            <div class="container mt-5">

                <div class="card shadow p-4">

                    <h1 class="mb-4">
                        Daftar Laporan
                    </h1>

                    <button
                        class="btn btn-secondary mb-4"
                        onclick="window.location.hash='#dashboard'"
                    >
                        Kembali Dashboard
                    </button>

        `;



        reports.forEach(report => {

            html += `

                <div class="card mb-4 p-3">

                    <h3>
                        ${report.title}
                    </h3>

                    <p>
                        ${report.description}
                    </p>

                    <p>
                        <strong>Lokasi:</strong>
                        ${report.location}
                    </p>

                    <div
                        class="badge bg-primary mb-3"
                    >
                        ${report.status}
                    </div>

            `;



            // hanya draft milik citizen
            // yang bisa dihapus
            if (report.status === "DRAFT") {

                html += `

                    <button
                        class="btn btn-danger w-100 mt-2"
                        onclick="deleteReport('${report.id}')"
                    >
                        Hapus
                    </button>

                `;

            }



            html += `

                </div>

            `;

        });



        html += `

                </div>

            </div>

        `;



        document.getElementById(
            "app-content"
        ).innerHTML = html;

    }

    catch(error) {

        console.error(error);

        document.getElementById(
            "app-content"
        ).innerHTML = `

            <div class="container mt-5">

                <div class="alert alert-danger">

                    Gagal memuat laporan

                </div>

            </div>

        `;

    }

}



// ======================================
// DELETE REPORT
// ======================================

async function deleteReport(reportId) {

    console.log(
        "DELETE ID:",
        reportId
    );

    const yakin = confirm(
        "Yakin ingin menghapus laporan ini?"
    );

    if (!yakin) {

        return;

    }

    const token = localStorage.getItem(
        "access_token"
    );

    try {

        const response = await fetch(

            `${API_URL}${reportId}/`,

            {
                method: "DELETE",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }

        );



        console.log(
            "DELETE STATUS:",
            response.status
        );



        // sukses hapus
        if (response.status === 204) {

            alert(
                "Laporan berhasil dihapus"
            );

            loadReports();

        }



        // forbidden
        else if (
            response.status === 403
        ) {

            const data =
                await response.json();

            alert(
                data.detail
            );

        }



        // not found
        else if (
            response.status === 404
        ) {

            alert(
                "Laporan tidak ditemukan"
            );

        }



        // error lain
        else {

            const text =
                await response.text();

            console.log(text);

            alert(
                "Gagal hapus laporan"
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