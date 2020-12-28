import { faExclamationTriangle, faPenAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import Axios from 'axios';
import { notify } from '../layout/Notification';
import { BaseURL } from '../utils/constant';
import { Link } from 'react-router-dom';
import Dialog from '../layout/Dialog';

export default class NewsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialog: null
        };
    }

    onDeleteNewsClicked = (news, position) => {
        const deleteDialog = <Dialog headerText="Are you sure?" bodyText="Please confirm to delete the news." positiveButton={{ text: "OK", handler: () => this.deleteHandler(news, position) }} negativeButton={{ text: "Cancel" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
        this.setState({ dialog: deleteDialog });
    };

    deleteHandler = (news, position) => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'delete',
                url: `${BaseURL}news/${news._id}`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.props.deleteNews(position);
                notify("success", "News deleted successfully");
            })
                .catch(e => {
                    if (e.response && e.response.data.message) {
                        if (Object.keys(e.response.data.message).length > 0) {
                            this.setState({ errors: e.response.data.message });
                        } else {
                            this.setState({ errors: { error: e.response.data.message } });
                        }
                    } else {
                        this.setState({ errors: { error: "Unable to fetch news categories" } });
                    }
                });
        }
    };

    render() {
        const { news } = this.props;
        if (news.length > 0) {
            return (
                <>
                    {this.state.dialog}
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
