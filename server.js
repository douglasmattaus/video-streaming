const express = require('express');
const fs = require("fs");
const fsExtra = require('fs-extra');
const app = express();
const port = process.env.PORT || 3000
const server = app.listen(port);
const path = require('path')

const socket = require('socket.io');
const io = socket(server);

var fileName

const multer = require('multer')
const storageVideo = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'videos')
    },

    filename: (req, file, cb)=>{
        console.log(file)
        fsExtra.emptyDirSync('videos/');
        fileName = Date.now() + path.extname(file.originalname)
        cb(null, fileName)
    }
})

const storageAudio = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'audios')
    },

    filename: (req, file, cb)=>{
        console.log(file)
        fsExtra.emptyDirSync('audios/');
        fileName = Date.now() + path.extname(file.originalname)
        cb(null, fileName)
    }
})
const uploadAudio = multer({storage: storageAudio})
const uploadVideo = multer({storage: storageVideo})



app.use(express.static('public'));

app.use('/images', express.static('images'));
app.use('/audios', express.static('audios'));
app.use('/videos', express.static('videos'));



io.sockets.on('connection', (socket)=>{
    console.log('Usuário conectado')

    app.post('/recording', uploadAudio.any("audio"), async (req, res)=>{
        console.log(fileName)
        
        const audioPath = `audios/${fileName}`
        socket.broadcast.emit('recording', audioPath)
        res.send({recording:true})
    })

    app.post('/recordingVideo', uploadVideo.any("video"), async (req, res)=>{
        console.log(fileName)
        
        const videoPath = `videos/${fileName}`
        socket.broadcast.emit('recordingVideo', videoPath)
        res.send({recording:true})
    })

    socket.on('image-encoded', (image)=>{
        //console.log(image)
        const imagePath = `images/camera${Date.now()}.jpg`
        const buffer = Buffer.from(image, "base64");
        fsExtra.emptyDirSync('images/');
        fs.writeFileSync(imagePath, buffer);
        socket.broadcast.emit('new-image', imagePath)
    })


})
