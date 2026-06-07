const BASE_URL =
    "http://127.0.0.1:8000";



// ======================================
// REQUEST API
// ======================================

async function requestAPI(

    endpoint,
    method = "GET",
    bodyData = null

) {

    const token =
        localStorage.getItem(
            "access_token"
        );



    const options = {

        method: method,

        headers: {
            "Content-Type":
                "application/json"
        }

    };



    // JWT token
    if (token) {

        options.headers.Authorization =
            "Bearer " + token;

    }



    // body
    if (bodyData) {

        options.body =
            JSON.stringify(bodyData);

    }



    try {

        const response =
            await fetch(

                BASE_URL + endpoint,

                options
            );



        // DELETE 204
        if (
            response.status === 204
        ) {

            return {

                status: 204,

                data: null

            };

        }



        const data =
            await response.json();



        return {

            status:
                response.status,

            data:
                data

        };

    }

    catch (error) {

        console.log(error);



        return {

            status: 500,

            data: null

        };

    }

}



// ======================================
// GET REPORTS
// ======================================

async function getReports(
    tab = "my_reports",
    page = 1
) {

    const response =
        await requestAPI(

            `/api/report/?tab=${tab}&page=${page}`

        );



    return response.data;

}



// ======================================
// CREATE REPORT
// ======================================

async function createReport(
    reportData
) {

    return await requestAPI(

        "/api/report/",

        "POST",

        reportData
    );

}