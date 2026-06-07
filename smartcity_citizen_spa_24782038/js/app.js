console.log("APP JS BARU AKTIF");
console.log(
    "TOKEN:",
    localStorage.getItem(
        "access_token"
    )
);

let currentTab = 'feed';
let currentPage = 1;
let totalPages = 1;
let allReports = [];
let editingReportId = null;


// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboardData(

    tab = 'feed',

    page = 1

) {

    currentTab = tab;
    currentPage = page;

    const app = document.getElementById(
        'app-content'
    );

    app.innerHTML = `

    <div class="text-center p-5 portal-panel">

        <div class="spinner-border text-primary"></div>

        <p class="mt-3">

            Memuat dashboard...

        </p>

    </div>

    `;

    const response = await requestAPI(

        `/api/report/?tab=${tab}&page=${page}`

    );

    console.log(
        "APU RESPONSE:",
        response
    );

    if (response.status === 401) {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        window.location.hash =
            "#login";

        return;
    }

    if (response.status !== 200) {

        app.innerHTML = `

        <div class="alert alert-danger">

            Gagal memuat data API

            <hr>

            status:
            ${response.status}

        </div>

        `;

        return;
    }

    allReports = response.data.results || [];

    totalPages = Math.ceil(
        response.data.count / 10
    );



    // ======================================
    // DASHBOARD LAYOUT
    // ======================================

    app.innerHTML = `

    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div>

            <h1 class="h3 fw-bold mb-1">
                Dashboard Citizen
            </h1>

            <p class="text-muted mb-0">
                Pantau laporan pribadi dan feed kota secara real-time.
            </p>

        </div>

    </div>

    <div class="row g-4">

        <!-- SIDEBAR -->

        <div class="col-lg-3">

            <div class="portal-panel p-3">

                <button

                    class="
                        btn
                        btn-primary
                        w-100
                        mb-4
                    "

                    onclick="openCreateModal()"
                >

                    <i class="bi bi-plus-circle-fill me-2"></i>

                    Tambah Laporan Baru

                </button>



                <h6
                    class="
                        fw-bold
                        text-secondary
                        mb-3
                    "
                >

                    STATUS LAPORAN ANDA

                </h6>

                <div id="summaryContainer"></div>

            </div>

        </div>



        <!-- CONTENT -->

        <div class="col-lg-9">

            <!-- TAB -->

            <div class="portal-panel p-2 d-flex flex-wrap gap-2 mb-4">

                <button

                    class="
                        btn
                        ${

                            tab === 'my_reports'

                            ?

                            'btn-primary'

                            :

                            'btn-light'

                        }
                    "

                    onclick="
                        loadDashboardData(
                            'my_reports'
                        )
                    "
                >

                    <i class="bi bi-folder-fill me-2"></i>

                    Laporan Saya

                </button>



                <button

                    class="
                        btn
                        ${

                            tab === 'feed'

                            ?

                            'btn-primary'

                            :

                            'btn-light'

                        }
                    "

                    onclick="
                        loadDashboardData(
                            'feed'
                        )
                    "
                >

                    <i class="bi bi-globe me-2"></i>

                    Feed Kota (Publik)

                </button>

            </div>



            <!-- REPORT LIST -->

            <div
                class="row"
                id="reportContainer"
            ></div>



            <!-- PAGINATION -->

            <div
                class="mt-4 text-center"
                id="paginationContainer"
            ></div>

        </div>

    </div>

    `;

    renderReports();

    renderPagination();

    loadSummaryStats();
}



// ======================================
// RENDER REPORT
// ======================================

