import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faVenusMars, faSignOutAlt, faEnvelope, faHome, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import EditProfile from './EditProfile';
import Axios from 'axios';
import { notify } from '../layout/Notification';
import './CSS.css';
import DefaultImage from './user.png';
import { BaseURL } from '../utils/constant';

export default class Profile extends Component {
    static contextType = UserContext;

    logoutAll = async () => {
        await Axios({
            method: "post",
            url: `${BaseURL}users/logoutAll`,
            headers: {
                authorization: localStorage.getItem("token")
            }
        }).then(result => {
            if (result.data) {
                localStorage.removeItem("token");
                this.context.setUser(null);
                notify("info", "You have been logged out of all devices.");
            }
        }).catch(() => {
            notify("danger", "Unable to logout from all the devices");
        });
    }

    render() {

        const { name, email, gender, dob, address, image } = this.context.user;

        return (
            <div className="container-fluid content-height bg-grey">
                <div className="row">
                    <div className="col-md-6 mx-auto my-4">
                        <div className="card rounded-0 box-shadow dami-bg profile-wrapper">
                            <div className="card-header">
                                {
                                    image ?
                                        <img style={{ height: "150px", width: "150px" }} className="img-thumbnail rounded-circle d-flex mx-auto profile-image box-shadow bg-light" src={`${BaseURL}${image}`} alt={`Avatar of ${name}`} />
                                        :
                                        <img style={{ height: "150px", width: "150px" }} className="img-thumbnail rounded-circle d-flex mx-auto profile-image box-shadow bg-light" src={DefaultImage} alt={`App default avatar of ${name}`} />
                                }
                                <h4 className="text-center text-info profile-name text-light">{`${name.toUpperCase()} PROFILE`}</h4>
                            </div>
                            <div className="card-body table-responsive">
                                <table className="table table-bordered bg-light">
                                    <tbody>
                                        <tr>
                                            <td><FontAwesomeIcon className="mr-2" icon={faUserTie} /> Name</td>
                                            <td>{name}</td>
                                        </tr>
                                        <tr>
                                            <td><FontAwesomeIcon className="mr-2" icon={faVenusMars} /> Gender</td>
                                            <td>{gender ? gender : "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td><FontAwesomeIcon className="mr-2" icon={faCalendarAlt} /> DOB</td>
                                            <td>{dob ? dob.substring(0, 10) : "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td><FontAwesomeIcon className="mr-2" icon={faEnvelope} /> Email</td>
                                            <td>{email}</td>
                                        </tr>

                                        <tr>
                                            <td><FontAwesomeIcon className="mr-2" icon={faHome} /> Address</td>
                                            <td>{address ? address : "N/A"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="card-footer d-flex justify-content-around">
                                <EditProfile />
                                <button onClick={this.logoutAll} className="btn btn-danger rounded-0"><FontAwesomeIcon icon={faSignOutAlt} /> LOGOUT ALL</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}