const app  = require('express')()
const http = require('http').createServer(app)
const cors = require('cors')

const PORT = 9000 || process.env.PORT;

//create server side socket
const io = require('socket.io')(http)

app.use(cors())

app.get('/',(req,res) =>{
    res.send("<h1>Welcome to the socket programing</h1>")
})

app.get("/index.html", (req,res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.get("/main.html", (req, res) => {
    res.sendFile(__dirname + "/main.html")
})

http.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})