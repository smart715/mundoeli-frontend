import * as actionTypes from './types';

const INITIAL_KEY_STATE = {
    result: null,
    current: null,
    isLoading: false,
    isSuccess: false,
};

const INITIAL_STATE = {
    currentItem: null,
    items: []
};

const checkoutReducer = (state = INITIAL_STATE, action) => {
    const { payload, keyState } = action;
    switch (action.type) {
        case actionTypes.RESET_STATE:
            return INITIAL_STATE;
        case actionTypes.ADD_ITEM:
            return {
                ...state,
                items: action.payload
            };
        case actionTypes.GET_ITEM:
            return state;
        default:
            return state;
    }
};

export default checkoutReducer;
