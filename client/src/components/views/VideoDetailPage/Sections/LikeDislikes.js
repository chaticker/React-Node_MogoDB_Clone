import React, { useEffect, useState } from 'react'
import { Tooltip, Icon } from 'antd';
import Axios from 'axios';

function LikeDislikes(props) {

    const [Likes, setLikes] = useState(0)
    const [Dislikes, setDislikes] = useState(0)
    const [LikeAction, setLikeAction] = useState(null)
    const [DislikeAction, setDislikeAction] = useState(null)

    let variable = {};

    if (props.video) {//비디오 아이디: VideoDetailPage에서 옴
        variable = { videoId: props.videoId, userId: props.userId }
    } else {//코멘트 아이디(나중에)
        variable = { commentId: props.commentId, userId: props.userId }
    }

    useEffect(() => {

        Axios.post('/api/like/getLikes', variable)
            .then(response => {
                if (response.data.success) {
                    //얼마나 많은 좋아요 수를 받았는지(length)
                    setLikes(response.data.likes.length)
                    //내가 이미 해당 비디오의 좋아요를 눌렀는지 확인
                    //response.data.likes: 많은 사람들이 누른 좋아요 정보 중에
                    response.data.likes.map(like => {
                        //response.data.likes 중에 나의 userId가 있다면
                        //즉, 내가 해당 좋아요를 누른 적이 있다면 눌렀다고 표시하기
                        if (like.userId === props.userId) {
                            setLikeAction('liked')
                        }
                    })
                } else {
                    alert('like 정보 로드 실패')
                }
            })

        //dislike: like와 똑같은 과정이지만 결과를 반대로 나오게 하면 됨
        Axios.post('/api/like/getDislikes', variable)
            .then(response => {
                console.log('getDislike',response.data)
                if (response.data.success) {
                    setDislikes(response.data.dislikes.length)
                    response.data.dislikes.map(dislike => {
                        if (dislike.userId === props.userId) {
                            setDislikeAction('disliked')
                        }
                    })
                } else {
                    alert('dislikes 정보 로드 실패')
                }
            })
    }, [])

    //좋아요 버튼 클릭 시 실행 할 함수
    const onLike = () => {
        //좋아요 안 되어 있을 때
        if (LikeAction === null) {
            Axios.post('/api/like/upLike', variable)
                .then(response => {
                    if (response.data.success) {
                        //좋아요 카운트 올리고
                        setLikes(Likes + 1)
                        //좋아요된 상태로 만들기
                        setLikeAction('liked')
                        //dislike가 이미 클리되어 있었던 경우
                        //클릭이 안 되어 있게 해주고, 카운트를 감소시킴
                        if (DislikeAction !== null) {
                            setDislikeAction(null)
                            setDislikes(Dislikes - 1)
                        }
                    } else {
                        alert('좋아요 증가 실패')
                    }
                })


        } else { //좋아요 되어 있을 때: 없애야 하니까 unLike로 보내줌
            Axios.post('/api/like/unLike', variable)
                .then(response => {
                    if (response.data.success) {
                        setLikes(Likes - 1)
                        setLikeAction(null)
                    } else {
                        alert('좋아요 감소 실패')
                    }
                })
            }
        }

    //싫어요 버튼 클릭 시 실행 할 함수
    const onDisLike = () => {
        if (DislikeAction !== null) {
            Axios.post('/api/like/unDisLike', variable)
                .then(response => {
                    if (response.data.success) {
                        setDislikes(Dislikes - 1)
                        setDislikeAction(null)
                    } else {
                        alert('싫어요 감소 실패')
                    }
                })
        } else { 
            Axios.post('/api/like/upDisLike', variable)
                .then(response => {
                    if (response.data.success) {
                        setDislikes(Dislikes + 1)
                        setDislikeAction('disliked')
                        if(LikeAction !== null ) {
                            setLikeAction(null)
                            setLikes(Likes - 1)
                        }
                    } else {
                        alert('싫어요 증가 실패')
                    }
                })
            }
        }

    return (
        <React.Fragment>
            <span key="comment-basic-like">
                <Tooltip title="Like">
                    <Icon type="like"
                        //클릭했을 때 'liked'이면 색 채워짐
                        theme={LikeAction === 'liked' ? 'filled' : 'outlined'}
                        onClick={onLike} />
                </Tooltip>
                <span style={{ paddingLeft: '8px', cursor: 'auto' }}>{Likes}</span>
            </span>&nbsp;&nbsp;
            <span key="comment-basic-dislike">
                <Tooltip title="Dislike">
                    <Icon
                        type="dislike"
                        //클릭했을 때 'disliked'이면 색 채워짐
                        theme={DislikeAction === 'disliked' ? 'filled' : 'outlined'}
                        onClick={onDisLike}
                    />
                </Tooltip>
                <span style={{ paddingLeft: '8px', cursor: 'auto' }}>{Dislikes}</span>
            </span>
        </React.Fragment>
    )
}

export default LikeDislikes