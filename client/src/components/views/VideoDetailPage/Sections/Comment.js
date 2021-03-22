import Axios from 'axios';
import React, { useState } from 'react';
import {useSelector} from 'react-redux';
import SingleComment from './SingleComment';

function Comment(props) {
    //redux 안에 있는 state에서 사용자 정보를 가져와서 변수에 넣기
    const user = useSelector(state => state.user);
    const [Comment, setComment] = useState("")

    const handleClick = (event) => {
        setComment(event.currentTarget.value)
    }
    const onSubmit = (event) => {
        //아무것도 안 쓴 상태에서 누르면 페이지가 리프레시 되기 때문에 안되게 막기
        event.preventDefault();

        const variables = {
            content: Comment,
            writer: user.userData._id,
            postId: props.postId
        }

        Axios.post('/api/comment/saveComment', variables)
            .then(response => {
                if(response.data.success){
                    setComment("")
                    //VideoDetailPage의 Comments 상태를 수정해줘야 함
                    //refreshFuction의 newComments 값으로 넘겨줌
                    props.refreshFunction(response.data.result)
                } else {
                    alert('코멘트 저장 실패')
                }
            })
    }

    return (
        <div>
            <br />
            <p>Comment</p>
            <hr />
            {/* Comment Lists  */}

            {props.CommentLists && props.CommentLists.map((comment, index) => (
                (!comment.responseTo &&
                    <SingleComment refreshFunction={props.refreshFunction} comment={comment} postId={props.postId} />    
                )
            ))}

            {/* Root Comment Form */}
            <form style={{ display: 'flex' }} onSubmit={onSubmit}>
                <textarea
                    style={{ width: '100%', borderRadius: '5px' }}
                    onChange={handleClick}
                    value={Comment}
                    placeholder="코멘트를 작성해주세요."
                />
                <br />
                <button style={{ width: '20%', height: '52px' }} onClick={onSubmit}>Submit</button>
            </form>
        </div>
    )
}

export default Comment
