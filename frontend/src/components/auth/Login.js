import React, { Component } from 'react';
import Axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faPhone, faExclamationTriangle, faAsterisk } from '@fortawesome/free-solid-svg-icons';
import { Redirect } from 'react-router-dom';
import { BaseURL } from '../utils/Constant';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';
import Validator from 'validator';

export default class Login extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props);
        this.state = {
            phone: "",
            password: "",
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

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    };

    onInputFieldFocus = e => {
        let { errors } = this.state;
        delete errors[e.target.name];
        this.setState({ errors });
    };

    onInputFieldBlur = e => {
        let { errors } = this.state;
        if (Validator.trim(e.target.value).length === 0)
            errors[e.target.name] = `${e.target.name.substr(0, 1).toUpperCase()}${e.target.name.substr(1, (e.target.name.length -1))} is required`;
        this.setState({ errors });
    };

    onSubmit = e => {
        e.preventDefault();
        this.setState({ errors: {} });
        const data = {
            phone: this.state.phone,
            password: this.state.password
        };

        if (this.validate(data)) {
            this.setState({ isRequestComplete: false });
            Axios({
                method: "post",
                url: `${BaseURL}users/login`,
                data
            }).then(result => {
                this.setState({ isRequestComplete: true });
                const { user, token } = result.data;
                if (token) {
                    localStorage.setItem("token", token);
                    this.context.setUser(user);
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
                    errors.error = "Invalid credentials provided";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    validate = (input) => {
        let errors = {};

        if (!input.phone)
            errors.phone = "Phone is required";

        if (!input.password)
            errors.password = "Password is required";

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    render() {
        const { errors, phone, password, dialog, isRequestComplete } = this.state;
        const { user } = this.context;

        if (user && (user.role === "ADMIN" || user.role === "AUTHOR")) return <Redirect to="/" />;

        return (
            <>
                {
                    dialog
                }
                {
                    !isRequestComplete && <Loading />
                }
                <Navbar />
                <div className="container-fluid content-height bg-grey">
                    <div className="row m-0 p-4">
                        <div className="col-md-6 mx-auto card rounded-0 box-shadow">
                            <div className="card-header">
                                <h5 className="modal-title text-info">LOGIN FORM</h5>
                            </div>

                            <div className="card-body">
                                <p className="text-danger asterisk-info">FIELDS MARKED WITH <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /> ARE REQUIRED. </p>
                                <form onSubmit={this.onSubmit} method="post">
                                    <div className="form-group">
                                        <label htmlFor="phone" className="text-info">PHONE <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /></label>
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text  rounded-0" id="inputGroupPrepend"><FontAwesomeIcon icon={faPhone} /> </span>
                                            </div>
                                            <input type="number" id="phoneInput" name="phone" value={phone} onChange={this.onChange} onFocus={this.onInputFieldFocus} onBlur={this.onInputFieldBlur} placeholder="YOUR PHONE NUMBER" className={"form-control rounded-0 " + (errors.phone ? "is-invalid" : "")} autoComplete="off" />
                                            <div className="invalid-feedback">
                                                <span>{errors.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="password" className="text-info">PASSWORD <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /></label>
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text  rounded-0" id="inputGroupPrepend"> <FontAwesomeIcon icon={faLock} /> </span>
                                            </div>
                                            <input type="password" id="passwordInput" name="password" value={password} onChange={this.onChange} onFocus={this.onInputFieldFocus} onBlur={this.onInputFieldBlur} placeholder="YOUR PASSWORD" className={"form-control rounded-0 " + (errors.password ? "is-invalid" : "")} autoComplete="off" />
                                            <div className="invalid-feedback">
                                                <span>{errors.password}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer form-group text-center rounded-0">
                                        <button type="submit" id="loginBtn" name="login" className="btn btn-success rounded-0">LOGIN</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}