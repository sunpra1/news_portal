import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

class AdminOrAuthorRoute extends Component {
    static contextType = UserContext;

    render() {
        const { component: Component, ...rest } = this.props;
        const { user } = this.context;

        return (
            <Route
                {...rest}
                render={props =>
                    user && (user.role === "ADMIN" || user.role === "AUTHOR")
                        ?
                        <Component {...props} />
                        :
                        (
                            user
                                ?
                                <Redirect to={{ pathname: "/", state: { from: props.location } }} />
                                :
                                <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
                        )

                }
            />
        );
    }
}

export default AdminOrAuthorRoute;