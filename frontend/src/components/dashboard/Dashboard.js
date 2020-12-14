import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faArrowRight, faBell, faList, faComment, faComments, faThumbsUp, faEnvelope, faBars } from '@fortawesome/free-solid-svg-icons';
import { Link, Redirect } from 'react-router-dom';

class Dashboard extends Component {
    render() {
        const { user, discussions } = this.context;

        if (!user.user) {
            return <Redirect to="/" />
        }
        else if (user.user && discussions.discussions) {
            return (
                <div className="container-fluid content-height bg-grey">
                    <div className="row">
                        <div className="col-md-10 mx-auto my-4">
                            <div className="card box-shadow rounded-0">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faTachometerAlt} /> User Dashboard</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</p>
                                </div>

                                <div className="card-body">

                                    <div className="row  d-flex justify-content-around">
                                        {

                                            user.user.role === "admin"

                                                ?

                                                <div className="col-md-3 m-3 m-md-1 my-md-4 border border-warning">
                                                    <div className="row bg-warning text-light">
                                                        <div className="col-sm-4 p-2">
                                                            <FontAwesomeIcon icon={faBars} size="4x" />
                                                        </div>
                                                        <div className="col-sm-8">
                                                            <div className="col-sm-12">
                                                                <h1 className="text-center dash-count">{discussions.categories.length}</h1>
                                                            </div>
                                                            <div className="col-sm-12 font-weight-bold">
                                                                <p className="text-center">Categories</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-12 py-1">
                                                        <Link to="/app/categories" className="text-warning font-weight-bold">View Categories<span className="badge badge-warning text-light float-right"> <FontAwesomeIcon icon={faArrowRight} /></span></Link>
                                                    </div>
                                                </div>

                                                :

                                                ""
                                        }

                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-secondary">
                                            <div className="row bg-secondary text-light">
                                                <div className="col-sm-4 p-2">
                                                    <FontAwesomeIcon icon={faBell} size="4x" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="col-sm-12">
                                                        <h1 className="text-center dash-count">{user.user.notifications.length}</h1>
                                                    </div>
                                                    <div className="col-sm-12 font-weight-bold">
                                                        <p className="text-center">Notifications</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-sm-12 py-1">
                                                <Link to="/user/notifications" className="text-secondary font-weight-bold">View Notifications<span className="badge badge-secondary float-right"> <FontAwesomeIcon icon={faArrowRight} /></span></Link>
                                            </div>
                                        </div>

                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-danger">
                                            <div className="row bg-danger text-light">
                                                <div className="col-sm-4 p-2">
                                                    <FontAwesomeIcon icon={faList} size="4x" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="col-sm-12">
                                                        <h1 className="text-center dash-count">{user.user.discussions.length}</h1>
                                                    </div>
                                                    <div className="col-sm-12 font-weight-bold">
                                                        <p className="text-center">Discussions</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-sm-12 py-1">
                                                <Link to="/user/discussions" className="text-danger font-weight-bold">View Discussions<span className="badge badge-danger float-right"> <FontAwesomeIcon icon={faArrowRight} /></span></Link>
                                            </div>
                                        </div>

                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-info">
                                            <div className="row bg-info text-light">
                                                <div className="col-sm-4 p-2">
                                                    <FontAwesomeIcon icon={faComment} size="4x" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="col-sm-12">
                                                        <h1 className="text-center dash-count">{user.user.comments.length}</h1>
                                                    </div>
                                                    <div className="col-sm-12 font-weight-bold">
                                                        <p className="text-center">Comments</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-sm-12 py-1">
                                                <Link to="/user/comments" className="text-primary font-weight-bold">View Comments<span className="badge badge-info float-right"> <FontAwesomeIcon icon={faArrowRight} /></span></Link>
                                            </div>
                                        </div>

                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-success">
                                            <div className="row bg-success text-light">
                                                <div className="col-sm-4 p-2">
                                                    <FontAwesomeIcon icon={faComments} size="4x" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="col-sm-12">
                                                        <h1 className="text-center dash-count">{user.user.replies.length}</h1>
                                                    </div>
                                                    <div className="col-sm-12 font-weight-bold">
                                                        <p className="text-center">Reply</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-sm-12 py-1">
                                                <Link to="/user/replies" className="text-success font-weight-bold">View Replies<span className="badge badge-success float-right"> <FontAwesomeIcon icon={faArrowRight} /></span></Link>
                                            </div>
                                        </div>

                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-dark">
                                            <div className="row bg-dark text-light">
                                                <div className="col-sm-4 p-2">
                                                    <FontAwesomeIcon icon={faThumbsUp} size="4x" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="col-sm-12">
                                                        <h1 className="text-center dash-count">{user.user.votes.length}</h1>
                                                    </div>
                                                    <div className="col-sm-12 font-weight-bold">
                                                        <p className="text-center">Votes</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-sm-12 py-1">
                                                <Link to="/user/votes" className="text-dark font-weight-bold">View Votes<span className="badge badge-dark float-right"> <FontAwesomeIcon icon={faArrowRight} /></span></Link>
                                            </div>
                                        </div>


                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-warning">
                                            <div className="row bg-warning text-light">
                                                <div className="col-sm-4 p-2">
                                                    <FontAwesomeIcon icon={faEnvelope} size="4x" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="col-sm-12">
                                                        <h1 className="text-center dash-count">{user.user.subscriptions.length}</h1>
                                                    </div>
                                                    <div className="col-sm-12 font-weight-bold">
                                                        <p className="text-center">Subscriptions</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-sm-12 py-1">
                                                <Link to="/user/subscriptions" className="text-warning font-weight-bold">View Subscriptions<span className="badge badge-warning text-light float-right"> <FontAwesomeIcon icon={faArrowRight} /></span></Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default Dashboard;