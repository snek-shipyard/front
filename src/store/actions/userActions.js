//#region > Imports
//> Action Types
import * as Action from "../types";
//> Intel
import INTEL_SNEK from "snek-intel/lib/utils/snek";
//#endregion

//#region > User Actions
/**
 * Handle login.
 *
 * @param user A user to login with
 * @description Handles states for login
 */
const loginAction = (user) => {
  return async (dispatch, getState, { CLIENT_SNEK }) => {
    try {
      dispatch({ type: Action.USER_LOGIN_REQUEST });

      const whoami = await CLIENT_SNEK.session.begin(user);

      if (!whoami?.anonymous && whoami?.__typename === "SNEKUser") {
        dispatch({
          type: Action.USER_LOGIN_SUCCESS,
          payload: {
            username: whoami.username,
            anonymous: false,
          },
        });

        dispatch(getPerson(whoami.username));
      } else if (whoami.anonymous) {
        dispatch({
          type: Action.USER_LOGIN_SUCCESS,
          payload: {
            anonymous: true,
          },
        });
      } else {
        throw Error("Login failed");
      }
    } catch (ex) {
      dispatch({
        type: Action.USER_LOGIN_FAILURE,
        payload: {
          errorCode: 619,
          message: "Login failed",
          error: ex,
        },
      });
    }
  };
};

/**
 * Logout user.
 *
 * @description Handles the logging out of active users
 */
const logoutAction = () => {
  return async (dispatch, getState, { CLIENT_SNEK }) => {
    try {
      dispatch({ type: Action.USER_LOGOUT_REQUEST });

      await CLIENT_SNEK.session.end();

      dispatch({ type: Action.USER_LOGOUT_SUCCESS });
    } catch (ex) {
      dispatch({
        type: Action.USER_LOGOUT_FAILURE,
        payload: {
          errorCode: 601,
          message: "Logout failed",
          error: ex,
        },
      });
    }
  };
};

/**
 * Get person page for a logged user
 */
const getPerson = (personName) => {
  return async (dispatch, getState, {}) => {
    try {
      dispatch({ type: Action.USER_PERSON_GET_REQUEST });

      const person = await INTEL_SNEK.person.get({ personName });

      dispatch({ type: Action.USER_PERSON_GET_SUCCESS, payload: person });
    } catch (ex) {
      dispatch({
        type: Action.USER_PERSON_GET_FAILURE,
        payload: {
          errorCode: 601,
          message: `Getting person (${personName}) failed`,
          error: ex,
        },
      });
    }
  };
};
//#endregion

//#region > Exports
export { loginAction, logoutAction, getPerson };
//#endregion

/**
 * SPDX-License-Identifier: (EUPL-1.2)
 * Copyright © 2019-2020 Simon Prast
 */