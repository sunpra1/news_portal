import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faPlusSquare, faTimes, faNewspaper, faTachometerAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { notify } from '../layout/Notification';
import { BaseURL } from '../utils/constant';
import ReactQuill from 'react-quill';
import './wyswyg.css';
import NoImage from './no_image_available.png';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import Validator from 'validator';

export default class AddNews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            title: "",
            description: "",
            images: [],
            category: "0",
            errors: {}
        };
    }

    modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video']
        ]
    };

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    };

    onTextEditorChange = html => {
        this.setState({ description: html });
    };

    onTextEditorFocus = () => {
        const { errors } = this.state;
        delete errors.description;
        this.setState({ errors });
    };

    onTextEditorBlur = (_, __, fun) => {
        if (Validator.trim(fun.getText()).length === 0) {
            const { errors } = this.state;
            errors.description = "Description of news is required";
            this.setState({ errors });
        }
    };

    onInputFieldFocus = (e) => {
        let { errors } = this.state;
        delete errors[e.target.name];
        this.setState({ errors });
    };

    onInputFieldBlur = (e) => {
        const inputField = e.target.name;
        const value = Validator.trim(e.target.value);
        switch (inputField) {
            case "category": {
                if (value === "0") {
                    const { errors } = this.state;
                    errors.category = "Category of news is required";
                    this.setState({ errors });
                }
                break;
            }
            case "title": {
                if (value.length === 0) {
                    const { errors } = this.state;
                    errors.title = "Title of news is required";
                    this.setState({ errors });
                }
                break;
            }
            default: {
                break;
            }
        }
    };

    onImagesSelected = async e => {
        const images = [];
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const dataURL = await this.getImageDataURI(file);
            const validationDetails = this.getImageValidationDetails(file);
            images.push({ file, dataURL, validationDetails });
        }
        const imagesError = this.getAllImagesError(images);
        console.log(imagesError);
        const { errors } = this.state;
        delete errors.images;
        if (imagesError)
            errors.images = imagesError;

        this.setState({ images, errors }, () => {
            e.target.value = null;
        });
    };

    getAllImagesError = images => {
        let imagesError;
        if (images.length > 0) {
            images.forEach(image => {
                if (!image.validationDetails.isImageValid && image.validationDetails.type && image.validationDetails.error) {
                    imagesError = `${imagesError ? imagesError : ""}\n${image.validationDetails.type}: ${image.validationDetails.error}`;
                }
            });
        }
        return imagesError;
    };

    getImageDataURI = async imageFile => {
        return new Promise((resolve, reject) => {
            try {
                let reader = new FileReader();
                reader.readAsDataURL(imageFile);
                reader.onload = e => {
                    resolve(e.target.result);
                };
            } catch (error) {
                reject(error.message);
            }
        });
    };

    getImageValidationDetails = imageFile => {
        let isImageValid = true;
        let error;
        let type;
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (imageFile) {
            if ((imageFile.size / (1024 * 1024)) < 2) {
                if (!validImageTypes.includes(imageFile.type.toLowerCase())) {
                    isImageValid = false;
                    type = "Invalid File Format";
                    error = "JPG, JPEG and PNG image file format is only supported";
                }
            } else {
                isImageValid = false;
                type = "Invalid Size";
                error = "Image file size cannot be more then 2 MB";
            }
        } else {
            isImageValid = false;
            type = "No File";
            error = "No file provided";
        }

        return { isImageValid, type, error };
    };

    handleImageDelete = position => {
        const { errors, images } = this.state;
        images.splice(position, 1);

        const imageError = this.getAllImagesError(images);
        delete errors.images;
        if (imageError)
            errors.images = imageError;

        this.setState({ images, errors });
    };

    onSubmit = e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        let stateValues = this.state;
        if (this.validate(stateValues) && token) {
            const data = new FormData();
            data.append("title", stateValues.title);
            data.append("description", stateValues.description);
            data.append("category", stateValues.category);
            stateValues.images.forEach(image => {
                data.append("images", image.file);
            });

            Axios({
                method: "post",
                url: `${BaseURL}news`,
                data,
                headers: {
                    "content-type": "multipart/form-data",
                    authorization: token
                }
            }).then(result => {
                if (result.data) {
                    notify("success", "News added successfully");
                    this.setState({
                        title: "",
                        description: "",
                        images: [],
                        category: "0",
                        errors: {}
                    });
                    this.props.history.goBack();
                }
            }).catch(e => {
                if (e.response && e.response.data.message) {
                    notify("danger", e.response.data.message);
                } else {
                    notify("danger", "Unable to add news");
                }
            });
        }
    };

    validate = (data) => {
        const errors = {};
        if (data.images) {
            const imageError = this.getAllImagesError(data.images);
            if (imageError)
                errors.images = imageError;
        }

        if (!data.title)
            errors.title = "Title of news is required";

        if (!data.description)
            errors.description = "Description of news is required";

        if (!data.category || data.category === "0")
            errors.category = "Category of news is required";

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

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

    render() {
        const { errors, images, categories, title, category, description } = this.state;
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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faPlus} /> Add News</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faNewspaper} /> News / <FontAwesomeIcon icon={faPlus} /> Add News</p>
                                </div>
                                <div className="col mx-auto card-body rounded-0 p-0">
                                    <div className="card-body">
                                        <form onSubmit={this.onSubmit} method="post" encType="multipart/form-data">
                                            <div className="form-group">
                                                <label htmlFor="category" className="text-info">CATEGORY</label>
                                                <select id="category" value={category} onFocus={this.onInputFieldFocus} onChange={this.onChange} onBlur={this.onInputFieldBlur} name="category" className={"form-control rounded-0 " + (errors.category ? "is-invalid" : "")} >
                                                    <option value="0" key="0" disabled>SELECT CATEGORY</option>
                                                    {
                                                        categories.map((category, position) => {
                                                            return <option value={category._id} key={category._id}>{category.category}</option>;
                                                        })
                                                    }
                                                </select>
                                                <div className="invalid-feedback">
                                                    <span>{errors.category}</span>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="title" className="text-info">TITLE</label>
                                                <input id="title" type="text" value={title} onFocus={this.onInputFieldFocus} onChange={this.onChange} onBlur={this.onInputFieldBlur} name="title" placeholder="PROVIDE TITLE OF NEWS" className={"form-control rounded-0 " + (errors.title ? "is-invalid" : "")} autoComplete="off" />
                                                <div className="invalid-feedback">
                                                    <span>{errors.title}</span>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="images" className="text-info">IMAGE(S)</label>

                                                {
                                                    images.length > 0 && (
                                                        <div className="col mb-2 p-0 d-flex justify-content-start">
                                                            {
                                                                images.map((image, position) => {
                                                                    return (
                                                                        <div className="position-relative" key={position}>
                                                                            <FontAwesomeIcon onClick={() => this.handleImageDelete(position)} className="position-absolute text-danger" style={{ right: 12, top: 8 }} icon={faTimes} />
                                                                            <img src={image.validationDetails.isImageValid ? image.dataURL : NoImage} className={`my-2 mr-2 p-1 ${!image.validationDetails.isImageValid ? "border-danger" : "border-success"}`} style={{ height: "150px", width: "150px", border: "2px solid" }} alt={`${title}`} />

                                                                            {
                                                                                !image.validationDetails.isImageValid && (
                                                                                    <p className="text-danger text-center" style={{ fontSize: "14px" }}>{image.validationDetails.type}</p>
                                                                                )
                                                                            }

                                                                        </div>
                                                                    );
                                                                })
                                                            }
                                                        </div>
                                                    )
                                                }

                                                <input id="images" type="file" onFocus={this.onInputFieldFocus} onChange={this.onImagesSelected} name="images" className={"form-control rounded-0 d-none " + (errors.images ? "is-invalid" : "")} autoComplete="off" multiple />
                                                <br />
                                                <label htmlFor="images" className="btn btn-info rounded-0"><FontAwesomeIcon icon={faImage} /> SELECT IMAGE(S)</label>
                                                {
                                                    images.length > 0 && <span className="text-info ml-3">{images.length} Files Selected</span>
                                                }
                                                <div className="invalid-feedback">
                                                    <span>{errors.images}</span>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="description" className="text-info">DESCRIPTION</label>
                                                <ReactQuill style={{ maxHeight: "55vh", overflowY: "scroll" }} id="description" modules={this.modules}
                                                    onChange={this.onTextEditorChange} onFocus={this.onTextEditorFocus} onBlur={this.onTextEditorBlur} value={description} placeholder="PROVIDE TITLE OF NEWS" className={"bg-light rounded-0 " + (errors.description ? "is-invalid" : "")} autoComplete="off" />
                                                <div className="invalid-feedback">
                                                    <span>{errors.description}</span>
                                                </div>
                                            </div>

                                            <div className="card-footer form-group text-center rounded-0">
                                                <button type="submit" className="btn btn-primary rounded-0" name="new_discussion" value="new_discussion">ADD NEWS <FontAwesomeIcon icon={faPlusSquare} /></button>
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