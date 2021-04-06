import { combineReducers } from 'redux';
import user from './user_reducer';

//여기가 스토어
//스토어 안에는, 현재의 앱 상태와, 리듀서가 들어가있음
//-> dispatch의 변화를 감지한 후 새로운 액션 값을 받아옴
//최종적으로 리듀서 함수를 실행시켜 해당 액션을 처리함
const rootReducer = combineReducers({
    user,
});

export default rootReducer;