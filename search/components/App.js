import React, { Component } from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
// Styles
// CoreUI Icons Set
import '@coreui/icons/css/coreui-icons.min.css';
// Import Flag Icons Set
import 'flag-icon-css/css/flag-icon.min.css';
// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';
// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';
// Import Main styles for this application
import '../scss/style.css';

import { AppLayout } from '../views';
import { Login } from '../views/Pages';

class App extends Component {
	constructor(props) {
		super(props);

		// send one fetchUser request to see if we are still logged in
		props.fetchUser();
	}

	render () {
		let switchRoutes = false;
		const { user } = this.props;

		if (user) {
			switchRoutes = (
				<Switch>
					<Route path='/' name='Home' component={AppLayout} />
				</Switch>
			);
		}
		else {
			switchRoutes = (
				<Switch>
					<Route exact path='/login' name='Login Page' render={(props) => <Login {...props} />} />
					<Route path={'/'} render={() => <Redirect to={'/login'} />} />
				</Switch>
			);			
		}

		return <HashRouter>{switchRoutes}</HashRouter>;
	}
}

export default App;
