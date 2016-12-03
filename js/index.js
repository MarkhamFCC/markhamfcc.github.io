"use strict";

var leaderboard = document.getElementById("leaderboard");
var daniel = "http://www.freecodecamp.com/profoundhub";
var recent = "https://fcctop100.herokuapp.com/api/fccusers/top/recent";
var alltime = "https://fcctop100.herokuapp.com/api/fccusers/top/alltime";

var TableTop = React.createClass({
  displayName: "TableTop",

  change: function change(x) {
    this.props.changeSrc(x);
  },

  render: function render() {
    var _this = this;

    return React.createElement(
      "tr",
      { id: "header" },
      React.createElement(
        "th",
        null,
        React.createElement("i", { className: "fa fa-heartbeat", "aria-hidden": "true" }),
        " Rank"
      ),
      React.createElement(
        "th",
        null,
        React.createElement("i", { className: "fa fa-github-alt", "aria-hidden": "true" }),
        " Avatar"
      ),
      React.createElement(
        "th",
        null,
        React.createElement("i", { className: "fa fa-users", "aria-hidden": "true" }),
        " UserName"
      ),
      React.createElement(
        "th",
        { onClick: function onClick() {
            return _this.change(recent);
          } },
        React.createElement("i", { className: "fa fa-area-chart", "aria-hidden": "true" }),
        React.createElement(
          "a",
          { className: "hvr-pulse" },
          "Recent"
        )
      ),
      React.createElement(
        "th",
        { onClick: function onClick() {
            return _this.change(alltime);
          } },
        React.createElement("i", { className: "fa fa-line-chart", "aria-hidden": "true" }),
        React.createElement(
          "a",
          { className: "hvr-pulse" },
          "All Time"
        )
      )
    );
  }
});

var Template = React.createClass({
  displayName: "Template",

  render: function render() {
    return React.createElement(
      "tr",
      null,
      React.createElement(
        "td",
        null,
        this.props.index,
        "."
      ),
      React.createElement(
        "td",
        { className: "user" },
        React.createElement(
          "p",
          null,
          React.createElement(
            "a",
            { href: "https://www.freecodecamp.com/" + this.props.data["username"], target: "_blank", className: "fullOp" },
            React.createElement("img", { className: "fullOp", src: this.props.data["img"] })
          )
        )
      ),
      React.createElement(
        "td",
        { className: "user" },
        React.createElement(
          "p",
          null,
          React.createElement(
            "a",
            { href: "https://www.freecodecamp.com/" + this.props.data["username"], target: "_blank", className: "userNames" },
            this.props.data["username"]
          )
        )
      ),
      React.createElement(
        "td",
        null,
        React.createElement(
          "p",
          null,
          this.props.data["recent"],
          " ",
          React.createElement("i", { className: "fa fa-diamond", "aria-hidden": "true" })
        )
      ),
      React.createElement(
        "td",
        null,
        React.createElement(
          "p",
          null,
          this.props.data["alltime"],
          " ",
          React.createElement("i", { className: "fa fa-trophy", "aria-hidden": "true" })
        )
      )
    );
  }
});

var LeaderBoard = React.createClass({
  displayName: "LeaderBoard",

  getInitialState: function getInitialState() {
    return {
      source: recent,
      data: []
    };
  },

  componentDidMount: function componentDidMount() {
    this.changeSrc(this.state.source);
  },

  changeSrc: function changeSrc(x) {
    this.serverRequest = $.get(x, function (result) {
      this.setState({
        data: result
      });
    }.bind(this));
  },

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h1",
        { className: "center-this" },
        "Build an FCC Camper Leaderboard!"
      ),
      React.createElement(
        "table",
        { className: "table gradeLogic" },
        React.createElement(TableTop, { changeSrc: this.changeSrc.bind(this) }),
        this.state.data.map(function (curr, index) {
          return React.createElement(Template, { index: index + 1, data: curr });
        })
      )
    );
  }
});

var Footer = React.createClass({
  displayName: "Footer",

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement("br", null),
      React.createElement("hr", null),
      React.createElement("br", null),
      React.createElement(
        "footer",
        { className: "well alert alert-success" },
        React.createElement(
          "p",
          { className: "text-center" },
          "© 2016 -- ",
          React.createElement(
            "a",
            { href: daniel, target: "_blank", className: "userNames" },
            "Daniel Lim"
          ),
          " | Profound Ideation Inc. | All Rights Reserved"
        )
      )
    );
  }
});

ReactDOM.render(React.createElement(
  "div",
  null,
  React.createElement(LeaderBoard, null),
  React.createElement(Footer, null)
), leaderboard);