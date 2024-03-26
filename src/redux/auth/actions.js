import * as actionTypes from './types';
import * as authService from '@/auth';

import history from '@/utils/history';

export const login =
  ({ loginData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.LOADING_REQUEST,
        payload: { loading: true },
      });
      const data = await authService.login({ loginData });

      if (data.success === true) {
        console.log('%cfrontend\src\redux\auth\actions.js:16 data.result', 'color: #007acc;', data.result);
        window.localStorage.setItem('isLoggedIn', true);
        window.localStorage.setItem('auth', JSON.stringify(data.result.admin));
        window.localStorage.setItem('company_id', data.result.company_id);
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: data.result.admin,
        });
        history.push('/');
      } else {
        dispatch({
          type: actionTypes.FAILED_REQUEST,
          payload: data,
        });
      }
    };

export const logout = () => async (dispatch) => {
  authService.logout();
  dispatch({
    type: actionTypes.LOGOUT_SUCCESS,
  });
  // history.push('/login');
  window.location.href = window.location.origin
};
