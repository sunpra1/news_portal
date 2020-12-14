import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faAt, faLock } from '@fortawesome/free-solid-svg-icons';
import { BaseURL } from '../utils/constant';

export default class Register extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: '',
            confirm_password: '',
            errors: {},
            isLoggedIn: false
        }
    }

    isValidEmail = e => {
        const email = e.target.value;
        Axios({
            method: "post",
            url: `${BaseURL}users/valid-email`,
            data: { email }
        }).then(result => {
            if (result.data) {
                this.setState({ errors: { email: "Email is already taken" } });
            } else {
                const { errors } = this.state;
                if (errors.email) {
                    delete errors.email;
                    this.setState({ errors });
                }
            }
        })
            .catch(e => {
                if (e.response && e.response.data.message) {
                    this.setState({ errors: { error: e.response.data.message } });
                } else {
                    this.setState({ errors: { error: "Email validation failed" } });
                }
            });
    }

    onChange = e => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }

    onInputFieldFocus = (e) => {
        let { errors } = this.state;
        delete errors[e.target.name];
        this.setState({ errors });
    }

    // onEmailFocus = () => {
    //     let { errors } = this.state;
    //     delete errors.email;
    //     this.setState({ errors });
    // }

    // onPasswordFocus = () => {
    //     let { errors } = this.state;
    //     delete errors.password;
    //     this.setState({ errors });
    // }

    onPasswordBlur = () => {
        let { errors, password, confirm_password } = this.state;

        if (!password) {
            errors.password = "Password is required";
        } else if (password.length < 6) {
            errors.password = "Password must be 6 characters long";
        } else if (confirm_password.length >= 6) {
            if (confirm_password !== password) {
                errors.confirm_password = "Password doesn't match";
            } else {
                delete errors.confirm_password;
            }
        }
        this.setState({ errors });
    }

    // onConfirmPasswordFocus = () => {
    //     let { errors } = this.state;
    //     delete errors.confirm_password;
    //     this.setState({ errors });
    // }

    onConfirmPasswordBlur = () => {
        let { errors, password, confirm_password } = this.state;
        if (!confirm_password) {
            errors.confirm_password = "Confirm password is required";
        } else if (confirm_password.length < 6) {
            errors.confirm_password = "Password must be 6 characters long";
        } else if (confirm_password.length > 6) {
            if (confirm_password !== password) {
                errors.confirm_password = "Confirm password doesn't match";
            } else {
                delete errors.password;
            }
        }
        this.setState({ errors });

    }

    onFormSubmit = e => {
        e.preventDefault();
        const data = {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            confirm_password: this.state.confirm_password
        };

        if (this.validate(data)) {
            Axios({
                method: 'post',
                url: `${BaseURL}users/register`,
                data: data
            }).then(result => {
                const { user, token } = result.data;
                if (token) {
                    localStorage.setItem("token", token);
                    this.context.setUser(user);
                }
            })
                .catch(e => {
                    if (e.response && e.response.data.message) {
                        this.setState({ errors: { error: e.response.data.message } });
                    } else {
                        this.setState({ errors: { error: "User registration failed" } });
                    }
                });
        }
    }

    validate = inputs => {
        const errors = {};

        if (!inputs.name)
            errors.name = "Name is required";

        if (!inputs.email)
            errors.email = "Email is required";

        if (!inputs.password)
            errors.password = "Password is required"
        else
            if (inputs.password.length < 6)
                errors.password = "Password must be 6 characters long"

        if (!inputs.confirm_password)
            errors.confirm_password = "Confirm password is required";
        else {
            if (inputs.confirm_password.length < 6)
                errors.password = "Password must be 6 characters long"
            else if (inputs.confirm_password !== inputs.password)
                errors.confirm_password = "Confirm password doesen't match";
        }
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    render() {
        const { errors, name, email, password, confirm_password } = this.state;
        const { user } = this.context;

        if (user) {
            return <Redirect to="/" />
        }

        return (
            <div className="container-fluid content-height bg-grey">
                <div className="row m-0 p-4">
                    <div className="col-md-6 dami-bg mx-auto card rounded-0 box-shadow">
                        <div className="card-header">
                            <h5 className="modal-title text-light">REGISTRATION FORM</h5>
                        </div>
                        <div className="card-body p-3">
                            <form onSubmit={this.onFormSubmit} method="post">
                                <div className="form-group">
                                    <label htmlFor="name" className="text-light">NAME</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text  rounded-0" id="inputGroupPrepend"> <FontAwesomeIcon icon={faUser} /> </span>
                                        </div>
                                        <input type="text" name="name" value={name} onFocus={this.onInputFieldFocus} onChange={this.onChange} placeholder="YOUR FULL NAME" className={"form-control rounded-0 " + (errors.name ? "is-invalid" : "")} autoComplete="off" />
                                        <div className="invalid-feedback">
                                            <span>{errors.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="text-light">EMAIL</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text  rounded-0" id="inputGroupPrepend"> <FontAwesomeIcon icon={faAt} /> </span>
                                        </div>
                                        <input type="email" name="email" onFocus={this.onInputFieldFocus} onBlur={this.isValidEmail} value={email} onChange={this.onChange} placeholder="YOUR EMAIL" className={"form-control rounded-0 " + ((errors.email) ? "is-invalid" : "")} autoComplete="off" />
                                        <div className="invalid-feedback">
                                            <span>{errors.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="passeord" className="text-light">PASSWORD</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text  rounded-0" id="inputGroupPrepend"> <FontAwesomeIcon icon={faLock} /> </span>
                                        </div>
                                        <input type="password" name="password" onFocus={this.onInputFieldFocus} value={password} onBlur={this.onPasswordBlur} onChange={this.onChange} placeholder="YOUR PASSWORD" className={"form-control rounded-0 " + (errors.password ? "is-invalid" : "")} autoComplete="off" />
                                        <div className="invalid-feedback">
                                            <span>{errors.password}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirm_password" className="text-light">CONFIEM PASSWORD</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text  rounded-0" id="inputGroupPrepend"> <FontAwesomeIcon icon={faLock} /> </span>
                                        </div>
                                        <input type="password" name="confirm_password" onFocus={this.onInputFieldFocus} onBlur={this.onConfirmPasswordBlur} value={confirm_password} onChange={this.onChange} placeholder="CONFIRM PASSWORD" className={"form-control rounded-0 " + (errors.confirm_password ? "is-invalid" : "")} autoComplete="off" />
                                        <div className="invalid-feedback">
                                            <span>{errors.confirm_password}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer text-center form-group rounded-0">
                                    <button type="submit" className="btn btn-success rounded-0" >REGISTER</button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}