import * as actionTypes from './types';
export const checkout = {
    resetState:
        (props = {}) =>
            async (dispatch) => {
                dispatch({
                    type: actionTypes.RESET_STATE,
                });
            },
    get:
        () => async (dispatch) => {
            dispatch({ type: actionTypes.GET_ITEM })
        }
    ,
    create:
        ({ jsonData }) => ({
            type: actionTypes.ADD_ITEM,
            payload: jsonData
        })

};
