const http = require("http");
const PORT = 8080;

// a function that handles requests and sends response

const requestHandler = function(request, response) {
  console.log('In requestHandler'); // NEW LINE
  response.end(`Requested Path: ${request.url}\nRequest Method: ${request.method}`);
};

const server = http.createServer(requestHandler);
console.log('Server created'); // NEW LINE


server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});

console.log('Last line (after .listen call)'); // NEW LINE
