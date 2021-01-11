import React, { Component, createContext } from 'react';
import Axios from 'axios';
import { BaseURL } from '../utils/Constant';
import Initializing from '../layout/Initializing';

export const UserContext = createContext();

export default class UserProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isRequestComplete: false
    };
  }

  setUser = user => {
    this.setState({ user });
  };

  getUserProfile = () => {
    setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        Axios({
          method: "get",
          url: `${BaseURL}users/profile`,
          headers: {
            authorization: token
          }
        }).then(result => {
          this.setState({ user: result.data });
        }).catch(e => {
          if (e.response && e.response.data.message) {
            if (e.response.status && e.response.status === 401) {
              localStorage.removeItem("token");
              this.setState({ user: null });
            }
          }
        });
      } else {
        this.setState({ user: null });
      }
    }, 15000);
  };

  componentDidMount = () => {
    const token = localStorage.getItem("token");
    if (token) {
      Axios({
        method: "get",
        url: `${BaseURL}users/profile`,
        headers: {
          authorization: token
        }
      }).then(result => {
        this.setState({ user: result.data, isRequestComplete: true });
        this.getUserProfile();
      }).catch(e => {
        if (e.response && e.response.data.message) {
          if (e.response.status && e.response.status === 401) {
            localStorage.removeItem("token");
            this.setState({ user: null, isRequestComplete: true });
          }
        }
      });
    } else {
      this.setState({ isRequestComplete: true, user: null });
    }
  };

  render() {
    return (
      <UserContext.Provider value={{ user: this.state.user, setUser: this.setUser }}>
        {
          this.state.isRequestComplete ? this.props.children : <Initializing />
        }
      </UserContext.Provider>
    );
  }
}
