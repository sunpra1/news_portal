import { faExclamationTriangle, faUser, faUserEdit, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Axios from 'axios';
import React, { Component } from 'react';
import { UserContext } from '../context/UserContext';
import Dialog from '../layout/Dialog';
import { BaseURL } from '../utils/Constant';
import { simplifiedError } from '../utils/SimplifiedError';
import Loading from '../layout/Loading';

export default class UserList extends Component {
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

    handleRoleChange = (user, position, newRole) => {
        const changeRoleDialog = <Dialog headerText="Are you sure?" bodyText={`Please confirm to update ${user.fullName.toUpperCase()} role to ${newRole}.`} positiveButton={{ text: "OK", handler: () => this.updateRole(user, position, newRole) }} negativeButton={{ text: "Cancel" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
        this.setState({ dialog: changeRoleDialog });
    };

    updateRole = (user, position, role) => {
        const token = localStorage.getItem("token");
        if (token && user && role) {
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
                this.props.updateUser(result.data, position);
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to update user role";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    render() {
        const { users } = this.props;
        const { dialog, isRequestComplete } = this.state;
        const loggedInUser = this.context.user;
        return (
            <>
                {
                    dialog
                }
                {
                    !isRequestComplete && <Loading />
                }
                <div className="col-12 table-responsive p-0">
                    {
                        users.length > 0 ?
                            (
                                <table className="table table-bordered table-hover">
                                    <thead className="bg-info text-light">
                                        <tr>
                                            <th>NAME</th>
                                            <th>CONTACT</th>
                                            <th>ROLE</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            users.map((user, position) => {
                                                return (
                                                    <tr key={user._id}>
                                                        <td>{user.fullName}</td>
                                                        <td>{user.phone}</td>
                                                        <td>{user.role}</td>
                                                        {
                                                            user._id !== loggedInUser._id ?
                                                                (
                                                                    <td>
                                                                        {
                                                                            user.role !== "ADMIN" && <button onClick={() => { this.handleRoleChange(user, position, "ADMIN"); }} className="btn btn-primary btn-sm rounded-0 m-1"><FontAwesomeIcon icon={faUserShield} /></button>
                                                                        }

                                                                        {
                                                                            user.role !== "AUTHOR" && <button onClick={() => { this.handleRoleChange(user, position, "AUTHOR"); }} className="btn btn-info btn-sm rounded-0 m-1"><FontAwesomeIcon icon={faUserEdit} /></button>
                                                                        }

                                                                        {
                                                                            user.role !== "USER" && <button onClick={() => { this.handleRoleChange(user, position, "USER"); }} className="btn btn-danger btn-sm rounded-0 m-1"><FontAwesomeIcon icon={faUser} /></button>
                                                                        }

                                                                    </td>
                                                                )
                                                                :
                                                                (
                                                                    <td></td>
                                                                )
                                                        }

                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>

                            )
                            :
                            (
                                <table className="table table-bordered table-hover">
                                    <thead className="bg-info text-light">
                                        <tr>
                                            <th>NAME</th>
                                            <th>CONTACT</th>
                                            <th>ROLE</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan="4" className="text-danger text-center">NO OTHER USERS FOUND</td>
                                        </tr>
                                    </tbody>
                                </table>

                            )
                    }</div>
            </>
        );
    }
}
