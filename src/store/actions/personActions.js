//#region > Imports
//> Action Types
import * as Action from "../types";
//> Intel
import INTEL_SNEK from "snek-intel/lib/utils/snek";
//#endregion

//#region > Person Actions
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

export { getPerson };