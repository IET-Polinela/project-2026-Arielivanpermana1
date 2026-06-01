const BASE_URL =
    "http://127.0.0.1:8000";





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



    if (token) {

        options.headers.Authorization =
            "Bearer " + token;

    }



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





async function getReports() {

    const response =
        await requestAPI(
            "/api/report/"
        );



    return response.data;

}





async function createReport(
    reportData
) {

    return await requestAPI(

        "/api/report/",

        "POST",

        reportData
    );

}