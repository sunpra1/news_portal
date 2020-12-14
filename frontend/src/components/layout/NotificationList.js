import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStopwatch, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import DateFormat from 'dateformat';
import Axios from 'axios';
import { notify } from './Notification';
import './CSS.css';
import { BaseURL } from '../utils/constant';

class NotificationList extends Component {
    static contextType = UserContext;

    notificationClick(notificationID) {
        Axios({
            method: "put",
            data: { read: true },
            url: `${BaseURL}users/notifications/${notificationID}`,
            headers: {
                authorization: localStorage.getItem("token")
            }
        })
            .then(result => {
                this.context.markNotificationRead(result.data._id);
            })
            .catch(e => {
                if (e.response && e.response.data.message) {
                    notify("danger", e.response.data.message);
                } else {
                    notify("danger", "Unable to mark notification as red");
                }
            });
    }

    markAllAsReadClicked() {
        Axios({
            method: "put",
            data: { read: true },
            url: `${BaseURL}users/notifications/read-all`,
            headers: {
                authorization: localStorage.getItem("token")
            }
        })
            .then(result => {
                this.context.markAllNotificationAsRead(result.data);
            })
            .catch(e => {
                if (e.response && e.response.data.message) {
                    notify("danger", e.response.data.message);
                } else {
                    notify("danger", "Unable to mark all notifications as read");
                }
            });
    }

    render() {
        const { user } = this.context;
        if (user && user.notifications.length === 0) {
            return <li className="text-danger text-center font-sm">NO NOTIFICATIONS</li>
        }
        else if (user && user.notifications) {
            return (
                <React.Fragment>
                    <li className="px-3 py-1">
                        <div className="row">
                            <div className="col-md-6 font-sm"> <Link to="/user/notifications"> View All </Link></div>
                            <div className="col-md-6 d-flex justify-content-end font-sm"> <p type="button" onClick={() => this.markAllAsReadClicked()}>Mark all as read</p> </div>
                        </div>
                    </li>

                    <hr className="m-0 p-0" />

                    {
                        user.notifications.map((noti, index) => {
                            return (
                                <li className={"font-sm px-3 py-1 " + (!noti.read ? "bg-light-grey" : "")} key={noti._id}>
                                    <div className="row" >
                                        <div className="col-md-12">
                                            <Link onClick={() => { this.notificationClick(noti._id) }} to={{ pathname: "/individual_discussion/" + noti.discussion, comment: noti.comment, reply: noti.reply }}>

                                                {

                                                    noti.about === "ReplyAddedOnComment"

                                                        ?

                                                        noti.user.name + " replied on your comment"

                                                        :

                                                        [
                                                            noti.about === "ReplyAddedOnOwnCommentOnOwnDiscussion"

                                                                ?

                                                                noti.user.name + " replied to your comment on your own discussion."

                                                                :

                                                                [

                                                                    noti.about === "ReplyAddedOnDiscussion"

                                                                        ?

                                                                        noti.user.name + " replied  on your discussion"

                                                                        :

                                                                        [
                                                                            noti.about === "CommentAddedOnDiscussion"

                                                                                ?

                                                                                noti.user.name + " commented on your discussion."

                                                                                :

                                                                                [
                                                                                    noti.about === "CommentedOnSubscribedDiscussion"

                                                                                        ?

                                                                                        noti.user.name + " commented on discussion you are following."

                                                                                        :

                                                                                        [
                                                                                            noti.about === "RepliedOnSubscribedDiscussion"

                                                                                                ?

                                                                                                noti.user.name + " replied on discussion you are following."

                                                                                                :

                                                                                                ""
                                                                                        ]

                                                                                ]

                                                                        ]

                                                                ]

                                                        ]
                                                }
                                            </Link>
                                        </div>
                                        <div className="col-md-9">
                                            <FontAwesomeIcon icon={faStopwatch} /> {DateFormat(noti.createdAt, "ddd, mmm dS, yy, H:MM")}
                                        </div>
                                        <div className="col-md-3">
                                            <FontAwesomeIcon className={"d-block ml-auto " + (noti.read ? "text-success" : "text-danger")} icon={faBookOpen} />
                                        </div>
                                    </div>
                                    {
                                        index < (user.notifications.length - 1) ? <hr className="my-0 p-0" /> : ""
                                    }
                                </li>
                            )
                        })
                    }
                </React.Fragment>
            )
        }
    }
}

export default NotificationList;