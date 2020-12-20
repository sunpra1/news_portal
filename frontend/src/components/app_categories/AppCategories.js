import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import { Redirect } from 'react-router-dom';
import CategoryList from './CategoryList';
import AddCategory from './AddCategory';
import Axios from 'axios';
import { BaseURL } from '../utils/constant';

export default class AppCategories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: []
        };
    }

    componentDidMount = () => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'get',
                url: `${BaseURL}categories`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                console.log(result.data);
                this.setState({ categories: result.data });
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

    addCategory = category => {
        const { categories } = this.state;
        categories.push(category);
        this.setState({ categories });
    };

    updateCategory = (category, position) => {
        const { categories } = this.state;
        categories[position] = category;
        this.setState({ categories });
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
                <div className="container-fluid content-height bg-grey">
                    <div className="row">
                        <div className="col-md-10 mx-auto my-4">
                            <div className="card box-shadow">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faBars} /> App Categories</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faBars} /> Categories</p>
                                </div>

                                <div className="card-body">
                                    <div className="row d-flex justify-content-around">

                                        <div className="col-md-12">
                                            <AddCategory addCategory={this.addCategory} />
                                        </div>

                                        <div className="col-md-12">
                                            <CategoryList categories={categories} updateCategory={this.updateCategory} deleteCategory={this.deleteCategory} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}