function renderReports() {

    const container = document.getElementById(
        'reportContainer'
    );

    container.innerHTML = '';

    allReports.forEach(report => {

        let progress = 0;
        let label = 'Draft';
        let color = 'bg-secondary';
        let badgeColor = 'bg-secondary';

        if (report.status === 'REPORTED') {

            progress = 25;
            label = 'Diajukan';
            color = 'bg-warning';
            badgeColor = 'bg-warning text-dark';
        }

        if (report.status === 'VERIFIED') {

            progress = 50;
            label = 'Diverifikasi';
            color = 'bg-info';
            badgeColor = 'bg-info text-dark';
        }

        if (report.status === 'IN_PROGRESS') {

            progress = 75;
            label = 'Diproses';
            color = 'bg-primary';
            badgeColor = 'bg-primary';
        }

        if (report.status === 'RESOLVED') {

            progress = 100;
            label = 'Selesai';
            color = 'bg-success';
            badgeColor = 'bg-success';
        }

        const editButton = (

            report.status === 'DRAFT'

            &&

            report.is_owner

        )

            ?

            `

                <button

                    type="button"

                    class="
                        btn
                        btn-outline-primary
                        btn-sm
                        mt-3
                    "

                    onclick="editDraft(${report.id})"
                >

                    <i class="bi bi-pencil-square me-1"></i>

                    Edit

                </button>

            `

            :

            '';

        container.innerHTML += `

        <div class="col-lg-6 mb-4">

            <div
                class="
                    report-card
                    p-3
                    h-100
                "
            >

                <span
                    class="
                        badge
                        ${badgeColor}
                        mb-3
                    "
                >

                    ${report.status}

                </span>

                <h4 class="fw-bold h5">

                    ${report.title}

                </h4>

                <p class="text-muted mb-3">

                    ${report.description}

                </p>

                <hr>

                <p>

                    <strong>Lokasi:</strong>

                    ${report.location}

                </p>

                <p>

                    <strong>Oleh:</strong>

                    ${report.reporter}

                </p>

                <small class="fw-bold">

                    Progress Laporan:

                </small>

                <div
                    class="progress mt-2"
                    style="height:8px;"
                >

                    <div

                        class="
                            progress-bar
                            ${color}
                        "

                        style="
                            width:${progress}%;
                        "
                    ></div>

                </div>

                <div class="text-end mt-1">

                    <small
                        class="
                            text-primary
                            fw-bold
                        "
                    >

                        ${label}
                        (${progress}%)

                    </small>

                </div>

                ${editButton}

            </div>

        </div>

        `;
    });
}



// ======================================
// PAGINATION
// ======================================

function renderPagination() {

    const container =
        document.getElementById(
            'paginationContainer'
        );

    container.innerHTML = '';

    if (totalPages <= 1) {

        return;
    }

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
        1,
        currentPage - 2
    );
    let endPage = Math.min(
        totalPages,
        startPage + maxVisiblePages - 1
    );

    startPage = Math.max(
        1,
        endPage - maxVisiblePages + 1
    );

    for (let i = startPage; i <= endPage; i++) {

        pages.push(i);
    }

    const pageButton = (page) => `

        <button
            type="button"
            class="
                btn
                btn-sm
                ${

                    page === currentPage

                    ?

                    'btn-primary'

                    :

                    'btn-outline-primary'

                }
                me-1
            "
            onclick="
                loadDashboardData(
                    '${currentTab}',
                    ${page}
                )
            "
        >

            ${page}

        </button>

    `;

    const disabledPrevious =
        currentPage === 1

            ?

            'disabled'

            :

            '';

    const disabledNext =
        currentPage === totalPages

            ?

            'disabled'

            :

            '';

    container.innerHTML = `

        <div
            class="
                portal-panel
                d-inline-flex
                flex-wrap
                align-items-center
                justify-content-center
                gap-1
                p-2
            "
        >

            <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                ${disabledPrevious}
                onclick="
                    loadDashboardData(
                        '${currentTab}',
                        ${currentPage - 1}
                    )
                "
            >
                <i class="bi bi-chevron-left"></i>
                Sebelumnya
            </button>

            ${

                startPage > 1

                    ?

                    pageButton(1)

                    :

                    ''

            }

            ${

                startPage > 2

                    ?

                    '<span class="px-2 text-muted">...</span>'

                    :

                    ''

            }

            ${pages.map(pageButton).join('')}

            ${

                endPage < totalPages - 1

                    ?

                    '<span class="px-2 text-muted">...</span>'

                    :

                    ''

            }

            ${

                endPage < totalPages

                    ?

                    pageButton(totalPages)

                    :

                    ''

            }

            <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                ${disabledNext}
                onclick="
                    loadDashboardData(
                        '${currentTab}',
                        ${currentPage + 1}
                    )
                "
            >
                Selanjutnya
                <i class="bi bi-chevron-right"></i>
            </button>

        </div>

        <div class="small text-muted mt-2">
            Halaman ${currentPage} dari ${totalPages}
        </div>

    `;
}



