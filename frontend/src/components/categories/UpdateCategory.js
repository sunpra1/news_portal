import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBars, faPenAlt } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import { notify } from '../layout/Notification';
import { BaseURL } from '../utils/constant';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import Validator from 'validator';

class UpdateCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category: "",
            errors: {}
        };
    }

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    };

    onCategoryBlur = (e) => {
        const phone = e.target.value;
        if (Validator.trim(phone).length === 0) {
            const { errors } = this.state;
            errors.category = "Category field is left empty";
            this.setState({ errors });
        }
    };

    onCategoryFocus = (_) => {
        const { errors } = this.state;
        delete errors.category;
        this.setState({ errors });
    };

    onSubmit = e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (this.validate() && token) {
            Axios({
                method: "put",
                data: { category: this.state.category },
                url: `${BaseURL}categories/${this.props.match.params.categoryID}`,
                headers: {
                    authorization: token
                }
            })
                .then(result => {
                    notify("success", "Category updated successfully");
                    this.setState({ category: result.data.category });
                    this.props.history.goBack();
                })
                .catch(e => {
                    if (e.response && e.response.data.message) {
                        this.setState({ errors: e.response.data.message });
                    } else {
                        notify("danger", "Unable to update your category");
                    }
                });
        }
    };

    validate = () => {
        const { category } = this.state;
        if (!category) {
            this.setState({ errors: { category: "Category field is left empty" } });
            return false;
        }

        return true;
    };

    componentDidMount = () => {
        let category = this.props.location.category;
        if (category) {
            this.setState({ category: category.category });
        } else {
            Axios({
                method: "get",
                url: `${BaseURL}categories/${this.props.match.params.categoryID}`
            })
                .then(result => {
                    this.setState({ category: result.data.category });
                })
                .catch(e => {
                    if (e.response && e.response.data.message) {
                        if (Object.keys(e.response.data.message).length > 0) {
                            this.setState({ errors: e.response.data.message });
                        } else {
                            this.setState({ errors: { error: e.response.data.message } });
                        }
                    } else {
                        this.setState({ errors: { error: "Unable to get category details" } });
                    }
                });
        }
    };

    render() {
        const { errors, category } = this.state;

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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faPenAlt} /> Edit Category</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faBars} /> Categories / <FontAwesomeIcon icon={faPenAlt} /> Edit Category</p>
                                </div>
                                <div className="col mx-auto card-body rounded-0 p-0">
                                    <div className="card-body">
                                        <form action="post" onSubmit={this.onSubmit} >
                                            <div className="form-group">
                                                <label className="m-1" htmlFor="email">CATEGORY</label>
                                                <div className="m-1">
                                                    <input name="category" onChange={this.onChange} onBlur={this.onCategoryBlur} onFocus={this.onCategoryFocus} value={category} className={"form-control rounded-0 " + (errors.category ? "is-invalid" : "")} />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.category}</span>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="card-footer form-group text-center rounded-0">
                                                <button type="submit" name="login" className="btn btn-success rounded-0 m-1 d-flex mx-auto">UPDATE</button>
                                            </div>
                                        </form>
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

export default UpdateCategory;