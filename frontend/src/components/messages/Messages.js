import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BaseURL } from '../utils/Constant';
import { faTachometerAlt, faExclamationTriangle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { simplifiedError } from '../utils/SimplifiedError';
import Loading from '../layout/Loading';
import Dialog from '../layout/Dialog';
import MessageList from './MessageList';

export default class Messages extends Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            errors: {},
            dialog: null,
            isRequestComplete: false
        };
    }

    componentDidMount = () => {
        const token = localStorage.getItem("token");
        Axios({
            method: 'get',
            url: `${BaseURL}messages`,
            headers: {
                authorization: token
            }
        }).then(result => {
            this.setState({ messages: result.data, isRequestComplete: true });
        }).catch(error => {
            let { errors } = this.state;
            if (error.response && error.response.data.message) {
                if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                    errors = error.response.data.message;
                } else {
                    errors.error = error.response.data.message;
                }
            } else {
                errors.error = "Unable to get messages";
            }
            this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
        });
    };

    toggleMessageReplyStatus = (position) => {
        const { messages } = this.state;
        messages[position].replied = !messages[position].replied;
        this.setState({ messages });
    };

    deleteMessage = (position) => {
        const { messages } = this.state;
        messages.splice(position, 1);
        this.setState({ messages });
    };

    setUpErrorDialog = () => {
        const { errors } = this.state;
        const keysToBeIgnored = [];
        const errorMessage = simplifiedError(errors, keysToBeIgnored);
        if (errorMessage.errorString) {
            const errorDialog = <Dialog type="danger" headerText="SOMETHING WENT WRONG" bodyText={errorMessage.errorString} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: errorDialog, errors: errorMessage.errorObject });
        }
    };

    render() {
        const { messages, dialog, isRequestComplete } = this.state;
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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faEnvelope} /> Messages</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faEnvelope} /> Messages</p>
                                </div>
                                {
                                    isRequestComplete ? (
                                        <div className="card-body">
                                            <div className="row d-flex justify-content-around">
                                                <MessageList messages={messages} toggleMessageReplyStatus={this.toggleMessageReplyStatus} deleteMessage={this.deleteMessage} />
                                            </div>
                                        </div>
                                    ) : <Loading />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
