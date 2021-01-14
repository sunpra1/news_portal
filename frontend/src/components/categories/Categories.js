import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBars, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import { Link, Redirect } from 'react-router-dom';
import CategoryList from './CategoryList';
import Axios from 'axios';
import { BaseURL } from '../utils/Constant';
import Footer from '../layout/Footer';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';

export default class Categories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            dialog: null,
            isRequestComplete: false
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

    componentDidMount = () => {
        Axios({
            method: 'get',
            url: `${BaseURL}categories`
        }).then(result => {
            this.setState({ categories: result.data, isRequestComplete: true });
        }).catch(error => {
            let { errors } = this.state;
            if (error.response && error.response.data.message) {
                if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                    errors = error.response.data.message;
                } else {
                    errors.error = error.response.data.message;
                }
            } else {
                errors.error = "Unable to load categories";
            }
            this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
        });
    };

    deleteCategory = position => {
        const { categories } = this.state;
        categories.splice(position, 1);
        this.setState({ categories });
    };

    static contextType = UserContext;
    render() {
        const { categories, dialog, isRequestComplete } = this.state;

        if (!this.context.user || (this.context.user && this.context.user.role !== "ADMIN")) return <Redirect to="/login" />;

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
                        <div className="col-md-10 col-sm-9 mx-auto p-0">
                            <div className="card box-shadow rounded-0 m-4 p-3">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faBars} /> Categories</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faBars} /> Categories</p>
                                </div>

                                {
                                    isRequestComplete ? (
                                        <div className="card-body">
                                            <div className="row d-flex justify-content-around">

                                                <div className="col-md-12 p-0">
                                                    <Link id="addCategoryBtn" to="/category/add" className="btn btn-primary mb-3 float-right rounded-0">
                                                        ADD CATEGORY <FontAwesomeIcon icon={faPlus} />
                                                    </Link>
                                                </div>

                                                <div className="col-md-12 p-0">
                                                    <CategoryList history={this.props.history} categories={categories} deleteCategory={this.deleteCategory} />
                                                </div>
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