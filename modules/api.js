const host = "https://webdev-hw-api.vercel.app/api/v1/artyom-kovalchuk/comments";

export function getDataFromAPI() {
    return fetch(host,
        {
            method: "GET",
        })
        .then((response) => {
            const jsonPromise = response.json();
            return jsonPromise;
        })
}

export function sendDataToAPI(newComment) {
    return fetch(host,
        {
            method: "POST",
            body: JSON.stringify(newComment),
        })
}