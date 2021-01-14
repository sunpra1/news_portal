import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faExclamationTriangle, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import Axios from 'axios';
import './CSS.css';
import DefaultImage from './user.png';
import { BaseURL } from '../utils/Constant';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';
import { getImageBuffer } from '../utils/ImageHandler';

class Navbar extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props);
        this.state = {
            errors: {},
            dialog: null,
            isRequestComplete: true
        };
    }

    setUpErrorDialog = () => {
        const { errors } = this.state;
        const keysToBeIgnored = ["phone", "password"];
        const errorMessage = simplifiedError(errors, keysToBeIgnored);
        if (errorMessage.errorString) {
            const errorDialog = <Dialog type="danger" headerText="LOGIN FAILED" bodyText={errorMessage.errorString} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: errorDialog, errors: errorMessage.errorObject });
        }
    };

    onLogoutClicked = () => {
        const token = localStorage.getItem("token");
        if (token) {
            this.setState({ isRequestComplete: false });
            Axios({
                method: "post",
                url: `${BaseURL}users/logout`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: true });
                localStorage.removeItem("token");
                this.context.setUser(null);
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to log you out";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    render() {
        const { user } = this.context;
        const { dialog, isRequestComplete } = this.state;
        return (
            <>
                {
                    dialog
                }
                <nav className="navbar navbar-expand-sm bg-nav d-flex justify-context-center">
                    <button className="navbar-toggler rounded-0" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                        <FontAwesomeIcon className="navbar-toggler-icon text-light" icon={faBars} />
                    </button>
                    <Link to="/" className="navbar-brand app-title text-light"> <FontAwesomeIcon icon={ faNewspaper} /> NEWS PORTAL</Link>

                    <div className="collapse navbar-collapse" id="navbarToggler">
                        {
                            isRequestComplete ? (
                                user ?
                                    <ul className="d-flex ml-auto navbar-nav">
                                        <li className="nav-item dropdown">
                                            <span className="nav-link dropdown-toggle text-light" id="navbardrop" data-toggle="dropdown">
                                                {
                                                    user.image ?
                                                        <img style={{ height: "20px", width: "20px" }} className="rounded-circle mr-1" src={`data:${user.image.mimetype};base64,${getImageBuffer(user.image)}`} alt={`Avatar of ${user.fullName}`} />
                                                        :
                                                        <img style={{ height: "20px", width: "20px" }} className="rounded-circle mr-1" src={DefaultImage} alt={"App default image of " + user.fullName} />
                                                }
                                                <span id="loggedInUser">{user.fullName}</span>
                                            </span>
                                            <div className="dropdown-menu dropdown-menu-right rounded-0">
                                                <span className="dropdown-item cursor-pointer" onClick={() => this.onLogoutClicked()}>LOGOUT</span>
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
                            )
                                :
                                <Loading />
                        }
                    </div>
                </nav>
            </>
        );
    }
}

export default Navbar;
