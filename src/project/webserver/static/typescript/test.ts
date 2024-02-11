let helloworld:string = "Hello World!\nTypeScript is working :)";
alert(helloworld);

let url:string = "/api/test/";
fetch(url).then(response => response.json()).then(json => alert(json["msg"]));

let payload: string = "Hello from the frontend!";
fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: payload
}).then(response => response.json()).then(
    json => {
        alert(json["msg"]);
        if (payload != json["echo"]) {
            alert("Error: Payloads do not match");
        }
    }
);
