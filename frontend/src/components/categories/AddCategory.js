import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faTachometerAlt, faPlus, faBars, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import { BaseURL } from '../utils/Constant';
import Validator from 'validator';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';
import { toast } from 'react-toastify';

class AddCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category: "",
            errors: {},
            dialog: null,
            isRequestComplete: true
        };
    }

    setUpErrorDialog = () => {
        const { errors } = this.state;
        const keysToBeIgnored = ["category"];
        const errorMessage = simplifiedError(errors, keysToBeIgnored);
        if (errorMessage.errorString) {
            const errorDialog = <Dialog type="danger" headerText="SOMETHING WENT WRONG" bodyText={errorMessage.errorString} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: errorDialog, errors: errorMessage.errorObject });
        }
    };

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        this.setState({ [name]: value });
    };


    onSubmit = e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (this.validate() && token) {
            this.setState({ isRequestComplete: false });
            Axios({
                method: "post",
                data: { category: this.state.category },
                url: `${BaseURL}categories`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ category: "", isRequestComplete: true });
                toast.success("Category added successfully");
                this.props.history.goBack();
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Invalid credentials provided";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    validate = () => {
        const { category } = this.state;
        if (!category) {
            this.setState({ errors: { category: "Category field is required" } });
            return false;
        } else {
            if (Validator.trim(category).length === 0) {
                this.setState({ errors: { category: "Category field is left empty" } });
                return false;
            }
        }
        return true;
    };

    render() {
        const { errors, category, dialog, isRequestComplete } = this.state;
        return (
            <>
                {
                    dialog
                }
                {
                    !isRequestComplete && <Loading />
                }
                <Navbar />
                <div className="container-fluid content-height">
                    <div className="row">
                        <div className="col-md-2 col-sm-3 p-0">
                            <Sidebar />
                        </div>
                        <div className="col-md-10 col-sm-9 p-0">
                            <div className="card box-shadow rounded-0 m-4 p-3">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faPlus} /> Add Category</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faBars} /> Categories / <FontAwesomeIcon icon={faPlus} /> Add Category</p>
                                </div>
                                <div className="col mx-auto card-body rounded-0 p-0">
                                    <div className="card-body">
                                        <form action="post" onSubmit={this.onSubmit}>
                                            <div className="form-group">
                                                <label className="m-1" htmlFor="email">CATEGORY</label>
                                                <div className="m-1">
                                                    <input name="category" onChange={this.onChange} value={category} className={"form-control rounded-0 " + (errors.category ? "is-invalid" : "")} />
                                                    <div className="invalid-feedback" autoComplete="off">
                                                        <span>{errors.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer form-group text-center rounded-0">
                                                <button type="submit" className="btn btn-success rounded-0 m-1 text-center">ADD CATEGORY <FontAwesomeIcon icon={faPlusSquare} /> </button>
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

export default AddCategory;