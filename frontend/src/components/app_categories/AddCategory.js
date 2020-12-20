import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import { notify } from '../layout/Notification';
import Modal from 'react-modal';
import { BaseURL } from '../utils/constant';
import Validator from 'validator';
Modal.setAppElement('body');

class AddCategoryModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category: "",
            errors: {},
            modalIsOpen: false
        };
        this.customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)'
            }
        };
    }

    openModal = () => {
        this.setState({ modalIsOpen: true });
    };

    closeModal = () => {
        this.setState({ modalIsOpen: false });
    };

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        this.setState({ [name]: value });
    };


    onSubmit = e => {
        e.preventDefault();
        if (this.validate()) {
            Axios({
                method: "post",
                data: { category: this.state.category },
                url: `${BaseURL}categories`,
                headers: {
                    authorization: localStorage.getItem("token")
                }
            })
                .then(result => {
                    this.props.addCategory(result.data);
                    notify("success", "Category added successfully");
                    this.setState({ category: "", modalIsOpen: false });
                })
                .catch(e => {
                    if (e.response && e.response.data.message) {
                        if (Object.keys(e.response.data.message).length > 0) {
                            this.setState({ errors: e.response.data.message });
                        } else {
                            notify("danger", e.response.data.message);
                        }
                    } else {
                        notify("danger", "Unable to delete your comment");
                    }
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
        const { errors, category } = this.state;

        return (
            <React.Fragment>
                <button type="button" onClick={this.openModal} className="btn btn-primary mx-1 mb-3 d-block ml-auto rounded-0">
                    ADD CATEGORY <FontAwesomeIcon icon={faPlus} />
                </button>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={this.customStyles} >

                    <div className="row m-0 p-4 dami-bg">
                        <div className="col-md-12 mx-auto card">
                            <div className="card-header bg-info text-light">
                                <button type="button" onClick={this.closeModal} className="close" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h5 className="modal-title" id="exampleModalLabel">ADD CATEGORY</h5>
                            </div>
                            <div className="card-body">
                                <form action="post" onSubmit={this.onSubmit} className="form-inline">
                                    <div className="form-row">
                                        <label className="m-1" htmlFor="email">CATEGORY</label>
                                        <div className="m-1">
                                            <input name="category" onChange={this.onChange} value={category} className={"form-control rounded-0 " + (errors.category ? "is-invalid" : "")} />
                                            <div className="invalid-feedback" autoComplete="off">
                                                <span>{errors.category}</span>
                                            </div>
                                        </div>
                                        <button type="submit" name="login" className="btn btn-success rounded-0 m-1 d-flex mx-auto">ADD CATEGORY</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal>
            </React.Fragment>
        );
    }
}

export default AddCategoryModel;