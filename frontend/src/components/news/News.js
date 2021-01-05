import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BaseURL } from '../utils/constant';
import { faAngleLeft, faAngleRight, faFilter, faNewspaper, faPlus, faSearch, faTachometerAlt, faThList, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import NewsList from './NewsList';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Validator from 'validator';

export default class News extends Component {
    constructor(props) {
        super(props);

        this.state = {
            category: "",
            search: "",
            sortOption: "",
            page: 1,
            limit: 20,
            categories: [],
            news: [],
            searchSuggestions: [],
            errors: {}
        };
    }

    onChangeHandler = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        if (name === "limit" && value > 0) return;
        this.setState({ [name]: value }, () => {
            if (name === "search" && Validator.trim(value).length > 5) this.getSearchSuggestions();
        });
    };

    onRouteParameterSetClicked = () => {
        this.getNews();
    };

    onClearCategoryFilterBtnPressed = () => {
        this.setState({ category: "" });
    };

    onClearSortFilterBtnPressed = () => {
        this.setState({ sortOption: "" });
    };

    onClearSearchBtnPressed = () => {
        this.setState({ search: "", searchSuggestions: [] });
    };

    onNextPageBtnClicked = () => {
        const { page } = this.state;
        this.setState({ page: page + 1 }, () => {
            this.getNews();
        });
    };

    onPreviousPageBtnClicked = () => {
        const { page } = this.state;
        if (page > 1) {
            this.setState({ page: page - 1 }, () => {
                this.getNews();
            });
        }
    };

    handleOnSearchSuggestionClicked = (title) => {
        this.setState({ search: title, searchSuggestions: [] });
    };

    getSearchSuggestions = () => {
        const { search } = this.state;
        Axios({
            method: 'get',
            url: `${BaseURL}news/search_suggestions/${search}/6`
        }).then(result => {
            const searchSuggestions = result.data;
            this.setState({ searchSuggestions });
        }).catch(e => {
            if (e.response && e.response.data.message) {
                if (Object.keys(e.response.data.message).length > 0) {
                    this.setState({ errors: e.response.data.message });
                } else {
                    this.setState({ errors: { error: e.response.data.message } });
                }
            } else {
                this.setState({ errors: { error: "Unable to fetch search suggestions" } });
            }
        });
    };

    getNews = () => {
        const token = localStorage.getItem("token");
        if (token) {
            const { page, limit } = this.state;
            let { category, search, sortOption } = this.state;
            category = category ? category : "null";
            search = search ? search : "null";
            sortOption = sortOption ? sortOption : "null";
            Axios({
                method: 'get',
                url: `${BaseURL}news/${page}/${limit}/${category}/${sortOption}/${search}`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                const news = result.data;
                this.setState({ news });
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
        }
    };

    getCategories = () => {
        Axios({
            method: 'get',
            url: `${BaseURL}categories`
        }).then(result => {
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

    componentDidMount = () => {
        this.getNews();
        this.getCategories();
    };

    deleteNews = position => {
        const { news } = this.state;
        news.splice(position, 1);
        this.setState({ news });
    };

    render() {
        const { news, categories, category, search, sortOption, page, limit, searchSuggestions } = this.state;

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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faNewspaper} /> News</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faNewspaper} /> News</p>
                                </div>

                                <div className="card-body">
                                    <div className="row d-flex justify-content-around">

                                        <div className="col-12 mb-3 p-0 form-inline form-row">

                                            <div className="col-md col-sm-12 p-0 d-flex my-1">
                                                <div className="input-group">
                                                    <select name="category" value={category} onChange={this.onChangeHandler} className="form-control rounded-0">
                                                        <option value="" key="0" disabled>SELECT CATEGORY</option>
                                                        {
                                                            categories.length > 0 && (
                                                                categories.map(category => {
                                                                    return <option value={category._id} key={category._id}>{category.category}</option>;
                                                                })
                                                            )
                                                        }
                                                    </select>
                                                    {
                                                        category && (
                                                            <div onClick={this.onClearCategoryFilterBtnPressed} className="input-group-append">
                                                                <span className="input-group-text text-danger rounded-0 bg-light" id="addon-search"><FontAwesomeIcon icon={faTimesCircle} /></span>
                                                            </div>
                                                        )
                                                    }
                                                    <button onClick={this.onRouteParameterSetClicked} className="btn btn-info rounded-0" name="search_btn" value="search_btn"><FontAwesomeIcon icon={faFilter} /></button>
                                                </div>
                                            </div>
                                            <div className="col-md col-sm-12 p-0 d-flex justify-content-center my-1">
                                                <div className="input-group">
                                                    <input type="text" name="search" onChange={this.onChangeHandler} value={search} placeholder="SEARCH NEWS" className="form-control rounded-0" autoComplete="off" />
                                                    {
                                                        search && (
                                                            <div onClick={this.onClearSearchBtnPressed} className="input-group-append">
                                                                <span className="input-group-text text-danger rounded-0 bg-light" id="addon-search"><FontAwesomeIcon icon={faTimesCircle} /></span>
                                                            </div>
                                                        )
                                                    }
                                                    <button onClick={this.onRouteParameterSetClicked} className="btn btn-info rounded-0" name="search_btn" value="search_btn"><FontAwesomeIcon icon={faSearch} /></button>
                                                </div>

                                                {
                                                    searchSuggestions.length > 0 && (<div className="search-suggestions border -danger">
                                                        <ul className="list-group rounded-0 bg-light">
                                                            {
                                                                searchSuggestions.map(suggestion => {
                                                                    return <li onClick={() => this.handleOnSearchSuggestionClicked(suggestion.title)} className="list-group-item p-2 rounded-0" key={suggestion._id}>{suggestion.title}</li>;
                                                                })
                                                            }
                                                        </ul>
                                                    </div>
                                                    )
                                                }
                                            </div>
                                            <div className="col-md col-sm-12 p-0 d-flex justify-content-end my-1">
                                                <div className="input-group">
                                                    <select name="sortOption" value={sortOption} onChange={this.onChangeHandler} className="form-control rounded-0">
                                                        <option value="" key="0" disabled>SORT OPTIONS</option>
                                                        <option value="old" key="1">OLD</option>
                                                        <option value="new" key="2">NEW</option>
                                                        <option value="popular" key="3">POPULAR</option>
                                                    </select>

                                                    {
                                                        sortOption && (
                                                            <div onClick={this.onClearSortFilterBtnPressed} className="input-group-append">
                                                                <span className="input-group-text text-danger rounded-0 bg-light" id="addon-search"><FontAwesomeIcon icon={faTimesCircle} /></span>
                                                            </div>
                                                        )
                                                    }
                                                    <button onClick={this.onRouteParameterSetClicked} className="btn btn-info rounded-0" name="search_btn" value="search_btn"><FontAwesomeIcon icon={faFilter} /></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 p-0 mb-3">
                                            <div className="row">
                                                <div className="col-md col-sm-12">
                                                    <div className="input-group">
                                                        <label className="my-1 mr-2" htmlFor="">NEWS PER PAGE</label>
                                                        <input type="number" name="limit" value={limit} onChange={this.onChangeHandler} placeholder="LIMIT" className="form-control-sm rounded-0 border" style={{ width: "80px" }} />
                                                        <button onClick={this.onRouteParameterSetClicked} className="btn btn-info btn-sm rounded-0 ml-1" name="search_btn" value="search_btn"><FontAwesomeIcon icon={faThList} /></button>
                                                    </div>
                                                </div>
                                                <div className="col-md col-sm-12">
                                                    <div className="col-md col-sm-12 p-0 d-flex justify-content-end my-1">
                                                        <Link className="btn btn-primary rounded-0" to="/news/add">ADD NEWS &nbsp;<FontAwesomeIcon icon={faPlus} /></Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 p-0">
                                            <NewsList deleteNews={this.deleteNews} news={news} />
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <nav aria-label="Page navigation">
                                <p className="text-info text-center">PAGE {page}</p>
                                <ul className="pagination justify-content-center">
                                    <li className="page-item my-1 mx-2">
                                        <button onClick={this.onPreviousPageBtnClicked} className="btn btn-light rounded-0" disabled={page === 1} >
                                            <FontAwesomeIcon icon={faAngleLeft} />
                                        </button>
                                    </li>
                                    <li className="page-item my-1 mx-2">
                                        <button onClick={this.onNextPageBtnClicked} className="btn btn-light rounded-0" disabled={news.length === 0}>
                                            <FontAwesomeIcon icon={faAngleRight} />
                                        </button>
                                    </li>
                                </ul>
                            </nav>

                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
