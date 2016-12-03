const leaderboard = document.getElementById("leaderboard");
const daniel = "http://www.freecodecamp.com/profoundhub";
const recent = "https://fcctop100.herokuapp.com/api/fccusers/top/recent";
const alltime = "https://fcctop100.herokuapp.com/api/fccusers/top/alltime";

let TableTop = React.createClass({
  change: function(x) {
    this.props.changeSrc(x);
  },
  
  render: function() {
    return (
      <tr id="header">
        <th><i className="fa fa-heartbeat" aria-hidden="true"></i> Rank</th>
        <th><i className="fa fa-github-alt" aria-hidden="true"></i> Avatar</th>
        <th><i className="fa fa-users" aria-hidden="true"></i> UserName</th>       
        
        <th onClick = { () => this.change(recent) }>          
          <i className="fa fa-area-chart" aria-hidden="true"></i> 
            <a className="hvr-pulse">Recent</a>
        </th>
        
        <th onClick = { () => this.change(alltime) }>          
          <i className="fa fa-line-chart" aria-hidden="true"></i>
            <a className="hvr-pulse">All Time</a>
        </th>
        
      </tr>
    );
  }
});

let Template = React.createClass({
  render: function() {
    return (
      <tr>
        <td>
          { this.props.index }.
        </td>
        <td className="user">
          <p>
            <a href={"https://www.freecodecamp.com/" + this.props.data["username"] } target="_blank" className="fullOp"><img className="fullOp" src={ this.props.data["img"] } /></a>
          </p>
        </td>
        <td className="user">
          <p>
            <a href={"https://www.freecodecamp.com/" + this.props.data["username"] } target="_blank" className="userNames">{ this.props.data["username"] }</a>
          </p>
        </td>
        <td>
          <p>
            { this.props.data["recent"] } <i className="fa fa-diamond" aria-hidden="true"></i>
          </p>
        </td>
        <td>
          <p>
            { this.props.data["alltime"] } <i className="fa fa-trophy" aria-hidden="true"></i>
          </p>
        </td>
      </tr>
    );
  }
});

var LeaderBoard = React.createClass({
  getInitialState: function() {
    return {
      source: recent,
      data: [],
    };
  },

  componentDidMount: function() {
    this.changeSrc(this.state.source);    
  },

  changeSrc: function(x) {   
    this.serverRequest = $.get(x, function (result) {
      this.setState({
        data: result
      });
    }.bind(this));
  },
  
  render: function() {
    return (
      <div>
        <h1 className="center-this">Build an FCC Camper Leaderboard!</h1>
          <table className="table gradeLogic">
            <TableTop changeSrc = { this.changeSrc.bind(this) } /> 
            {          
              this.state.data.map(function(curr, index) {
                return <Template index = { index + 1 } data = { curr } />;
              })
            }        
          </table>
      </div>
    );
  }
});

let Footer = React.createClass({
  render: function() {
    return(
      <div>
        <br /><hr /><br />
        <footer className="well alert alert-success">
          <p className="text-center">&copy; 2016 -- <a href={ daniel } target="_blank" className="userNames">Daniel Lim</a> | Profound Ideation Inc. | All Rights Reserved</p>
        </footer>
      </div>
    )
  }
});

ReactDOM.render(
  <div>
    <LeaderBoard /> 
    <Footer />
  </div>, leaderboard
);
