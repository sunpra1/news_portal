import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faThumbsUp, faThumbsDown, faCheckCircle, faTimesCircle, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import User from './user.png';
import DateFormat from 'dateformat';
import { notify } from '../layout/Notification';
import Axios from 'axios';
import { BaseURL } from '../utils/constant';
import React, { Component } from 'react';
import Dialog from '../layout/Dialog';

export default class Comments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: {},
            dialog: null
        };
    }

    onToggleCommentVisibilityClicked = (comment, position) => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'put',
                url: `${BaseURL}news/${this.props.newsID}/comments/${comment._id}/toggleApprove`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.props.toggleCommentApproveState(result.data, position);
                notify("success", `Comment has been ${result.data.approved ? "published" : "unpublised"} successfully`);
            }).catch(e => {
                if (e.response && e.response.data.message) {
                    if (Object.keys(e.response.data.message).length > 0) {
                        this.setState({ errors: e.response.data.message });
                    } else {
                        this.setState({ errors: { error: e.response.data.message } });
                    }
                } else {
                    this.setState({ errors: { error: "Unable to update comment approvae status" } });
                }
            });
        }
    };

    onDeleteCommentClicked = (comment, position) => {
        const deleteDialog = <Dialog headerText="Are you sure?" bodyText="Please confirm to delete the comment." positiveButton={{ text: "OK", handler: () => this.deleteHandler(comment, position) }} negativeButton={{ text: "Cancel" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
        this.setState({ dialog: deleteDialog });
    };

    deleteHandler = (comment, position) => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'delete',
                url: `${BaseURL}news/${this.props.newsID}/comments/${comment._id}`,
                headers: {
                    authorization: token
                }
            }).then(_ => {
                this.props.deleteComment(position);
                notify("success", "Comment has been deleted successfully");
            }).catch(e => {
                if (e.response && e.response.data.message) {
                    if (Object.keys(e.response.data.message).length > 0) {
                        this.setState({ errors: e.response.data.message });
                    } else {
                        this.setState({ errors: { error: e.response.data.message } });
                    }
                } else {
                    this.setState({ errors: { error: "Unable to delete comment" } });
                }
            });
        }
    };

    getCommentReactCount = (comment) => {
        const reacts = {
            like: 0,
            dislike: 0
        };

        if (comment.reacts.length > 0) {
            comment.reacts.forEach(react => {
                if (react.type === "LIKE") {
                    reacts.like = reacts.like + 1;
                } else if (react.type === "DISLIKE") {
                    reacts.dislike = reacts.dislike + 1;
                }
            });
        }
        return reacts;
    };

    render() {
        if (this.props.comments.length > 0) {
            return (
                <>
                    {this.state.dialog}
                    {
                        this.props.comments.map((comment, position) => {
                            const reactsCount = this.getCommentReactCount(comment);
                            return (
                                <div className="row box-shadow py-3 mb-4" key={comment._id}>
                                    <div className="col-sm-2 col-md-1 p-1 d-flex justify-content-md-end justify-content-sm-center" >
                                        <img src={comment.user.image ? comment.user.image : User} style={{ width: "8vh", height: "8vh" }} className="img-thumbnail img-fluid rounded-circle" alt={comment.user.fullName} />
                                    </div>
                                    <div className="col-sm-8 col-md-10">
                                        <span className="text-secondary mr-3" style={{ fontSize: "12px" }}>{comment.user.fullName}</span>
                                        <h6 className={`${comment.approved ? "text-success" : "text-danger"}`}>{comment.comment}</h6>
                                        <div className="row">
                                            <div className="col-md-12 d-flex justify-content-start">
                                                <span className="mr-3 text-secondary" style={{ fontSize: "13px" }}><FontAwesomeIcon icon={faCalendar} /> {DateFormat(comment.createdAt, "dddd, mmmm dS, yyyy, h:MM:ss TT")}</span>
                                                <span className="mr-3 text-success" style={{ fontSize: "13px" }}><FontAwesomeIcon icon={faThumbsUp} /> {reactsCount.like}</span>
                                                <span className="mr-3 text-danger" style={{ fontSize: "13px" }}><FontAwesomeIcon icon={faThumbsDown} /> {reactsCount.dislike}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-2 col-md-1">
                                        <button onClick={() => this.onToggleCommentVisibilityClicked(comment, position)} className={`btn btn-sm rounded-0 ${comment.approved ? "btn-danger" : "btn-success"} m-1`}><FontAwesomeIcon icon={comment.approved ? faTimesCircle : faCheckCircle} /></button>
                                        <button onClick={() => this.onDeleteCommentClicked(comment, position)} className="btn btn-sm rounded-0 btn-danger mx-1"><FontAwesomeIcon icon={faTrash} /></button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </>
            );
        } else {
            return (
                <h6 className="text-danger">NO COMMENTS YET</h6>
            );
        }
    }
}

