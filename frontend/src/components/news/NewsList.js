import { faExclamationTriangle, faPenAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import Axios from 'axios';
import { BaseURL } from '../utils/constant';
import { Link } from 'react-router-dom';
import Dialog from '../layout/Dialog';
import { toast } from 'react-toastify';
import { simplifiedError } from '../utils/simplifiedError';
import Loading from '../layout/Loading';

export default class NewsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
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

    onDeleteNewsClicked = (news, position) => {
        const deleteDialog = <Dialog headerText="Are you sure?" bodyText="Please confirm to delete the news." positiveButton={{ text: "OK", handler: () => this.deleteHandler(news, position) }} negativeButton={{ text: "Cancel" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
        this.setState({ dialog: deleteDialog });
    };

    deleteHandler = (news, position) => {
        const token = localStorage.getItem("token");
        if (token) {
            this.setState({ isRequestComplete: false });
            Axios({
                method: 'delete',
                url: `${BaseURL}news/${news._id}`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: false });
                this.props.deleteNews(position);
                toast.success("News deleted successfully");
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === Object && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to delete news";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    render() {
        const { news } = this.props;
        const { dialog, isRequestComplete } = this.state;

        if (!isRequestComplete) return <Loading />;

        if (news.length > 0) {
            return (
                <>
                    {
                        dialog
                    }
                    <div className="table-responsive p-0">
                        <table className="table table-stripped table-bordered table-hover">
                            <thead>
                                <tr className="bg-info text-light">
                                    <th>DETAILS</th>
                                    <th>CATEGORY</th>
                                    <th>COMMENTS</th>
                                    <th>VIEWS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    news.map((news, position) => {
                                        return (
                                            <tr key={news._id}>
                                                <td><Link to={{
                                                    pathname: `/news/view/${news._id}`,
                                                    news
                                                }}>{news.title}</Link></td>
                                                <td>{news.category.category}</td>
                                                <td>{news.comments.length}</td>
                                                <td>{news.views}</td>
                                                <td>
                                                    <Link to={{
                                                        pathname: `/news/update/${news._id}`,
                                                        news
                                                    }} className="btn btn-sm rounded-0 btn-info m-1"><FontAwesomeIcon icon={faPenAlt} /></Link>
                                                    <button onClick={() => this.onDeleteNewsClicked(news, position)} className="btn btn-sm rounded-0 btn-danger m-1"><FontAwesomeIcon icon={faTrash} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </>
            );
        } else {
            return (
                <div className="table-responsive">
                    <table className="table table-stripped table-bordered table-hover">
                        <thead>
                            <tr className="bg-info text-light">
                                <th>DETAILS</th>
                                <th>CATEGORY</th>
                                <th>COMMENTS</th>
                                <th>VIEWS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="5" className="text-danger text-center">No News Found</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
    }
}