// ======================================
// SUMMARY
// ======================================

async function loadSummaryStats() {

    const response = await requestAPI(

        '/api/report/?tab=my_reports&page_size=1000'

    );

    if (response.status !== 200) return;

    const reports =
        response.data.results || [];

    const draft = reports.filter(
        r => r.status === 'DRAFT'
    ).length;

    const reported = reports.filter(
        r => r.status === 'REPORTED'
    ).length;

    const process = reports.filter(
        r => r.status === 'IN_PROGRESS'
    ).length;

    const done = reports.filter(
        r => r.status === 'RESOLVED'
    ).length;

    document.getElementById(
        'summaryContainer'
    ).innerHTML = `

        <div class="summary-row d-flex justify-content-between align-items-center">

            <span>Draf</span>

            <span class="badge bg-secondary">

                ${draft}

            </span>

        </div>



        <div class="summary-row d-flex justify-content-between align-items-center">

            <span>Diajukan</span>

            <span class="badge bg-warning">

                ${reported}

            </span>

        </div>



        <div class="summary-row d-flex justify-content-between align-items-center">

            <span>Diproses</span>

            <span class="badge bg-info">

                ${process}

            </span>

        </div>



        <div class="summary-row d-flex justify-content-between align-items-center">

            <span>Selesai</span>

            <span class="badge bg-success">

                ${done}

            </span>

        </div>

    `;
}



// ======================================
// OPEN MODAL
// ======================================

function openCreateModal() {

    editingReportId = null;

    document.getElementById(
        'reportForm'
    ).reset();

    const modal = bootstrap.Modal.getOrCreateInstance(

        document.getElementById(
            'reportModal'
        )
    );

    modal.show();
}



// ======================================
// EDIT DRAFT
// ======================================

async function editDraft(id) {

    const response = await requestAPI(

        `/api/report/${id}/`

    );

    if (response.status !== 200) {

        alert(
            'Gagal mengambil data laporan.'
        );

        return;
    }

    const report = response.data;

    editingReportId = id;

    document.getElementById(
        'title'
    ).value = report.title || '';

    document.getElementById(
        'category'
    ).value = report.category || '';

    document.getElementById(
        'description'
    ).value = report.description || '';

    document.getElementById(
        'location'
    ).value = report.location || '';

    const modal = bootstrap.Modal.getOrCreateInstance(

        document.getElementById(
            'reportModal'
        )
    );

    modal.show();
}



// ======================================
// SUBMIT REPORT
// ======================================

async function submitReport(status) {

    const payload = {

        title:
            document.getElementById(
                'title'
            ).value,

        category:
            document.getElementById(
                'category'
            ).value,

        description:
            document.getElementById(
                'description'
            ).value,

        location:
            document.getElementById(
                'location'
            ).value,

        status: status
    };

    const endpoint = editingReportId === null

        ?

        '/api/report/'

        :

        `/api/report/${editingReportId}/`;

    const method = editingReportId === null

        ?

        'POST'

        :

        'PUT';

    const response = await requestAPI(

        endpoint,

        method,

        payload
    );

    if (

        response.status === 200

        ||

        response.status === 201

    ) {

        const modalElement = document.getElementById(
            'reportModal'
        );

        bootstrap.Modal.getOrCreateInstance(

            modalElement

        ).hide();

        document.getElementById(
            'reportForm'
        ).reset();

        editingReportId = null;

        loadDashboardData(
            currentTab,
            currentPage
        );
    }
}
