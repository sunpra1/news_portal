import React from 'react';
import { Link } from 'react-router-dom';

export default function NewsList(props) {
    const { news } = props;
    if (news.length > 0) {
        return (
            <div className="table-responsive p-0 hide-scrollbar" style={{maxHeight: "400px", overflowY: "scroll"}}>
                <table className="table table-stripped table-bordered table-hover">
                    <thead>
                        <tr className="bg-info text-light">
                            <th>DETAILS</th>
                            <th>CATEGORY</th>
                            <th>COMMENTS</th>
                            <th>VIEWS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            news.map(news => {
                                return (
                                    <tr key={news._id}>
                                        <td><Link to={{
                                            pathname: `/news/view/${news._id}`,
                                            news
                                        }}>{news.title}</Link></td>
                                        <td>{news.category.category}</td>
                                        <td>{news.comments.length}</td>
                                        <td>{news.views}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    } else {
        return (
            <div className="table-responsive">
                <table className="table table-stripped table-bordered table-hover">
                    <thead>
                        <tr className="bg-info text-light">
                            <th>DETAILS</th>
                            <th>CATEGORY</th>
                            <th>COMMENTS</th>
                            <th>VIEWS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="4" className="text-danger text-center">No News Found</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

