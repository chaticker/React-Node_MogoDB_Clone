import {
    LOGIN_USER,
    REGISTER_USER,
    AUTH_USER,
    LOGOUT_USER,
} from '../_actions/types';
 
//새로운 state 지정하는 부분 즉, 변화를 일으키는 부분
//현재 상태, 전달 받은 액션을 참고해서 새로운 state 만들어냄
export default function(state={}, action){
    switch(action.type){
        case REGISTER_USER:
            return {...state, register: action.payload }
        case LOGIN_USER:
            return { ...state, loginSuccess: action.payload }
        case AUTH_USER:
            return {...state, userData: action.payload }
        case LOGOUT_USER:
            return {...state }
        default:
            return state;
    }
}