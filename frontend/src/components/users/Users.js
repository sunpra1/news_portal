import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BaseURL } from '../utils/constant';
import { faPlus, faTachometerAlt, faUserFriends, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import UserList from './UserList';
import { Link } from 'react-router-dom';
import { simplifiedError } from '../utils/simplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';

export default class Users extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            errors: {},
            dialog: null,
            isRequestComplete: false
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

    componentDidMount = () => {
        Axios({
            method: "get",
            url: `${BaseURL}summaries/adminAndAuthorUsers`
        }).then(result => {
            this.setState({ users: result.data, isRequestComplete: true });
        }).catch(error => {
            let { errors } = this.state;
            if (error.response && error.response.data.message) {
                if (typeof error.response.data.message === Object && Object.keys(error.response.data.message).length > 0) {
                    errors = error.response.data.message;
                } else {
                    errors.error = error.response.data.message;
                }
            } else {
                errors.error = "Unable to get users";
            }
            this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
        });
    };

    updateUser = (user, position) => {
        const { users } = this.state;
        if (user.role === "USER") {
            users.splice(position, 1);
        } else {
            users[position] = user;
        }
        this.setState({ users });
    };

    render() {
        const { users, dialog, isRequestComplete } = this.state;
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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faUserFriends} /> Users</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faUserFriends} /> Users</p>
                                </div>

                                <div className="card-body">

                                    <div className="row d-flex justify-content-around">
                                        <div className="col-12 p-0 mb-3">
                                            <Link to="/users/add" className="btn btn-primary rounded-0 float-right">ADD USER <FontAwesomeIcon icon={faPlus} /></Link>
                                        </div>
                                        <UserList users={users} updateUser={this.updateUser} />
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
