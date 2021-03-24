import React, { useEffect, useState } from 'react'
import { Row, Col, List, Avatar } from 'antd';
import Axios from 'axios';
import SideVideo from './Sections/SideVideo';
import Subscribe from './Sections/Subscribe';
import Comment from './Sections/Comment';
import LikeDislikes from './Sections/LikeDislikes';

function VideoDetailPage(props) {

    const videoId = props.match.params.videoId
    const variable = { videoId: videoId }

    const [videoDetail, setVideoDetail] = useState([])
    const [CommentLists, setCommentLists] = useState([])

    useEffect(() => {
        Axios.post('/api/video/getVideoDetail', variable)
            .then(response => {
                if(response.data.success) {
                    setVideoDetail(response.data.videoDetail)
                } else {
                    alert('비디오 정보 로드 실패')
                }
            })

        Axios.post('/api/comment/getComments', variable)
            .then(response => {
                if(response.data.success) {
                    setCommentLists(response.data.comments)
                } else {
                    alert('댓글 로드 실패')
                }
            })
            
    }, [])

    const refreshFunction = (newComments) => { 
        setCommentLists(CommentLists.concat(newComments))
    }

    if( videoDetail.writer ){

        const subscribeButton = videoDetail.writer._id !== localStorage.getItem('userId') && <Subscribe userTo={videoDetail.writer._id} userFrom={localStorage.getItem('userId')} />

        return (
            <Row gutter={[16, 16]}>
                <Col lg={18} xs={24}>
                    <div style={{ width: '100%', padding: '3rem 4rem' }}>
                        <video style={{ width: '100%' }} src={`http://localhost:5000/${videoDetail.filePath}`} controls></video>
                        <List.Item
                            //userTo를 Subscribe 컴포넌트로 보내기
                            actions={[ <LikeDislikes video userId={localStorage.getItem('userId')} videoId={videoId}/>, subscribeButton ]}
                        > 
                            <List.Item.Meta
                                avatar={<Avatar src={videoDetail.writer.image} />}
                                title={videoDetail.writer.name}
                                description={videoDetail.description}
                            />
                        </List.Item>
                        <Comment refreshFunction={refreshFunction} CommentLists={CommentLists} postId={props.postId}/>
                    </div>
                </Col>

                <Col lg={6} xs={24}>
                    <SideVideo />
                </Col>
            </Row>
        )
    } else {
        return (
            <div>...loading</div>
        )
    }
}

export default VideoDetailPage
