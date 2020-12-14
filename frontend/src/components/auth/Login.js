import React, { Component } from 'react';
import Axios from 'axios';
import { notify } from '../layout/Notification';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faAt } from '@fortawesome/free-solid-svg-icons';
import { Redirect } from 'react-router-dom';
import { BaseURL } from '../utils/constant';

export default class Login extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            errors: {}
        }
    }

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    }

    onSubmit = e => {
        e.preventDefault();
        this.setState({ errors: {} });
        const data = {
            email: this.state.email,
            password: this.state.password
        }

        if (this.validate(data)) {
            Axios({
                method: "post",
                url: `${BaseURL}users/login`,
                data
            }).then(result => {
                const { user, token } = result.data;
                if (token) {
                    localStorage.setItem("token", token);
                    this.context.setUser(user);
                }
            }).catch(e => {
                if (e.response && e.response.data.message) {
                    notify("warning", e.response.data.message);
                } else {
                    notify("danger", "Unable to verify user credentials");
                }
            });
        }
    }

    validate = (input) => {
        let errors = {};

        if (!input.email)
            errors.email = "Email is required";

        if (!input.password)
            errors.password = "Password is required";

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    render() {
        const { errors, email, password } = this.state;
        const { user } = this.context;

        if (user) {
            return <Redirect to="/" />
        }

        return (
            <div className="container-fluid content-height bg-grey">
                <div className="row m-0 p-4">
                    <div className="col-md-6 dami-bg mx-auto card rounded-0 box-shadow">
                        <div className="card-header">
                            <h5 className="modal-title text-light">LOGIN FORM</h5>
                        </div>

                        <div className="card-body">
                            <form onSubmit={this.onSubmit} method="post">
                                <div className="form-group">
                                    <label htmlFor="email" className="text-light">EMAIL</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text  rounded-0" id="inputGroupPrepend"><FontAwesomeIcon icon={faAt} /> </span>
                                        </div>
                                        <input type="email" name="email" value={email} onChange={this.onChange} placeholder="YOUR EMAIL" className={"form-control rounded-0 " + (errors.email ? "is-invalid" : "")} autoComplete="off" />
                                        <div className="invalid-feedback">
                                            <span>{errors.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password" className="text-light">PASSWORD</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text  rounded-0" id="inputGroupPrepend"> <FontAwesomeIcon icon={faLock} /> </span>
                                        </div>
                                        <input type="password" name="password" value={password} onChange={this.onChange} placeholder="YOUR PASSWORD" className={"form-control rounded-0 " + (errors.password ? "is-invalid" : "")} autoComplete="off" />
                                        <div className="invalid-feedback">
                                            <span>{errors.password}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer form-group text-center rounded-0">
                                    <button type="submit" name="login" className="btn btn-success rounded-0">LOGIN</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}