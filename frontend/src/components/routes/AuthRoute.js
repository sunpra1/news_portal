import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

class AuthRoute extends Component {
    static contextType = UserContext;

    render() {
        const { component: Component, ...rest } = this.props;
        const { user } = this.context;

        return (
            <Route
                {...rest}
                render={props =>
                    user
                        ?
                        <Component {...props} />
                        :
                        <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
                }
            />
        )
    }
}

export default AuthRoute;