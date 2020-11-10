//#region > Imports
// Contains all the functionality necessary to define React components
import React from "react";
//> Additional
// Used to display popovers on contrib chart items
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
// Used to display the time in a readable format
import moment from "moment";
//> MDB
// "Material Design for Bootstrap" is a great UI design framework
import { MDBRow, MDBCol } from "mdbreact";

//> Style sheet
import "./calendar2d.scss";
//#endregion

//#region > Constant Variables
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
//#endregion

//#region > Components
/** @class A two dimensional calendar which displays each days contributions */
class AIContribCalendar extends React.Component {
  constructor(props) {
    super(props);

    // Create reference to HTML canvas
    this.myInput = React.createRef();
    this.state = {
      width: 0,
      hue: 0,
      items: 54,
    };
  }

  componentDidMount = () => {
    // Fill calendar
    this.setCalendar(this.props);
    // Add resize listener
    window.addEventListener("resize", this.updateDimensions);
  };

  componentWillUnmount() {
    // Remove listener to prevent memory leak
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.year !== this.props.year) {
      this.setCalendar(this.props);
    }
  };

  updateDimensions = () => {
    this.setState({
      width: this.myInput.current.offsetWidth,
    });
  };

  setCalendar = async (props) => {
    // Get contribution data
    let contribData;

    if (props.year !== undefined) {
      contribData = props.platformData.years[props.year];
    } else {
      contribData = props.platformData.current;
    }

    this.setState({
      width: this.myInput.current.offsetWidth,
      contributionsList: contribData,
    });
  };

  getEachMonth = (pos) => {
    // Create new empty array
    let month = new Array();
    // Get current month
    let current;

    if (this.props.year !== undefined) {
      current = 0;
    } else {
      current = new Date().getMonth();
    }

    // Have each month two times
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Aug";
    month[8] = "Sep";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";
    month[12] = "Jan";
    month[13] = "Feb";
    month[14] = "Mar";
    month[15] = "Apr";
    month[16] = "May";
    month[17] = "Jun";
    month[18] = "Jul";
    month[19] = "Aug";
    month[20] = "Sep";
    month[21] = "Oct";
    month[22] = "Nov";
    month[23] = "Dec";

    return month[current + pos];
  };

  displayDailyInfo = (day, wkey, dkey) => {
    let cname = "item-" + wkey + "-" + dkey;

    if (day.total > 0 && day.total !== 1) {
      tippy(`.${cname}`, {
        content: `${day.total} contributions on ${moment(day.date).format(
          "MMM DD, YYYY"
        )}`,
      });
    } else if (day.total === 1) {
      tippy(`.${cname}`, {
        content: `${day.total} contribution on ${moment(day.date).format(
          "MMM DD, YYYY"
        )}`,
      });
    } else {
      tippy(`.${cname}`, {
        content: `No contributions on ${moment(day.date).format(
          "MMM DD, YYYY"
        )}`,
      });
    }
  };

  render() {
    if (this.props.platformData) {
      return (
        <div id="calendar2d">
          <MDBRow className="text-center">
            {MONTHS.map((month, key) => {
              return (
                <MDBCol size="months" key={key}>
                  <small>{this.getEachMonth(key)}</small>
                </MDBCol>
              );
            })}
          </MDBRow>
          <div ref={this.myInput}>
            <svg
              className="calendar"
              height={(this.state.width / this.state.items) * 7}
            >
              {this.state.contributionsList &&
                this.state.contributionsList.weeks.map((week, wkey) => {
                  return week.days.map((day, dkey) => {
                    if (wkey === 0) {
                      return (
                        <rect
                          key={wkey + "-" + dkey}
                          y={
                            (this.state.width / this.state.items) * 7 +
                            (this.state.width / this.state.items) * dkey -
                            week.days.length *
                              (this.state.width / this.state.items)
                          }
                          x={0}
                          width={this.state.width / this.state.items}
                          height={this.state.width / this.state.items}
                          className={"item-" + wkey + "-" + dkey}
                          onMouseOver={() =>
                            this.displayDailyInfo(day, wkey, dkey)
                          }
                          fill={day.color}
                        ></rect>
                      );
                    } else {
                      return (
                        <rect
                          key={wkey + "-" + dkey}
                          y={(this.state.width / this.state.items) * dkey}
                          x={(this.state.width / this.state.items) * wkey}
                          width={this.state.width / this.state.items}
                          height={this.state.width / this.state.items}
                          className={"item-" + wkey + "-" + dkey}
                          onMouseOver={() =>
                            this.displayDailyInfo(day, wkey, dkey)
                          }
                          fill={day.color}
                        ></rect>
                      );
                    }
                  });
                })}
            </svg>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}
//#endregion

//#region > Exports
//> Default Component
export default AIContribCalendar;
//#endregion

/**
 * SPDX-License-Identifier: (EUPL-1.2)
 * Copyright © 2020 Simon Prast
 */
