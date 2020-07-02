//#region > Authentication
/**
 * Handle login
 *
 * @param user A user to login with
 * @description Handles states for login
 */
const loginAction = (user) => {
  console.log("USER", user);
  console.log("run action");
  return (dispatch, getState, { getIntel }) => {
    try {
      const intel = getIntel();
      console.log(intel);

      const session = intel.snekclient.session;

      console.log(session);

      session
        .begin(user)
        .then((whoami) => {
          console.log("WHOAMI", whoami);
          if (whoami?.username !== process.env.REACT_APP_ANONYMOUS_USER) {
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: {
                username: whoami.username,
                avatarUrl:
                  "https://www.clipartmax.com/png/full/166-1669056_the-20-cooler-octocat-github-octocat.png",
              },
            });
          } else {
            console.log(whoami.username, process.env.REACT_APP_ANONYMOUS_USER);
            dispatch({
              type: "LOGIN_ANON_SUCCESS",
              payload: {},
            });
          }
        })
        .catch((ex) =>
          dispatch({ type: "LOGIN_ERROR", payload: { error: ex } })
        );
    } catch (ex) {
      console.log("ERRORRR");
      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorCode: 600, message: "Login failed", error: ex },
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
  return async (dispatch, getState, { getIntel }) => {
    try {
      const intel = getIntel();
      const session = intel.snekclient.session;
      await session
        .end()
        .then(() =>
          dispatch({
            type: "LOGOUT_SUCCESS",
            payload: {},
          })
        )
        .catch((ex) =>
          dispatch({ type: "LOGOUT_ERROR", payload: { error: ex } })
        );
    } catch (ex) {
      dispatch({
        type: "LOGOUT_FAILED",
        payload: {
          errorCode: 601,
          message: "Logout failed",
          error: ex,
        },
      });
    }
  };
};
//#endregion

//#region > Exports
export { loginAction, logoutAction };
//#endregion

/**
 * SPDX-License-Identifier: (EUPL-1.2)
 * Copyright © 2019-2020 Simon Prast
 */
