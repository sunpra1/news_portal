import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BaseURL } from '../utils/constant';
import { faNewspaper, faPlus, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import NewsList from './NewsList';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

export default class News extends Component {
    constructor(props) {
        super(props);

        this.state = {
            news: [],
            errors: {}
        };
    }

    componentDidMount = () => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'get',
                url: `${BaseURL}news/1/100/null/new/null`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                console.log(result.data);
                this.setState({ news: result.data });
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

    deleteNews = position => {
        const { news } = this.state;
        news.splice(position, 1);
        this.setState({ news });
    };

    render() {
        const { news } = this.state;

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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faNewspaper} /> News</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faNewspaper} /> News</p>
                                </div>

                                <div className="card-body">
                                    <div className="row d-flex justify-content-around">

                                        <div className="col-md-12 mb-2 p-0">
                                            <Link className="btn btn-primary rounded-0 float-right" to="/news/add">ADD NEWS &nbsp;<FontAwesomeIcon icon={faPlus} /></Link>
                                        </div>

                                        <div className="col-md-12 p-0">
                                            <NewsList deleteNews={this.deleteNews} news={news} />
                                        </div>

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
