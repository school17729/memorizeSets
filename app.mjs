import http from "http";
import fs from "fs";
import path from "path";

const port = 3001;

const fileType = new Map();
fileType.set(".html", "text/html");
fileType.set(".css", "text/css");
fileType.set(".js", "text/javascript");
fileType.set(".png", "image/png");
fileType.set(".jpg", "image/jpeg");

const defaultFile = "index.html";

const server = http.createServer((req, res) => {
    
    let requestUrl = "." + req.url;
    if (requestUrl === "./") {
        requestUrl = "./" + defaultFile;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    fs.readFile(requestUrl, (error, data) => {
        if (error) {
            res.writeHead(404);
            res.write("[ERROR]: " + requestUrl + " NOT FOUND");
        } else {
            res.writeHead(200, { "Content-Type": fileType.get(path.extname(requestUrl)) });
            res.write(data);
        }
        res.end();
    });
});

server.listen(port, (error) => {
    if (error) {
        console.log("Something went wrong.", error);
    } else {
        console.log("Server is listening on port " + port);
    }
});
