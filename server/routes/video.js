const express = require('express');
const router = express.Router();
const { Video } = require("../models/Video");

const { auth } = require("../middleware/auth");
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

// axios.post('/api/video/uploadfiles', formData, config)의 fonfig 부분에 들어감
let storage = multer.diskStorage({
    //파일을 올리면 uploads 폴더 내에 저장하는 것으로 지정
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    //저장할 때 파일명 [날짜_파일명]
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
    //동영상 파일이 아닌 경우 에러처리 
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if(ext !== '.mp4') {
            return cb(res.status(400).end('only mp4 is allowed'), false);
        }
        cb(null, true)
    }
});

//파일은 하나만 저장 할 수 있도록
const upload = multer({ storage: storage }).single('file');

//=================================
//             video
//=================================

//VideoUploadPage.js로 가서 
router.post('/uploadfiles', (req, res) => {
    upload(req, res, err => {
        if(err) {
            return res.json({ success: false, err })
        }
        //url:... -> uploads 폴더 안에 있는 파일의 경로를 클라이언트에 보내줌
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })
})

router.post('/uploadVideo', (req, res) => {
    //비디오 모든 정보를 몽고에 저장 
    const video = new Video(req.body)
    video.save((err, doc) =>{
        if(err) return res.json({ success: false, err })
        res.status(200).json({ success: true })
    })
})

router.post("/thumbnail", (req, res) => {

    let thumbsFilePath ="";
    let fileDuration ="";

    //비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.filePath, function(err, metadata){
        fileDuration = metadata.format.duration;
    })

    //썸네일 생성
    ffmpeg(req.body.filePath)
        //filename 생성
        .on('filenames', function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
            thumbsFilePath = "uploads/thumbnails/" + filenames[0];
        })
        //썸네일 생성 후 할 동작 지정
        .on('end', function () {
            console.log('Screenshots taken');
            return res.json({ success: true, thumbsFilePath: thumbsFilePath, fileDuration: fileDuration})
        })
        .on('error', function (err) {
            console.log(err);
            return res.json({ success: false, err })
        })
        //옵션 설정
        .screenshots({
            //3개의 썸네일 가능
            count: 3,
            //uploads 폴더 안에 thumbnails 폴더 안에 저장
            folder: 'uploads/thumbnails',
            size:'320x240',
            //썸네일 이름 지정
            filename:'thumbnail-%b.png'
        });

});

module.exports = router;
