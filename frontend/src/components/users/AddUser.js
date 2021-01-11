import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUserPlus, faUserFriends, faPencilAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import User from './user.png';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import Validator from 'validator';
import DateFormat from 'dateformat';
import { BaseURL } from '../utils/Constant';
import { UserContext } from '../context/UserContext';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';

export default class AddNews extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props);
        this.state = {
            phone: "",
            role: "0",
            user: null,
            errors: {},
            dialog: null,
            isRequestComplete: true
        };
    }

    setUpErrorDialog = () => {
        const { errors } = this.state;
        const keysToBeIgnored = ["phone", "role"];
        const errorMessage = simplifiedError(errors, keysToBeIgnored);
        if (errorMessage.errorString) {
            const errorDialog = <Dialog type="danger" headerText="SOMETHING WENT WRONG" bodyText={errorMessage.errorString} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: errorDialog, errors: errorMessage.errorObject });
        }
    };

    onChange = e => {
        const name = e.target.name;
        const value = Validator.trim(e.target.value.toString());
        if (name === "phone" && value.length > 0) {
            if (!Validator.isNumeric(value.toString()) || value.length > 10)
                return;
            else if (Validator.isNumeric(value.toString()) && value.length === 10)
                this.getUserDetails(value);
        }
        this.setState({ [name]: value });
    };

    getUserDetails = value => {
        const loggedInUser = this.context.user;
        const { errors } = this.state;
        if (loggedInUser.phone === value) {
            errors.phone = "Updation of own role is prohibited";
            this.setState({ errors });
        } else {
            this.setState({ isRequestComplete: false });
            Axios({
                method: "post",
                url: `${BaseURL}users/validate-unique-user`,
                data: { phone: value }
            }).then(result => {
                if (result.data.isUnique) {
                    this.setState({ errors: { phone: `No user with contact, ${value} was found` }, user: null, isRequestComplete: true });
                } else {
                    const { user } = result.data;
                    if (loggedInUser._id === user._id) {
                        errors.phone = "Updation of own role is prohibited";
                        this.setState({ errors, isRequestComplete: true });
                    } else {
                        if (errors.phone) {
                            delete errors.phone;
                        }
                        this.setState({ errors, user, role: user.role, isRequestComplete: true });
                    }
                }
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to fetch user details";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    onInputFieldFocus = (e) => {
        let { errors } = this.state;
        delete errors[e.target.name];
        this.setState({ errors });
    };

    onSubmit = e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const { user, role } = this.state;
        if (token && user && role && role !== "0") {
            this.setState({ isRequestComplete: false });
            Axios({
                method: "put",
                url: `${BaseURL}users/update-role`,
                data: { id: user._id, role },
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: true });
                const user = result.data;
                this.setState({ user });
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to fetch user details";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    render() {
        const { phone, role, user, errors, dialog, isRequestComplete } = this.state;
        return (
            <>
                {
                    dialog
                }
                {
                    !isRequestComplete && <Loading />
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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faUserPlus} /> Add User</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faUserFriends} /> Users / <FontAwesomeIcon icon={faUserPlus} /> Add User</p>
                                </div>
                                <div className="col mx-auto card-body rounded-0 p-0">
                                    <div className="row mt-4 mb-5 d-flex justify-content-center">
                                        <div className="col-md-5">
                                            <div className="card rounded-0 box-shadow" style={{ marginTop: "6vh" }}>
                                                <div className="card-header">
                                                    <h6 className="text-info text-center">USER DETAILS</h6>
                                                </div>
                                                <div className="card-body">

                                                    <form onSubmit={this.onSubmit} >
                                                        <div className="form-group">
                                                            <label htmlFor="phone" className="text-info">PHONE</label>
                                                            <input id="phone" type="number" value={phone} onFocus={this.onInputFieldFocus} onChange={this.onChange} onBlur={this.onInputFieldBlur} name="phone" placeholder="PROVIDE USER PHONE NUMBER" className={"form-control rounded-0 " + (errors.phone ? "is-invalid" : "")} autoComplete="off" />
                                                            <div className="invalid-feedback">
                                                                <span>{errors.phone}</span>
                                                            </div>
                                                        </div>

                                                        {
                                                            user && (
                                                                <>
                                                                    <div className="form-group">
                                                                        <label htmlFor="role" className="text-info">ROLE</label>
                                                                        <select id="role" value={role} onFocus={this.onInputFieldFocus} onChange={this.onChange} onBlur={this.onInputFieldBlur} name="role" className={"form-control rounded-0 " + (errors.role ? "is-invalid" : "")} >
                                                                            <option value="USER" key="0">USER</option>
                                                                            <option value="AUTHOR" key="1">AUTHOR</option>
                                                                            <option value="ADMIN" key="2">ADMIN</option>
                                                                        </select>
                                                                        <div className="invalid-feedback">
                                                                            <span>{errors.role}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="card-footer form-group text-center rounded-0">
                                                                        <button type="submit" className="btn btn-primary rounded-0" name="new_discussion" disabled={user && user._id && user.role === role} value="new_discussion">UPDATE <FontAwesomeIcon icon={faPencilAlt} /></button>
                                                                    </div>
                                                                </>
                                                            )
                                                        }
                                                    </form>
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            user && (
                                                <div className="col-md-5">
                                                    <div className="col card rounded-0 box-shadow" style={{ marginTop: "6vh" }}>
                                                        <div className="col d-flex justify-content-center" style={{ position: "relative" }}>
                                                            <img src={user.image ? `${BaseURL}user.image` : User} alt="User whose role is being changed" className="img-thumbnail rounded-circle mx-auto" style={{ width: "12vh", height: "12vh", position: "absolute", top: "-6vh" }} />
                                                        </div>

                                                        <div className="card-header" style={{ marginTop: "6vh" }}>
                                                            <h6 className="text-info text-center">{user.fullName.toUpperCase()}</h6>
                                                        </div>
                                                        <div className="card-body table-responsive">
                                                            <table className="table table-bordered table-hover table-striped">
                                                                <tbody>
                                                                    <tr>
                                                                        <td>FULL NAME</td>
                                                                        <td>{user.fullName.toUpperCase()}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>CONTACT</td>
                                                                        <td>{user.phone}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>ROLE</td>
                                                                        <td>{user.role}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>REGISTRATION DATE</td>
                                                                        <td>{DateFormat(user.createdAt, "dddd, mmmm dS, yyyy, h:MM:ss TT")}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
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