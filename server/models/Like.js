const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    // commentId: { //comment 좋아요
    //     ref:'Comment'
    // },
    videoId: {
        type: Schema.Types.ObjectId,
        ref:'Video'
    }

}, { timestamps: true })


const Like = mongoose.model('Like', likeSchema);

module.exports = { Like }