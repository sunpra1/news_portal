import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheck, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { BaseURL } from '../utils/Constant';
import Axios from 'axios';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import { toast } from 'react-toastify';

export default class MessageList extends Component {
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

    toggleMessageReplyStatus = (message, position) => {
        this.setState({ isRequestComplete: false });
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'put',
                url: `${BaseURL}messages/${message._id}/toggleReplied`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: true });
                this.props.toggleMessageReplyStatus(position);
                toast.success(`Message replied status has been made ${result.data.replied ? "replied" : "pending"}`);
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to change message replied status";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    deleteMessage = (message, position) => {
        const deleteDialog = <Dialog headerText="Are you sure?" bodyText="Please confirm to delete the message." positiveButton={{ text: "OK", handler: () => this.deleteHandler(message, position) }} negativeButton={{ text: "Cancel" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
        this.setState({ dialog: deleteDialog });
    };

    deleteHandler = (message, position) => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'delete',
                url: `${BaseURL}messages/${message._id}`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: true });
                this.props.deleteMessage(position);
                toast.success("Message has been deleted successfully");
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to delete message";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    render() {
        const { messages } = this.props;
        const { dialog } = this.state;
        return (
            <>
                {
                    dialog
                }
                <div className="col-12 table-responsive">
                    <table className="table table-hover table-striped table-bordered">
                        <thead className="bg-info text-light">
                            <tr>
                                <th>S.N.</th>
                                <th>PERSON NAME</th>
                                <th>EMAIL</th>
                                <th>SUBJECT</th>
                                <th>MESSAGE</th>
                                <th>REPLIED STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                messages && messages.length > 0 ?
                                    (
                                        messages.map((message, index) => {
                                            return (
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td>{message.name}</td>
                                                    <td>{message.email}</td>
                                                    <td>{message.subject}</td>
                                                    <td>{message.message}</td>
                                                    <td className={`${message.replied ? "text-success" : "text-danger"}`} >{message.replied ? "REPLIED" : "PENDING"}</td>
                                                    <td>
                                                        <button onClick={() => this.toggleMessageReplyStatus(message, index)} className={`btn ${message.replied ? "btn-danger" : "btn-success"} rounded-0 btn-sm m-1`}><FontAwesomeIcon icon={message.replied ? faTimes : faCheck} /> </button>
                                                        <button onClick={() => this.deleteMessage(message, index)} className="btn btn-danger btn-sm rounded-0 m-1"><FontAwesomeIcon icon={faTrashAlt} /> </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )
                                    :
                                    (
                                        <tr>
                                            <td colSpan="7" className="text-center text-danger">
                                                NO MESSAGES YET
                                            </td>
                                        </tr>
                                    )
                            }
                        </tbody>
                    </table>
                </div>
            </>
        );
    }
}
