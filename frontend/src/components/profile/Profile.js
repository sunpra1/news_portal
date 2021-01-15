import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUserTie, faVenusMars, faSignOutAlt, faEnvelope, faHome, faCalendarAlt, faExclamationTriangle, faUserTag, faUser, faPencilAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import Axios from 'axios';
import './CSS.css';
import DefaultImage from './user.png';
import Facebook from './facebook.png';
import Instagram from './instagram.png';
import Twitter from './twitter.png';
import { BaseURL } from '../utils/Constant';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';
import { toast } from 'react-toastify';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import { Link } from 'react-router-dom';

export default class Profile extends Component {
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
        const keysToBeIgnored = [];
        const errorMessage = simplifiedError(errors, keysToBeIgnored);
        if (errorMessage.errorString) {
            const errorDialog = <Dialog type="danger" headerText="SOMETHING WENT WRONG" bodyText={errorMessage.errorString} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: errorDialog, errors: errorMessage.errorObject });
        }
    };

    logoutAll = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            this.setState({ isRequestComplete: false });
            await Axios({
                method: "post",
                url: `${BaseURL}users/logoutAll`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: true });
                localStorage.removeItem("token");
                toast.success("You have been logged out of all devices.");
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
                    errors.error = "Unable to to log out of all devices";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    render() {

        const { fullName, phone, gender, dob, address, image, role, facebook, instagram, twitter, about } = this.context.user;
        const { dialog, isRequestComplete } = this.state;
        if (!isRequestComplete) return <Loading />;
        return (
            <>
                {
                    dialog
                }
                <Navbar />
                <div className="container-fluid content-height">
                    <div className="row">
                        <div className="col-md-2 col-sm-3 p-0">
                            <Sidebar />
                        </div>
                        <div className="col-md-10 col-sm-9 p-0">

                            <div className="card box-shadow rounded-0 m-4 p-3">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faUser} /> {`${fullName} Profile`}</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faUser} /> {`${fullName} Profile`}</p>
                                </div>
                                <div className="col mx-auto card-body rounded-0 p-0">
                                    <div className="row mt-4 mb-5 d-flex justify-content-center">
                                        <div className="col-md-6 mx-auto my-4">
                                            <div className="card rounded-0 box-shadow dami-bg profile-wrapper">
                                                <div className="card-header">
                                                    {
                                                        image ?
                                                            <img style={{ height: "18vh", width: "18vh" }} className="img-thumbnail rounded-circle d-flex mx-auto profile-image box-shadow bg-light" src={`data:${image.mimetype};base64,${image.buffer}`} alt={`Avatar of ${fullName}`} />
                                                            :
                                                            <img style={{ height: "18vh", width: "18vh" }} className="img-thumbnail rounded-circle d-flex mx-auto profile-image box-shadow bg-light" src={DefaultImage} alt={`App default avatar of ${fullName}`} />
                                                    }
                                                    <h4 className="text-center text-info profile-name text-light">{`${fullName.toUpperCase()} PROFILE`}</h4>
                                                </div>
                                                <div className="card-body table-responsive">
                                                    <table className="table table-bordered bg-light">
                                                        <tbody>
                                                            <tr>
                                                                <td><FontAwesomeIcon className="mr-2" icon={faUserTie} />Full Name</td>
                                                                <td>{fullName}</td>
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
                                                                <td><FontAwesomeIcon className="mr-2" icon={faEnvelope} /> Phone</td>
                                                                <td>{phone}</td>
                                                            </tr>

                                                            <tr>
                                                                <td><FontAwesomeIcon className="mr-2" icon={faHome} /> Address</td>
                                                                <td>{address ? address : "N/A"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><FontAwesomeIcon className="mr-2" icon={faUserTag} /> Role</td>
                                                                <td>{role ? role : "N/A"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><img src={Facebook} alt="Facebook logo" style={{ height: "16px", width: "16px" }} /> Facebook</td>
                                                                <td>{facebook ? facebook : "N/A"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><img src={Instagram} alt="Instagram logo" style={{ height: "16px", width: "16px" }} /> Instagram</td>
                                                                <td>{instagram ? instagram : "N/A"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><img src={Twitter} alt="Twitter logo" style={{ height: "16px", width: "16px" }} /> Twitter</td>
                                                                <td>{twitter ? twitter : "N/A"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><FontAwesomeIcon className="mr-2" icon={faInfoCircle} /> About</td>
                                                                <td>{about ? about : "N/A"}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="card-footer d-flex justify-content-around">
                                                    <Link to="/user/profile/edit" className="btn btn-light rounded-0"> <FontAwesomeIcon icon={faPencilAlt} /> EDIT PROFILE</Link>
                                                    <button onClick={this.logoutAll} className="btn btn-danger rounded-0"><FontAwesomeIcon icon={faSignOutAlt} /> LOGOUT ALL</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}