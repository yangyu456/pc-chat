
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';

import { Layout, Settings, Second, Home,Personal } from './pages';

const Main = withRouter(props => <Layout {...props} />);

export default () => {
    /* eslint-disable */
    return (
        <Main>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/contacts" component={Second} />
                <Route exact path="/personal" component={Personal} />
                <Route exact path="/settings" component={Settings} />
            </Switch>
        </Main>
    );
    /* eslint-enable */
};
