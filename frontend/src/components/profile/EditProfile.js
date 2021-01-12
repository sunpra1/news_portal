import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faExclamationTriangle, faUser, faUserEdit, faAsterisk } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom';
import { BaseURL } from '../utils/Constant';
import DefaultImage from './user.png';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import { getImageBuffer } from '../utils/ImageHandler';
import Validator from 'validator';

class EditProfile extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props);
        this.state = {
            fullName: "",
            phone: "",
            gender: "0",
            dob: "",
            address: "",
            facebook: "",
            instagram: "",
            twitter: "",
            about: "",
            password: "",
            cpassword: "",
            image: null,
            newImage: null,
            errors: {},
            modalIsOpen: false,
            dialog: null,
            isRequestComplete: true
        };

        this.customStyles = {
            content: {
                height: '80vh',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                overflowY: 'scroll'
            }
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

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    };

    onImageSelected = e => {
        const file = e.target.files[0];
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (file) {
            if ((file.size / (1024 * 1024)) < 2) {
                let { errors } = this.state;
                delete errors.newImage;
                if (!validImageTypes.includes(file.type.toLowerCase())) {
                    errors.newImage = "JPG, JPEG and PNG file format is only supported";
                }
                this.setState({ newImage: file, errors });
            } else {
                this.setState({ errors: { newImage: "File size cannot be more then 2 MB" } });
            }
        }
    };

    onSubmit = e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        let stateValues = this.state;
        if (this.validate(stateValues) && token) {
            this.setState({ isRequestComplete: false });
            let data = new FormData();
            if (stateValues.fullName) {
                data.append("fullName", stateValues.fullName);
            }

            if (stateValues.gender && stateValues.gender !== "0") {
                data.append("gender", stateValues.gender);
            }

            if (stateValues.dob) {
                data.append("dob", stateValues.dob);
            }

            if (stateValues.address) {
                data.append("address", stateValues.address);
            }

            if (stateValues.phone) {
                data.append("phone", stateValues.phone);
            }

            if (stateValues.facebook) {
                data.append("facebook", stateValues.facebook);
            }

            if (stateValues.instagram) {
                data.append("instagram", stateValues.instagram);
            }

            if (stateValues.twitter) {
                data.append("twitter", stateValues.twitter);
            }

            if (stateValues.about) {
                data.append("about", stateValues.about);
            }

            if (stateValues.password) {
                data.append("password", stateValues.password);
            }

            if (stateValues.newImage) {
                data.append("image", stateValues.newImage);
            }

            Axios({
                method: "put",
                url: `${BaseURL}users/profile`,
                data,
                headers: {
                    "content-type": "multipart/form-data",
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: true });
                toast.success(result.data.fullName + " profile updated successfully");
                this.context.setUser(result.data);
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    onPasswordBlur = () => {
        let { errors, password, cpassword } = this.state;

        if (!password) {
            if (cpassword) {
                errors.password = "Password is required";
            }
        } else if (password.length < 6) {
            errors.password = "Password must be 6 characters long";
        } else if (cpassword.length >= 6) {
            if (cpassword !== password) {
                errors.cpassword = "Password doesn't match";
            } else {
                delete errors.cpassword;
            }
        }
        this.setState({ errors });
    };

    onConfirmPasswordBlur = () => {
        let { errors, password, cpassword } = this.state;
        if (!cpassword) {
            if (password) {
                errors.cpassword = "Confirm password is required";
            }
        } else if (cpassword.length < 6) {
            errors.cpassword = "Password must be 6 characters long";
        } else if (cpassword.length > 6) {
            if (cpassword !== password) {
                errors.cpassword = "Confirm password doesn't match";
            } else {
                delete errors.password;
            }
        }
        this.setState({ errors });
    };

    onInputFocus = (e) => {
        const { errors } = this.state;
        delete errors[e.target.name];
        this.setState({ errors });
    };

    validatePhoneNumber = phone => {
        this.setState({ isRequestComplete: false });
        Axios({
            method: "post",
            url: `${BaseURL}users/validate-unique-user`,
            data: { phone }
        }).then(result => {
            this.setState({ isRequestComplete: true });
            if (!result.data.isUnique) {
                this.setState({ errors: { phone: "Phone number is already taken" } });
            } else {
                const { errors } = this.state;
                if (errors.phone) {
                    delete errors.phone;
                }
                this.setState({ errors });
            }
        }).catch(error => {
            let { errors } = this.state;
            if (error.response && error.response.data.message) {
                if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                    errors = error.response.data.message;
                } else {
                    errors.error = error.response.data.message;
                }
            } else {
                errors.error = "Unable to verify the phone number";
            }
            this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
        });
    };

    onInputBlur = (e) => {
        const { errors } = this.state;
        const value = Validator.trim(e.target.value);
        const name = e.target.name;

        console.log(name, value);
        switch (name) {
            case "fullName": {
                if (!value || value.length === 0) {
                    errors[name] = "Full name is required";
                }
                break;
            }
            case "phone": {
                if (!value || value.length === 0) {
                    errors[name] = "Phone number is required";
                } else if (!Validator.isNumeric(value)) {
                    errors[name] = "Phone number must be numeric value";
                } else if (value.length !== 10) {
                    errors[name] = "Phone number must be 10 characters long";
                } else if (this.context.user.phone.toString() !== value) {
                    this.validatePhoneNumber(value);
                }
                break;
            }
            case "about": {
                if (value && value.length < 50) {
                    errors[name] = "About must be at least 50 characters long";
                }
                break;
            }
            case "facebook":
            case "twitter":
            case "instagram": {
                if (value && Validator.trim(value).length > 0) {
                    if (!Validator.isURL(Validator.trim(value)))
                        errors[name] = "Invalid URL provided";
                    else if (Validator.trim(value).indexOf(name) < 0)
                        errors[name] = `Invalid ${name} URL provided`;
                }
                break;
            }
            default: {
                break;
            }
        }
        this.setState({ errors });
    };

    validate = (data) => {
        let errors = {};

        if (data.newImage) {
            const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (!validImageTypes.includes(data.newImage.type.toLowerCase())) {
                errors.newImage = "JPG, JPEG and PNG file format is only supported";
            } else if ((data.newImage.size / (1024 * 1024)) > 2) {
                errors.newImage = "File size cannot be more then 2 MB";
            }
        }

        if (data.facebook && Validator.trim(data.facebook).length > 0) {
            if (!Validator.isURL(Validator.trim(data.facebook))) errors.facebook = "Invalid URL provided";
            else if (Validator.trim(data.facebook).indexOf("facebook") < 0) errors.facebook = "Invalid facebook URL provided";
        }

        if (data.twitter && Validator.trim(data.twitter).length > 0) {
            if (!Validator.isURL(Validator.trim(data.twitter))) errors.twitter = "Invalid URL provided";
            else if (Validator.trim(data.twitter).indexOf("twitter") < 0) errors.twitter = "Invalid twitter URL provided";
        }

        if (data.instagram && Validator.trim(data.instagram).length > 0) {
            if (!Validator.isURL(Validator.trim(data.instagram))) errors.instagram = "Invalid URL provided";
            else if (Validator.trim(data.instagram).indexOf("instagram") < 0) errors.instagram = "Invalid instagram URL provided";
        }

        if (data.about && Validator.trim(data.about).length < 50) {
            errors.about = "About must be at least 50 characters long";
        }

        if (data.password && !data.cpassword) {
            errors.cpassword = "Please confirm your password";
        }

        if (data.cpassword && !data.password)
            errors.password = "This field cannot be empty to change password";

        if (data.password && data.cpassword) {
            if (data.password.length < 6)
                errors.password = "Password must be 6 characters long";

            if (data.cpassword.length < 6)
                errors.cpassword = "Confirm password must be 6 characters long";

            if (data.password !== data.cpassword)
                errors.cpassword = "Conform password dosen't match";
        }
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    componentDidMount = () => {
        let { fullName, gender, phone, address, dob, facebook, instagram, twitter, about } = this.context.user;
        fullName = fullName ? fullName : "";
        gender = gender ? gender : "0";
        phone = phone ? phone : "";
        address = address ? address : "";
        dob = dob ? dob.substring(0, 10) : "";
        facebook = facebook ? facebook : "";
        instagram = instagram ? instagram : "";
        twitter = twitter ? twitter : "";
        about = about ? about : "";
        this.setState({ fullName, gender, dob, phone, address, facebook, instagram, twitter, about });
    };

    render() {
        const { user } = this.context;
        const { fullName, phone, gender, dob, address, errors, dialog, isRequestComplete, facebook, twitter, instagram, about } = this.state;
        if (!user) return <Redirect to="/" />;

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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faUserEdit} /> {`Edit ${fullName} Profile`}</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faUser} /> {`${fullName} Profile`} / <FontAwesomeIcon icon={faUserEdit} /> {`Edit ${fullName} Profile`}</p>
                                </div>
                                <div className="col mx-auto card-body rounded-0 p-0">
                                    <div className="row m-0 p-4 d-flex justify-content-around">
                                        <div className="col rounded-0">
                                            {
                                                user.image ?
                                                    <img style={{ height: "18vh", width: "18vh" }} className="img-thumbnail rounded-circle d-flex mx-auto" src={`data:${user.image.mimetype};base64,${getImageBuffer(user.image)}`} alt={`Avatar of ${user.fullName}`} />
                                                    :
                                                    <img style={{ height: "18vh", width: "18vh" }} className="img-thumbnail rounded-circle d-flex mx-auto" src={DefaultImage} alt={`App default avatar of ${user.fullName}`} />
                                            }
                                            <p className="text-danger asterisk-info">FIELDS MARKED WITH <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /> ARE REQUIRED. </p>

                                            <form method="post" onSubmit={this.onSubmit} encType="multipart/form-data">
                                                <div className="form-group">
                                                    <label htmlFor="fullName">FULL NAME <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /></label>
                                                    <input type="text" name="fullName" onChange={this.onChange} onFocus={this.onInputFocus} onBlur={this.onInputBlur} placeholder="YOUR NAME" value={fullName} className={"form-control rounded-0 " + (errors.fullName ? "is-invalid" : "")} />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.fullName}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="phone">PHONE <FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} /></label>
                                                    <input type="number" name="phone" onChange={this.onChange} onFocus={this.onInputFocus} onBlur={this.onInputBlur} value={phone} placeholder="YOUR PHONE NUMBER" className={"form-control rounded-0 " + (errors.phone ? "is-invalid" : "")} />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.phone}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="gender">GENDER</label>
                                                    <select value={gender} className={"form-control rounded-0 " + (errors.gender ? "is-invalid" : "")} onChange={this.onChange} name="gender">
                                                        <option key="0" value="0"> SELECT GENDER </option>
                                                        <option key="1" value="MALE"> MALE </option>
                                                        <option key="2" value="FEMALE"> FEMALE </option>
                                                    </select>
                                                    <div className="invalid-feedback">
                                                        <span>{errors.category}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="dob">DOB</label>
                                                    <input type="date" name="dob" onChange={this.onChange} value={dob} placeholder={user.dob} className={"form-control rounded-0 " + (errors.dob ? "is-invalid" : "")} />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.dob}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="address">ADDRESS</label>
                                                    <input type="text" name="address" onChange={this.onChange} value={address} placeholder="YOUR ADDRESS" className={"form-control rounded-0 " + (errors.address ? "is-invalid" : "")} />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.address}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="newImage">NEW IMAGE</label>
                                                    <input type="file" name="newImage" onChange={this.onImageSelected} className={"form-control rounded-0 " + (errors.newImage ? "is-invalid" : "")} />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.newImage}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="password">NEW PASSWORD</label>
                                                    <input type="password" name="password" onChange={this.onChange} onFocus={this.onPasswordFocus} onBlur={this.onPasswordBlur} placeholder="YOUR NEW PASSWORD" className={"form-control rounded-0 " + (errors.password ? "is-invalid" : "")} autoComplete="false" />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.password}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="cpassword">CONFIRM PASSWORD</label>
                                                    <input type="password" name="cpassword" onChange={this.onChange} onFocus={this.onConfirmPasswordFocus} onBlur={this.onConfirmPasswordBlur} placeholder="CONFIRM YOUR PASSWORD" className={"form-control rounded-0 " + (errors.cpassword ? "is-invalid" : "")} autoComplete="false" />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.cpassword}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="facebook">FACEBOOK LINK</label>
                                                    <input type="text" name="facebook" value={facebook} onChange={this.onChange} onFocus={this.onInputFocus} onBlur={this.onInputBlur} placeholder="YOUR FACEBOOK LINK" className={"form-control rounded-0 " + (errors.facebook ? "is-invalid" : "")} autoComplete="false" />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.facebook}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="instagram">INSTAGRAM LINK</label>
                                                    <input type="text" name="instagram" value={instagram} onChange={this.onChange} onFocus={this.onInputFocus} onBlur={this.onInputBlur} placeholder="YOUR INSTAGRAM LINK" className={"form-control rounded-0 " + (errors.instagram ? "is-invalid" : "")} autoComplete="false" />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.instagram}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="twitter">TWITTER LINK</label>
                                                    <input type="text" name="twitter" value={twitter} onChange={this.onChange} onFocus={this.onInputFocus} onBlur={this.onInputBlur} placeholder="YOUR TWITTER LINK" className={"form-control rounded-0 " + (errors.twitter ? "is-invalid" : "")} autoComplete="false" />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.twitter}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="about">ABOUT YOU</label>
                                                    <textarea rows="5" name="about" value={about} onChange={this.onChange} onFocus={this.onInputFocus} onBlur={this.onInputBlur} placeholder="YOUR TWITTER LINK" className={"form-control rounded-0 " + (errors.about ? "is-invalid" : "")} autoComplete="false" />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.about}</span>
                                                    </div>
                                                </div>

                                                <div className="form-group text-center">
                                                    <button className="btn btn-success rounded-0" name="update_profile" type="submit">UPDATE PROFILE</button>
                                                </div>
                                            </form>
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

export default EditProfile;