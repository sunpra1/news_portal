import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBars, faPlus } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import { Link, Redirect } from 'react-router-dom';
import CategoryList from './CategoryList';
import Axios from 'axios';
import { BaseURL } from '../utils/constant';
import Footer from '../layout/Footer';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';

export default class Categories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: []
        };
    }

    componentDidMount = () => {
        Axios({
            method: 'get',
            url: `${BaseURL}categories`
        }).then(result => {
            console.log(result.data);
            this.setState({ categories: result.data });
        }).catch(e => {
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
    };

    deleteCategory = position => {
        const { categories } = this.state;
        categories.splice(position, 1);
        this.setState({ categories });
    };

    static contextType = UserContext;
    render() {
        const { categories } = this.state;

        if (!this.context.user || (this.context.user && this.context.user.role !== "ADMIN")) {
            return <Redirect to="/login" />;
        } else {
            return (
                <>
                    <Navbar />
                    <div className="container-fluid content-height">
                        <div className="row">
                            <div className="col-md-2 col-sm-3 p-0">
                                <Sidebar />
                            </div>
                            <div className="col-md-10 col-sm-9 mx-auto p-0">
                                <div className="card box-shadow rounded-0 m-4 p-3">
                                    <div className="card-header">
                                        <h4 className="text-danger"><FontAwesomeIcon icon={faBars} /> Categories</h4>
                                        <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faBars} /> Categories</p>
                                    </div>

                                    <div className="card-body">
                                        <div className="row d-flex justify-content-around">

                                            <div className="col-md-12 p-0">
                                                <Link to="/category/add" type="button" className="btn btn-primary mb-3 float-right rounded-0">
                                                    ADD CATEGORY <FontAwesomeIcon icon={faPlus} />
                                                </Link>
                                            </div>

                                            <div className="col-md-12 p-0">
                                                <CategoryList history={this.props.history} categories={categories} deleteCategory={this.deleteCategory} />
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
}