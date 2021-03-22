const express = require('express');
const router = express.Router();
const { Video } = require("../models/Video");
const { Subscriber } = require('../models/Subscriber');

const { auth } = require("../middleware/auth");
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if(ext !== '.mp4') {
            return cb(res.status(400).end('only mp4 is allowed'), false);
        }
        cb(null, true)
    }
});

const upload = multer({ storage: storage }).single('file');

//=================================
//             video
//=================================

router.post('/uploadfiles', (req, res) => {
    upload(req, res, err => {
        if(err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })
});

router.post('/getVideoDetail', (req, res) => {
    Video.findOne({ "_id": req.body.videoId })
        .populate('writer')
        .exec((err, videoDetail) => {
            if(err) return res.status(400).send(err)
            return res.status(200).json({ success: true,  videoDetail})
        })
});

router.post('/uploadVideo', (req, res) => {
    const video = new Video(req.body)
    video.save((err, doc) =>{
        if(err) return res.json({ success: false, err })
        res.status(200).json({ success: true })
    })
});

router.get('/getVideos', (req, res) => {
    Video.find().populate('writer').exec((err, videos) => {
        if(err) return res.status(400).send(err);
        res.status(200).json({ success: true, videos})
    })
});

router.post('/getSubscriptionVideos', (req, res) => {
    //현재 자신의 아이디를 가지고 구독하는 사람들을 찾음
    Subscriber.find({ 'userFrom': req.body.userFrom })
        //subscriberInfo에 내가 구독하는 사람들의 정보가 담김
        .exec(( err, subscribers ) => {
            if(err) return res.status(400).send(err);
            //subscribeUser안에 구독하는 사람들에 해당하는 userTo의 정보가 다 담김    
            let subscribedUser = [];

            subscribers.map((subscriber, i) =>{
                subscribedUser.push(subscriber.userTo);
            })
    //위의 찾은 정보를 가지고 구독한 사람들의 비디오를 가지고 옴
    //req.body.id일 때는 한 명 일때만 가능 -> 여러명일 경우 몽고디비가 사진 기능 사용
    //$in 메소드 사용
    Video.find({ writer: { $in: subscribedUser }})
        .populate('writer')
        .exec((err, videos) => {
            if(err) return res.status(400).send(err);
            res.status(200).json({ success:true, videos })
        })
    })
});


router.post("/thumbnail", (req, res) => {

    let thumbsFilePath ="";
    let fileDuration ="";

    ffmpeg.ffprobe(req.body.filePath, function(err, metadata){
        fileDuration = metadata.format.duration;
    })

    ffmpeg(req.body.filePath)
        .on('filenames', function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
            thumbsFilePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () {
            console.log('Screenshots taken');
            return res.json({ success: true, thumbsFilePath: thumbsFilePath, fileDuration: fileDuration})
        })
        .on('error', function (err) {
            console.log(err);
            return res.json({ success: false, err })
        })
        .screenshots({
            count: 3,
            folder: 'uploads/thumbnails',
            size:'320x240',
            filename:'thumbnail-%b.png'
        });

});

module.exports = router;
