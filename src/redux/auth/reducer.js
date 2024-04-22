import * as actionTypes from './types';

const INITIAL_STATE = {
  current: {},
  loading: false,
  isLoggedIn: false,
  is_admin: false,
  is_primary_company: false,
  company_id: null
};

const authReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case actionTypes.LOADING_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case actionTypes.FAILED_REQUEST:
      return INITIAL_STATE;

    case actionTypes.LOGIN_SUCCESS:
      return {
        current: action.payload,
        loading: false,
        isLoggedIn: true,
        is_admin: action.payload.is_admin,
        is_primary_company: action.payload.is_primary_company,
        company_id: action.payload.company_id
      };
    case actionTypes.LOGOUT_SUCCESS:
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default authReducer;
