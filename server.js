const app  = require('express')()
const express = require('express');
const http = require('http').createServer(app)
const cors = require('cors')
const mongoose = require('mongoose');
const userModel = require(__dirname + '/models/User');

const gmModel = require(__dirname + '/models/Message');

const PORT = 9000 || process.env.PORT;

//create server side socket
const io = require('socket.io')(http)

app.use(cors())
users = []

io.on('connection', (socket) => {
  console.log('Connected ')
  socket.emit('welcome', 'Welcome to Socket Programming : ' + socket.id)
  socket.on('message', async (data) => {
    const message = {
      username: data.username,
      message: data.message
    }
    socket.broadcast.to(data.room).emit('newMessage', message)

    console.log(`${data.username} send a message to ${data.room}`)
    try {
      const newMsg = gmModel({
        from_user: data.username,
        room: data.room,
        message: data.message
      })
      await newMsg.save()
    }
    catch (e) {
      throw new Error(e.message)
    }
  })
    //Get User name
    socket.on('newUser', (name) => {
        if(!users.includes(name)){
            users.push(name)
        }
        socket.id = name
    })
    
    //Group/Room Join
    socket.on('joinroom', (room,username) => {
        socket.join(room)
        socket.broadcast.to(room).emit('joined', username)
    })
    socket.on('leaveRoom', (room, username) =>{
      socket.broadcast.to(room).emit('left', username)
    })
    //Disconnected
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
    })
  })


app.use(
    express.urlencoded({
      extended: true
    })
  )
  
app.use(express.json());
mongoose.connect('mongodb+srv://namya09:namya09@comp3123.ckb9j.mongodb.net/db_f2021_comp3123?retryWrites=true&w=majority', 
{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(success => {
  console.log('Success Mongodb connection')
})
.catch(err => {
  console.log('Error Mongodb connection')
});





app.post('/login', async (req, res) => {
    const user = new userModel(req.body);
    try {
      await user.save((err) => {
        if(err){
            if (err.code === 11000) {
               return res.redirect('/signup?err=username')
            }
          
          res.send(err)
        }else{
          res.sendFile(__dirname + '/login.html')
        }
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html")
})

app.post('/', async (req, res) => {
    const username=req.body.username
    const password=req.body.password

    const user = await userModel.find({username:username});
    try {
        if(user.length != 0){
        if(user[0].password==password){
            return res.redirect('/?uname='+username)
        }
        else{
            return res.redirect('/login?wrong=pass')
        }
        }else{
        return res.redirect('/login?wrong=uname')
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
app.get("/index", (req,res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.get("/main", (req, res) => {
    res.sendFile(__dirname + "/main.html")
})


app.get('/main/:room', async (req, res) => {
    const room = req.params.room
    const msg = await gmModel.find({room: room}).sort({'date_sent': 'desc'}).limit(10);
    res.sendFile(__dirname + '/main.html')
  });



app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html")
})

app.post("/chathistory",async(req,res)=>{
  try {
    const { room } = req.body
    const result = await gmModel.find({ room: room})
    res.status(200).send(result)
}
catch (e) {
    res.status(400).send({ error: e.message });
}
})


http.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})