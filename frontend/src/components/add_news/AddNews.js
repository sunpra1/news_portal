import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { notify } from '../layout/Notification';
import { BaseURL } from '../utils/constant';
import Modal from 'react-modal';
Modal.setAppElement('body');

function SelectCategoryOptions(props) {
    return props.categories.map((value, index) => {
        return <option key={value._id} value={value._id}> {value.category} </option>
    });
}

export default class AddNews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            topic: "",
            image: null,
            category: "0",
            errors: {},
            modalIsOpen: false
        };
    }

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        this.setState({ [name]: value });
    }

    onInputFieldFocus = (e) => {
        let { errors } = this.state;
        delete errors[e.target.name];
        this.setState({ errors });
    }

    onImageSelected = async e => {
        const file = e.target.files[0];
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (file) {
            if ((file.size / (1024 * 1024)) < 2) {
                let { errors } = this.state;
                delete errors.image;
                if (!validImageTypes.includes(file.type.toLowerCase())) {
                    errors.image = "JPG, JPEG and PNG file format is only supported";
                }
                this.setState({ image: file, errors });
            } else {
                this.setState({ errors: { image: "File size cannot be more then 2 MB" } });
            }
        }
    }

    onSubmit = e => {
        e.preventDefault();
        let stateValues = this.state;
        if (this.validate(stateValues)) {
            const data = new FormData();
            data.append("title", stateValues.title);
            data.append("topic", stateValues.topic);
            data.append("category", stateValues.category);
            if (stateValues.image) {
                data.append("image", stateValues.image)
            }

            Axios({
                method: "post",
                url: `${BaseURL}discussions`,
                data,
                headers: {
                    "content-type": "multipart/form-data",
                    authorization: localStorage.getItem("token")
                }
            }).then(result => {
                if (result.data) {
                    this.context.discussions.addDiscussion(result.data);
                    this.context.user.addDiscussion(result.data._id);
                    notify("success", "Discussion added successfully");
                    this.setState({
                        title: "",
                        topic: "",
                        category: "0",
                        modalIsOpen: false
                    });
                }
            }).catch(e => {
                if (e.response && e.response.data.message) {
                    notify("danger", e.response.data.message);
                } else {
                    notify("danger", "Unable to add discussion");
                }
            });
        }
    }

    validate = (data) => {
        const errors = {};

        if (data.image) {
            const validImageTypes = ["image/png", "image/jpeg", "image/jpg"]
            if (!validImageTypes.includes(data.image.type.toLowerCase())) {
                errors.image = "JPG, JPEG and PNG file format is only supported";
            } else if ((data.image.size / (1024 * 1024)) > 2) {
                errors.image = "File size cannot be more then 2 MB";
            }
        }

        if (!data.title)
            errors.title = "Title is required";

        if (!data.topic)
            errors.topic = "Topic is required";

        if (!data.category || data.category === "0")
            errors.category = "Category is required"

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    render() {

        const { errors } = this.state;
        const { discussions } = this.context;

        return discussions.categories && (
            <div className="container-fluid">
                <div className="row m-0 p-4">
                    <div className="col-md-6 dami-bg mx-auto card rounded-0 box-shadow">
                        <div className="card-header text-light">
                            <h5>CREATE NEW DISCUSSION</h5>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={this.onSubmit} method="post" encType="multipart/form-data">
                                <div className="form-group">
                                    <label htmlFor="name" className="text-light">TITLE</label>
                                    <input type="text" value={this.state.title} onFocus={this.onInputFieldFocus} onChange={this.onChange} name="title" placeholder="PROVIDE TITLE OF DISCUSSION" className={"form-control rounded-0 " + (errors.title ? "is-invalid" : "")} autoComplete="off" />
                                    <div className="invalid-feedback">
                                        <span>{errors.title}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="name" className="text-light">TOPIC</label>
                                    <textarea onChange={this.onChange} onFocus={this.onInputFieldFocus} value={this.state.topic} name="topic" cols="30" rows="4" className={"form-control rounded-0 " + (errors.topic ? "is-invalid" : "")} placeholder="PROVIDE BRIEF DESCRIPTION ON YOUR TITLE OF DISCUSSION" autoComplete="off"></textarea>
                                    <div className="invalid-feedback">
                                        <span>{errors.topic}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="name" className="text-light">IMAGE</label>
                                    <input type="file" onChange={this.onImageSelected} name="image" className={"form-control rounded-0 " + (errors.image ? "is-invalid" : "")} />
                                    <div className="invalid-feedback">
                                        <span>{errors.image}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="name" className="text-light">CATEGORY</label>
                                    <select value={this.state.category} onFocus={this.onInputFieldFocus} className={"form-control rounded-0 " + (errors.category ? "is-invalid" : "")} onChange={this.onChange} name="category">
                                        <option key="0" value="0"> SELECT CATEGORY </option>
                                        <SelectCategoryOptions categories={discussions.categories} />
                                    </select>
                                    <div className="invalid-feedback">
                                        <span>{errors.category}</span>
                                    </div>
                                </div>

                                <div className="card-footer form-group text-center rounded-0">
                                    <button type="submit" className="btn btn-primary rounded-0" name="new_discussion" value="new_discussion">CREATE <FontAwesomeIcon icon={faPlusSquare} /></button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}