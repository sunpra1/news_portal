import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimes, faNewspaper, faTachometerAlt, faPenAlt, faExclamationTriangle, faAsterisk } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { BaseURL } from '../utils/Constant';
import ReactQuill from 'react-quill';
import './wyswyg.css';
import NoImage from './no_image_available.png';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import Validator from 'validator';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';
import { UserContext } from '../context/UserContext';
import { Redirect } from 'react-router-dom';
import { getImageBuffer } from '../utils/ImageHandler';

export default class UpdateNews extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props);
        this.state = {
            news: null,
            id: "",
            categories: [],
            title: "",
            description: "",
            tags: "",
            oldImages: [],
            images: [],
            category: "0",
            errors: {},
            dialog: null,
            isRequestComplete: false
        };
    }

    setUpErrorDialog = () => {
        const { errors } = this.state;
        const keysToBeIgnored = ["phone", "password"];
        const errorMessage = simplifiedError(errors, keysToBeIgnored);
        if (errorMessage.errorString) {
            const errorDialog = <Dialog type="danger" headerText="SOMETHING WENT WRONG" bodyText={errorMessage.errorString} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: errorDialog, errors: errorMessage.errorObject });
        }
    };

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
            this.setState({ isRequestComplete: false });
            const data = new FormData();
            data.append("title", stateValues.title);
            data.append("description", stateValues.description);
            data.append("category", stateValues.category);
            stateValues.images.forEach(image => {
                data.append("images", image.file);
            });
            if (stateValues.tags) data.append("tags", stateValues.tags);
            Axios({
                method: "put",
                url: `${BaseURL}news/${stateValues.id}`,
                data,
                headers: {
                    "content-type": "multipart/form-data",
                    authorization: token
                }
            }).then(result => {
                const news = result.data;
                this.setState({ news, id: news._id, category: news.category._id, title: news.title, description: news.description, tags: news.tags.toString(), oldImages: news.images, images: [], errors: {}, isRequestComplete: true });
                toast.success("News updated successfully");
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to update news";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
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

    componentDidMount = async () => {
        const news = this.props.location.news;
        if (news) {
            Axios({
                method: 'get',
                url: `${BaseURL}categories`
            }).then(result => {
                this.setState({ news, categories: result.data, id: news._id, category: news.category._id, title: news.title, description: news.description, tags: news.tags.toString(), oldImages: news.images, isRequestComplete: true });
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to fetch news categories";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });

        } else {
            try {
                const response = await Promise.all([
                    Axios({
                        method: 'get',
                        url: `${BaseURL}news/${this.props.match.params.newsID}`
                    }),
                    Axios({
                        method: 'get',
                        url: `${BaseURL}categories`
                    })
                ]);

                const news = response[0].data;
                const categories = response[1].data;
                this.setState({ news, categories, id: news._id, category: news.category._id, title: news.title, description: news.description, tags: news.tags.toString(), oldImages: news.images, isRequestComplete: true });
            } catch (error) {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to fetch news and news category";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            }
        }
    };

    render() {
        const { news, errors, images, categories, oldImages, category, title, description, tags, dialog, isRequestComplete } = this.state;
        const { user } = this.context;
        if (user.role !== "ADMIN" && (news && news.author._id !== user._id)) return <Redirect to="/" />;
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
                        <div className="col-md-10 col-sm-9 p-0">
                            <div className="card box-shadow rounded-0 m-4 p-3">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faPenAlt} /> Update News</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faNewspaper} /> News / <FontAwesomeIcon icon={faPenAlt} /> Update News</p>
                                </div>

                                {
                                    isRequestComplete ? (

                                        <div className="col mx-auto card-body rounded-0 p-0">
                                            <div className="card-body">
                                                <p className="text-danger asterisk-info">Field Marked With <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /> Are Required. </p>
                                                <form onSubmit={this.onSubmit} method="post" encType="multipart/form-data">
                                                    <div className="form-group">
                                                        <label htmlFor="category" className="text-info">CATEGORY <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /></label>
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
                                                        <label htmlFor="title" className="text-info">TITLE <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /></label>
                                                        <input id="title" type="text" value={title} onFocus={this.onInputFieldFocus} onChange={this.onChange} onBlur={this.onInputFieldBlur} name="title" placeholder="PROVIDE TITLE OF NEWS" className={"form-control rounded-0 " + (errors.title ? "is-invalid" : "")} autoComplete="off" />
                                                        <div className="invalid-feedback">
                                                            <span>{errors.title}</span>
                                                        </div>
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="text-info">OLD IMAGE(S)</label>
                                                        {
                                                            oldImages.length > 0 &&
                                                            (
                                                                <div className="col mb-2 p-0 d-flex justify-content-start">
                                                                    {
                                                                        oldImages.map((image, position) => {
                                                                            return (
                                                                                <div key={position}>
                                                                                    <img src={`data:${image.mimetype};base64,${getImageBuffer(image)}`} className="my-2 mr-2 p-1 border-success" style={{ height: "150px", width: "150px", border: "2px solid" }} alt={title} />
                                                                                </div>
                                                                            );
                                                                        })
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="images" className="text-info">NEW IMAGE(S)</label>
                                                        {
                                                            images.length > 0 && (
                                                                <div className="col mb-2 p-0 d-flex justify-content-start">
                                                                    {
                                                                        images.map((image, position) => {
                                                                            return (
                                                                                <div className="position-relative" key={position}>
                                                                                    <FontAwesomeIcon onClick={() => this.handleImageDelete(position)} className="position-absolute text-danger" style={{ right: 12, top: 8 }} icon={faTimes} />
                                                                                    <img src={image.validationDetails.isImageValid ? image.dataURL : NoImage} className={`my-2 mr-2 p-1 ${!image.validationDetails.isImageValid ? "border-danger" : "border-success"}`} style={{ height: "150px", width: "150px", border: "2px solid" }} alt={title} />

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
                                                        <label htmlFor="images" className="btn btn-info rounded-0"><FontAwesomeIcon icon={faImage} /> SELECT NEW IMAGE(S)</label>
                                                        {
                                                            images.length > 0 && <span className="text-info ml-3">{images.length} Files Selected</span>
                                                        }
                                                        <div className="invalid-feedback">
                                                            <span>{errors.images}</span>
                                                        </div>
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="description" className="text-info">DESCRIPTION <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /></label>
                                                        <ReactQuill style={{ maxHeight: "55vh", overflowY: "scroll" }} id="description" modules={this.modules}
                                                            onChange={this.onTextEditorChange} onFocus={this.onTextEditorFocus} onBlur={this.onTextEditorBlur} value={description} placeholder="PROVIDE TITLE OF NEWS" className={"bg-light rounded-0 " + (errors.description ? "is-invalid" : "")} autoComplete="off" />
                                                        <div className="invalid-feedback">
                                                            <span>{errors.description}</span>
                                                        </div>
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="tags" className="text-info">TAGS</label>
                                                        <input id="tags" type="text" value={tags} onFocus={this.onInputFieldFocus} onChange={this.onChange} onBlur={this.onInputFieldBlur} name="tags" placeholder="PROVIDE NEWS TAGS" className={"form-control rounded-0 " + (errors.tags ? "is-invalid" : "")} autoComplete="off" />
                                                        <div className="invalid-feedback">
                                                            <span>{errors.tags}</span>
                                                        </div>
                                                    </div>

                                                    <div className="card-footer form-group text-center rounded-0">
                                                        <button type="submit" className="btn btn-primary rounded-0" name="new_discussion" value="new_discussion">UPDATE NEWS</button>
                                                    </div>

                                                </form>
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