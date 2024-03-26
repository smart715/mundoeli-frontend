import axios from 'axios';
import { REQUEST_LOADING } from '../erp/types';
import * as actionTypes from './types';
import { request } from '@/request';
import { API_BASE_URL } from '@/config/serverApiConfig';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
export const crud = {
  resetState:
    (props = {}) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.RESET_STATE,
        });
      },
  resetAction:
    ({ actionType }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.RESET_ACTION,
          keyState: actionType,
          payload: null,
        });
      },
  currentItem:
    ({ data }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.CURRENT_ITEM,
          payload: { ...data },
        });
      },
  currentAction:
    ({ actionType, data }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.CURRENT_ACTION,
          keyState: actionType,
          payload: { ...data },
        });
      },
  list:
    ({ entity, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'list',
          payload: null,
        });

        let data = await request.list({ entity, options });

        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'list',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'list',
            payload: null,
          });
        }
      }
  ,
  listById:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listById',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listById',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listById',
            payload: null,
          });
        }
      },
  listByEmergency:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByEmergency',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByEmergency',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByEmergency',
            payload: null,
          });
        }
      },
  listByMedical:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByMedical',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByMedical',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByMedical',
            payload: null,
          });
        }
      },
  listByContract:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByContract',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByContract',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByContract',
            payload: null,
          });
        }
      },
  listByCustomer:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByCustomer',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByCustomer',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByCustomer',
            payload: null,
          });
        }
      },
  listByRecurrent:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByRecurrent',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByRecurrent',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByRecurrent',
            payload: null,
          });
        }
      },
  listByCustomerContact:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByCustomerContact',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByCustomerContact',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByCustomerContact',
            payload: null,
          });
        }
      },
  listByCustomerStores:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByCustomerStores',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByCustomerStores',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByCustomerStores',
            payload: null,
          });
        }
      },
  listByAssignedEmployee:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByAssignedEmployee',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByAssignedEmployee',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByAssignedEmployee',
            payload: null,
          });
        }
      },
  listByInvoice:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByInvoice',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByInvoice',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByInvoice',
            payload: null,
          });
        }
      },
  listByCustomerReversation:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByCustomerReversation',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByCustomerReversation',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByCustomerReversation',
            payload: null,
          });
        }
      },
  listByDocument:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByDocument',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByDocument',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByDocument',
            payload: null,
          });
        }
      },
  listByEDocument:
    ({ entity, jsonData, options = { page: 1 } }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'listByEDocument',
          payload: null,
        });

        let data = await request.listById({ entity, jsonData, options });
        if (data.success === true) {
          const result = {
            items: data.result,
            pagination: {
              current: parseInt(data.pagination.page, 10),
              pageSize: 10,
              showSizeChanger: false,
              total: parseInt(data.pagination.count, 10),
            },
          };
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'listByEDocument',
            payload: result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'listByEDocument',
            payload: null,
          });
        }
      },
  create:
    ({ entity, jsonData }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'create',
          payload: null,
        });

        let data = await request.create({ entity, jsonData });

        if (data.success === true) {
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'create',
            payload: data.result,
          });

          dispatch({
            type: actionTypes.CURRENT_ITEM,
            payload: data.result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'create',
            payload: null,
          });
        }
      },
  read:
    ({ entity, id }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'read',
          payload: null,
        });

        let data = await request.read({ entity, id });
        if (data.success === true) {
          dispatch({
            type: actionTypes.CURRENT_ITEM,
            payload: data.result,
          });
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'read',
            payload: data.result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'read',
            payload: null,
          });
        }
      },
  update:
    ({ entity, id, jsonData }) =>

      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'update',
          payload: null,
        });

        let data = await request.update({ entity, id, jsonData });

        if (data.success === true) {
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'update',
            payload: data.result,
          });
          dispatch({
            type: actionTypes.CURRENT_ITEM,
            payload: data.result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'update',
            payload: null,
          });
        }
      },

  delete:
    ({ entity, id }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'delete',
          payload: null,
        });

        let data = await request.delete({ entity, id });

        if (data.success === true) {
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'delete',
            payload: data.result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'delete',
            payload: null,
          });
        }
      },

  search:
    ({ entity, options = {} }) =>
      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'search',
          payload: null,
        });

        let data = await request.search({ entity, options });

        if (data.success === true) {
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            keyState: 'search',
            payload: data.result,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
            keyState: 'search',
            payload: null,
          });
        }
      },
  upload:
    ({ entity, jsonData }) =>

      async (dispatch) => {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
          keyState: 'avatarUpload',
          payload: null
        });

        try {
          let res = await request.upload({ entity, jsonData });
          dispatch({
            type: 'UPLOAD_AVATAR_SUCCESS',
            payload: res.data,
          })
        } catch (error) {
          dispatch({
            type: 'UPLOAD_AVATAR_FAIL',
            payload:
              error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
          });

        }

      }
};
