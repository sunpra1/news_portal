import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBars } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import Axios from 'axios';
import { notify } from './Notification';
import NotificationList from './NotificationList';
import './CSS.css';
import DefaultImage from './user.png';
import { BaseURL } from '../utils/constant';

class Navbar extends Component {
    static contextType = UserContext;

    onLogoutClicked = () => {
        Axios({
            method: "post",
            url: `${BaseURL}users/logout`,
            headers: {
                authorization: localStorage.getItem("token")
            }
        }).then(result => {
            if (result.data.message) {
                localStorage.removeItem("token");
                this.context.setUser(null);
            }
        }).catch(e => {
            if (e.response.data.message) {
                notify("danger", e.response.data.message);
            } else {
                notify("danger", "Unable to log you out");
            }
        });
    }

    render() {
        const { user } = this.context;

        let notificationNotRead;

        if (user) {
            notificationNotRead = user.notifications.filter(noti => noti.read === false);
        }

        return (
            <nav className="navbar navbar-expand-sm bg-nav d-flex justify-context-center fixed-top">
                <button className="navbar-toggler rounded-0" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                    <FontAwesomeIcon className="navbar-toggler-icon text-light" icon={faBars} />
                </button>
                <Link to="/" className="navbar-brand app-title text-light"> NEWS PORTAL</Link>

                <div className="collapse navbar-collapse" id="navbarToggler">
                    {
                        user ?
                            <ul className="d-flex ml-auto navbar-nav">

                                <li className="nav-item dropdown">
                                    <span className={"nav-link " + (notificationNotRead.length === 0 ? "text-light" : "text-warning")} id="dropdownMenuButton" data-toggle="dropdown">
                                        <FontAwesomeIcon icon={faBell} />
                                        {
                                            notificationNotRead.length > 0
                                                ?
                                                <span className="badge badge-danger rounded-circle climb-10"> {notificationNotRead.length} </span>
                                                : ""
                                        }
                                    </span>

                                    <ul className="dropdown-menu dropdown-menu-right noti-dropdown-menu rounded-0 col-md-6">
                                        <NotificationList />
                                    </ul>
                                </li>


                                <li className="nav-item dropdown">
                                    <span className="nav-link dropdown-toggle" id="navbardrop" data-toggle="dropdown">
                                        {
                                            user.image ?
                                                <img style={{ height: "20px", width: "20px" }} className="rounded-circle mr-1" src={`${BaseURL}${user.image}`} alt={`Avatar of ${user.name}`} />
                                                :
                                                <img style={{ height: "20px", width: "20px" }} className="rounded-circle mr-1" src={DefaultImage} alt={"App default image of " + user.name} />
                                        }
                                        {user.name}
                                    </span>
                                    <div className="dropdown-menu dropdown-menu-right rounded-0">
                                        <Link className="dropdown-item" to="/user/dashboard">DASHBOARD</Link>
                                        <Link className="dropdown-item" to="/user/profile">PROFILE</Link>
                                        <span className="dropdown-item" onClick={() => this.onLogoutClicked()}>LOGOUT</span>
                                    </div>
                                </li>
                            </ul>

                            :

                            <ul className="d-flex ml-auto navbar-nav">
                                <li className="nav-item p-2">
                                    <Link className="nav-link btn btn-sm btn-outline-light rounded-0 px-2" to="/login">LOGIN</Link>
                                </li>
                                <li className="nav-item p-2">
                                    <Link className="nav-link btn btn-sm btn-outline-light rounded-0 px-2" to="/register">REGISTER</Link>
                                </li>
                            </ul>
                    }
                </div>
            </nav>
        )
    }
}

export default Navbar;
