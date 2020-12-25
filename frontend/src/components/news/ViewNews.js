import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faTachometerAlt, faEye, faCalendar, faBars, faShare, faComments, faSmile, faSurprise, faLaugh, faAngry, faSadTear, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { BaseURL } from '../utils/constant';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import User from './user.png';
import DateFormat from 'dateformat';
import './view_news.css';
import ReactHtmlParser from 'react-html-parser';
import Comments from './Comments';
import ImageSlider from './ImageSlider';

export default class ViewNews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            news: null,
            errors: {},
            showDescription: false
        };
    }

    toggleDescriptionVisibility = () => {
        this.setState({ showDescription: !this.state.showDescription });
    };

    toggleCommentApproveState = (comment, position) => {
        const { news } = this.state;
        news.comments[position] = comment;
        this.setState({ news });
    };

    deleteComment = position => {
        const { news } = this.state;
        news.comments.splice(position, 1);
        this.setState({ news });
    };

    getReactsOfNews = () => {
        const reacts = {
            happy: 0,
            sad: 0,
            surprised: 0,
            hysteric: 0,
            angry: 0
        };

        const newsReacts = this.state.news.reacts;
        if (newsReacts.length > 0) {
            newsReacts.forEach(react => {
                switch (react.type) {
                    case "HAPPY": {
                        reacts.happy = reacts.happy + 1;
                        break;
                    }
                    case "SAD": {
                        reacts.sad = reacts.sad + 1;
                        break;
                    }
                    case "SURPRISED": {
                        reacts.surprised = reacts.surprised + 1;
                        break;
                    }
                    case "HYSTERIC": {
                        reacts.hysteric = reacts.hysteric + 1;
                        break;
                    }
                    case "ANGRY": {
                        reacts.angry = reacts.angry + 1;
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
        }
        return reacts;
    };

    componentDidMount = () => {
        const news = this.props.location.news;
        if (news) {
            this.setState({ news });
        } else {
            Axios({
                method: 'get',
                url: `${BaseURL}news/${this.props.match.params.newsID}`
            }).then(result => {
                this.setState({ news: result.data });
            }).catch(e => {
                if (e.response && e.response.data.message) {
                    if (Object.keys(e.response.data.message).length > 0) {
                        this.setState({ errors: e.response.data.message });
                    } else {
                        this.setState({ errors: { error: e.response.data.message } });
                    }
                } else {
                    this.setState({ errors: { error: "Unable to fetch news details" } });
                }
            });
        }
    };

    render() {
        const { news, showDescription } = this.state;
        let newsReacts;
        if (news)
            newsReacts = this.getReactsOfNews();
        return (
            <>
                <Navbar />
                <div className="container-fluid content-height">
                    <div className="row">
                        <div className="col-md-2 col-sm-3 p-0">
                            <Sidebar />
                        </div>
                        <div className="col-md-10 col-sm-9 p-0">
                            <div className="card box-shadow rounded-0 m-4 p-3">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faEye} /> View News</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faNewspaper} /> News / <FontAwesomeIcon icon={faEye} /> View News</p>
                                </div>
                                {
                                    news && (
                                        <div className="col-12 mx-auto card-body rounded-0 p-0">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="row box-shadow py-3">
                                                            <div className="col-sm-2 col-md-1 p-1 d-flex justify-content-md-end justify-content-sm-center" >
                                                                <img src={news.author && news.author.image ? news.author.image : User} style={{ width: "8vh", height: "8vh" }} alt="" className="img-thumbnail img-fluid rounded-circle" />
                                                            </div>
                                                            <div className="col-sm-10 col-md-11 p-1">
                                                                <span className="text-secondary mr-3" style={{ fontSize: "13px" }}>{news.author.fullName}</span>
                                                                <h5 className="text-info">{news.title}</h5>
                                                                <div className="row">
                                                                    <div className="col-md-12 d-flex justify-content-start">
                                                                        <span className="mr-3 text-secondary" style={{ fontSize: "14px" }}><FontAwesomeIcon icon={faCalendar} /> {DateFormat(news.createdAt, "dddd, mmmm dS, yyyy, h:MM:ss TT")}</span>
                                                                        <span className="mr-3 text-secondary" style={{ fontSize: "14px" }}><FontAwesomeIcon icon={faBars} /> {news.category.category}</span>
                                                                        <span className="mr-3 text-secondary" style={{ fontSize: "14px" }}><FontAwesomeIcon icon={faEye} /> {news.views}</span>
                                                                        <span className="mr-3 text-secondary" style={{ fontSize: "14px" }}><FontAwesomeIcon icon={faShare} /> {news.shares}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {
                                                        news.images.length > 0 &&
                                                        (
                                                            <ImageSlider images={news.images} />
                                                        )
                                                    }

                                                    <div className="col-12 p-0 mt-3">
                                                        <button onClick={this.toggleDescriptionVisibility} className={`btn ${showDescription ? "btn-danger" : "btn-success"} rounded-0`}>
                                                            {
                                                                showDescription ? "HIDE DESCRIPTION" : "SHOW DESCRIPTION"
                                                            }
                                                            &nbsp; <FontAwesomeIcon icon={faInfoCircle} />
                                                        </button>
                                                    </div>
                                                    {
                                                        showDescription && (
                                                            <>
                                                                <h3 className="text-info mt-5">DESCRIPTION</h3>
                                                                <div className="col-12 p-0 news-description">
                                                                    {
                                                                        ReactHtmlParser(news.description)
                                                                    }
                                                                </div>
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className="col-12 card-footer py-4 mb-3 d-flex justify-content-between">
                                                <span>
                                                    <span className="text-success mr-1"><FontAwesomeIcon style={{ fontSize: "25px" }} icon={faSmile} /> {newsReacts.happy} </span>
                                                    <span className="text-warning mr-1"><FontAwesomeIcon style={{ fontSize: "25px" }} icon={faSadTear} /> {newsReacts.sad} </span>
                                                    <span className="text-info mr-1"><FontAwesomeIcon style={{ fontSize: "25px" }} icon={faSurprise} /> {newsReacts.surprised} </span>
                                                    <span className="text-success mr-1"><FontAwesomeIcon style={{ fontSize: "25px" }} icon={faLaugh} /> {newsReacts.hysteric} </span>
                                                    <span className="text-danger mr-1"><FontAwesomeIcon style={{ fontSize: "25px" }} icon={faAngry} /> {newsReacts.angry} </span>
                                                </span>
                                                <span className="text-success float-right"><FontAwesomeIcon style={{ fontSize: "25px" }} icon={faComments} /> {news.comments.length} </span>
                                            </div>
                                            <div className="col-12 p-0 mb-2">
                                                <div className="row mx-3">
                                                    <div className="col-12 p-0 mb-2">
                                                        <h4 className="text-info">COMMENTS <FontAwesomeIcon icon={faComments} /> </h4>
                                                    </div>
                                                    <div className="col-12">
                                                        <Comments toggleCommentApproveState={this.toggleCommentApproveState} deleteComment={this.deleteComment} newsID={news._id} comments={news.comments} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
};