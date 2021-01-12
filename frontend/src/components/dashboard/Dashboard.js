import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBars, faNewspaper, faUserShield, faUserEdit, faUser, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Footer from '../layout/Footer';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import { Bar, Pie } from 'react-chartjs-2';
import { BaseURL, CSSColorNames, PopularityThreshold } from '../utils/Constant';
import Axios from 'axios';
import Loading from '../layout/Loading';
import NewsList from './NewsList';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            categories: {},
            summary: {},
            chartLabels: {},
            thisWeekData: {},
            previousWeekData: {},
            thisMonthData: {},
            previousMonthData: {},
            popularThisWeek: [],
            popularThisMonth: [],
            isRequestComplete: false,
            errors: {},
            dialog: null
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

    componentDidMount = async () => {
        try {
            const dashBoardData = await Promise.all([
                Axios({
                    method: "get",
                    url: `${BaseURL}summaries`
                }),
                Axios({
                    method: "get",
                    url: `${BaseURL}news/popular/this_week/true/${PopularityThreshold}`
                }),
                Axios({
                    method: "get",
                    url: `${BaseURL}news/popular/previous_week/true/${PopularityThreshold}`
                }),
                Axios({
                    method: "get",
                    url: `${BaseURL}news/popular/this_month/true/${PopularityThreshold}`
                }),
                Axios({
                    method: "get",
                    url: `${BaseURL}news/popular/previous_month/true/${PopularityThreshold}`
                }),
                Axios({
                    method: "get",
                    url: `${BaseURL}categories`
                }),
                Axios({
                    method: "get",
                    url: `${BaseURL}news/popular/this_week/false/${PopularityThreshold}`
                }),
                Axios({
                    method: "get",
                    url: `${BaseURL}news/popular/this_month/false/${PopularityThreshold}`
                }),
            ]);

            /*--This Week--*/
            const thisWeekData = {};
            thisWeekData.label = "This Week";
            thisWeekData.data = [];
            dashBoardData[1].data.forEach(category => {
                let totalNewsViews = 0;
                category.news.forEach(news => {
                    totalNewsViews = totalNewsViews + news.views;
                });
                const averageView = totalNewsViews / category.news.length;
                thisWeekData.data.push(averageView);
            });

            /*--Previous Week--*/
            const previousWeekData = {};
            previousWeekData.label = "Previous Week";
            previousWeekData.data = [];
            dashBoardData[2].data.forEach(category => {
                let totalNewsViews = 0;
                category.news.forEach(news => {
                    totalNewsViews = totalNewsViews + news.views;
                });
                const averageView = totalNewsViews / category.news.length;
                previousWeekData.data.push(averageView);
            });

            /*--This Month--*/
            const thisMonthData = {};
            thisMonthData.label = "This Month";
            thisMonthData.data = [];
            dashBoardData[3].data.forEach(category => {
                let totalNewsViews = 0;
                category.news.forEach(news => {
                    totalNewsViews = totalNewsViews + news.views;
                });

                const averageView = totalNewsViews / category.news.length;
                thisMonthData.data.push(averageView);
            });

            /*--Previous Month--*/
            const previousMonthData = {};
            previousMonthData.label = "Previous Month";
            previousMonthData.data = [];
            dashBoardData[4].data.forEach(category => {
                let totalNewsViews = 0;
                category.news.forEach(news => {
                    totalNewsViews = totalNewsViews + news.views;
                });
                const averageView = totalNewsViews / category.news.length;
                previousMonthData.data.push(averageView);
            });

            /*--Categories--*/
            const labels = [];
            const categories = {};
            categories.data = [];
            categories.backgroundColor = [];

            dashBoardData[5].data.forEach((category, index) => {
                labels.push(category.category);
                categories.data.push(category.news.length);
                categories.backgroundColor.push(CSSColorNames[index]);
            });

            this.setState({ summary: dashBoardData[0].data, chartLabels: labels, thisWeekData, previousWeekData, thisMonthData, previousMonthData, categories, isRequestComplete: true, popularThisWeek: dashBoardData[6].data, popularThisMonth: dashBoardData[7].data });

        } catch (error) {
            let { errors } = this.state;
            if (error.response && error.response.data.message) {
                if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                    errors = error.response.data.message;
                } else {
                    errors.error = error.response.data.message;
                }
            } else {
                errors.error = "Unable to fetch dashboard summary and insights";
            }
            this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
        }
    };

    render() {
        const { categories, summary, chartLabels, thisWeekData, previousWeekData, thisMonthData, previousMonthData, popularThisWeek, popularThisMonth, isRequestComplete, dialog } = this.state;
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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</p>
                                </div>
                                {
                                    isRequestComplete ? (

                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-12 mb-3">
                                                    <h5 className="text-info">SUMMARY</h5>
                                                </div>
                                                <div className="col-md-10 col-sm-12 mx-auto p-0">
                                                    <div className="row d-flex justify-content-around my-3 box-shadow-md">
                                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-success bg-success">
                                                            <div className="row text-light">
                                                                <div className="col-sm-4 p-2">
                                                                    <FontAwesomeIcon icon={faBars} size="4x" />
                                                                </div>
                                                                <div className="col-sm-8">
                                                                    <div className="col-sm-12">
                                                                        <h1 className="text-center dash-count">{summary.categoryCount} </h1>
                                                                    </div>
                                                                    <div className="col-sm-12 font-weight-bold">
                                                                        <p className="text-center">Categories</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3 d-flex m-3 m-md-1 my-md-4 border border-dark bg-dark">
                                                            <div className="row text-light">
                                                                <div className="col-sm-4 p-2">
                                                                    <FontAwesomeIcon icon={faNewspaper} size="4x" />
                                                                </div>
                                                                <div className="col-sm-8">
                                                                    <div className="col-sm-12">
                                                                        <h1 className="text-center dash-count">{summary.newsCount}</h1>
                                                                    </div>
                                                                    <div className="col-sm-12 font-weight-bold">
                                                                        <p className="text-center">News</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-danger bg-danger">
                                                            <div className="row text-light">
                                                                <div className="col-sm-4 p-2">
                                                                    <FontAwesomeIcon icon={faUserShield} size="4x" />
                                                                </div>
                                                                <div className="col-sm-8">
                                                                    <div className="col-sm-12">
                                                                        <h1 className="text-center dash-count">{summary.adminUsers.length}</h1>
                                                                    </div>
                                                                    <div className="col-sm-12 font-weight-bold">
                                                                        <p className="text-center">Admins</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-warning bg-warning">
                                                            <div className="row text-light">
                                                                <div className="col-sm-4 p-2">
                                                                    <FontAwesomeIcon icon={faUserEdit} size="4x" />
                                                                </div>
                                                                <div className="col-sm-8">
                                                                    <div className="col-sm-12">
                                                                        <h1 className="text-center dash-count">{summary.authorUsers.length}</h1>
                                                                    </div>
                                                                    <div className="col-sm-12 font-weight-bold">
                                                                        <p className="text-center">Authors</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3 m-3 m-md-1 my-md-4 border border-info bg-info">
                                                            <div className="row text-light">
                                                                <div className="col-sm-4 p-2">
                                                                    <FontAwesomeIcon icon={faUser} size="4x" />
                                                                </div>
                                                                <div className="col-sm-8">
                                                                    <div className="col-sm-12">
                                                                        <h1 className="text-center dash-count">{(summary.totalUserCount - summary.adminUsers.length - summary.authorUsers.length)}</h1>
                                                                    </div>
                                                                    <div className="col-sm-12 font-weight-bold">
                                                                        <p className="text-center">Users</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-12 my-4">
                                                    <h5 className="text-info">INSIGHTS</h5>
                                                </div>

                                                <div className="col-md-10 col-sm-12 mx-auto p-0">
                                                    <div className="row d-flex justify-content-center">

                                                        <div className="col-12 p-0">
                                                            <div className="col card box-shadow-md rounded-0">
                                                                <div className="card-header rounded-0 bg-info">
                                                                    <h6 className="text-light text-justify">CHART DEMONSTRATING EACH CATEGORY WIGHTAGE ON TOTAL NEWS</h6>
                                                                </div>
                                                                <div className="card-body">
                                                                    <Pie data={{
                                                                        labels: chartLabels,
                                                                        datasets: [{
                                                                            data: categories.data,
                                                                            backgroundColor: categories.backgroundColor,
                                                                            borderColor: 'rgba(54, 162, 235, 1)',
                                                                            borderWidth: 1
                                                                        }]
                                                                    }}

                                                                        options={{
                                                                            title: {
                                                                                display: true,
                                                                                text: 'CHART DEMONSTRATING EACH CATEGORY WIGHTAGE ON TOTAL NEWS',
                                                                            },
                                                                            legend: {
                                                                                labels: {
                                                                                    fontColor: "blue"
                                                                                }
                                                                            },
                                                                            rotation: -0.7 * Math.PI,
                                                                            maintainAspectRatio: false
                                                                        }}
                                                                        height={430}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div className="col-12 mt-5 p-0">
                                                            <div className="col card box-shadow-md rounded-0">
                                                                <div className="card-header rounded-0 bg-info">
                                                                    <h6 className="text-light text-justify">COMPARISON BETWEEN THIS AND PREVIOUS WEEK ON WHICH CATEGORY'S NEWS WAS MORE PREFERRED BY USERS </h6>
                                                                </div>
                                                                <div className="card-body">
                                                                    <Bar data={{
                                                                        labels: chartLabels,
                                                                        datasets: [{
                                                                            label: thisWeekData.label,
                                                                            data: thisWeekData.data,
                                                                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                                                            borderColor: 'rgba(54, 162, 235, 1)',
                                                                            borderWidth: 1
                                                                        },
                                                                        {
                                                                            label: previousWeekData.label,
                                                                            data: previousWeekData.data,
                                                                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                                                            borderColor: 'rgba(153, 102, 255, 1)',
                                                                            borderWidth: 1
                                                                        }
                                                                        ]
                                                                    }}

                                                                        options={{
                                                                            scales: {
                                                                                yAxes: [{
                                                                                    ticks: {
                                                                                        beginAtZero: true
                                                                                    }
                                                                                }]
                                                                            },
                                                                            maintainAspectRatio: false,
                                                                            legend: {
                                                                                labels: {
                                                                                    fontColor: "blue"
                                                                                }
                                                                            }
                                                                        }}

                                                                        height={400} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 p-0 mt-5">
                                                            <div className="col card box-shadow-md rounded-0">
                                                                <div className="card-header rounded-0 bg-info">
                                                                    <h6 className="text-light text-justify">COMPARISON BETWEEN THIS AND PREVIOUS MONTH ON WHICH CATEGORY'S NEWS WAS MORE PREFERRED BY USERS </h6>
                                                                </div>
                                                                <div className="card-body">
                                                                    <Bar data={{
                                                                        labels: chartLabels,
                                                                        datasets: [{
                                                                            label: thisMonthData.label,
                                                                            data: thisMonthData.data,
                                                                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                                                            borderColor: 'rgba(54, 162, 235, 1)',
                                                                            borderWidth: 1
                                                                        },
                                                                        {
                                                                            label: previousMonthData.label,
                                                                            data: previousMonthData.data,
                                                                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                                                            borderColor: 'rgba(153, 102, 255, 1)',
                                                                            borderWidth: 1
                                                                        }
                                                                        ]
                                                                    }}

                                                                        options={{
                                                                            scales: {
                                                                                yAxes: [{
                                                                                    ticks: {
                                                                                        beginAtZero: true
                                                                                    }
                                                                                }]
                                                                            },
                                                                            maintainAspectRatio: false,
                                                                            legend: {
                                                                                labels: {
                                                                                    fontColor: "blue"
                                                                                }
                                                                            }
                                                                        }}

                                                                        height={400} />
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div className="col-12 p-0 mt-5">
                                                            <div className="col card box-shadow-md rounded-0">
                                                                <div className="card-header rounded-0 bg-info">
                                                                    <h6 className="text-light text-justify">POPULAR NEWS THIS WEEK</h6>
                                                                </div>
                                                                <div className="card-body p-0">
                                                                    <NewsList news={popularThisWeek} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 p-0 mt-5">
                                                            <div className="col card box-shadow-md rounded-0">
                                                                <div className="card-header rounded-0 bg-info">
                                                                    <h6 className="text-light text-justify">POPULAR NEWS THIS MONTH</h6>
                                                                </div>
                                                                <div className="card-body p-0">
                                                                    <NewsList news={popularThisMonth} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                        : <Loading />
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

export default Dashboard;