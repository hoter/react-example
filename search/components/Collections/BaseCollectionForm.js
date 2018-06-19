import React, { Component } from 'react';
import _ from 'lodash';

export default class BaseCollectionForm extends Component {

  _value (param) {
    try {
      let tmp = this.state;
      const keys = param.split('.');
      keys.forEach((key, i) => tmp = tmp[key]);
      return tmp;
    }
    catch (e) {
      return '';
    }
  }

	_handleInput (param, valueParam = 'value') {
		return e => {
			const state = _.cloneDeep(this.state);
			const keys = param.split('.');
			let tmp = state;
			keys.forEach((key, i) => {
				if (keys.length - 1 == i) {
					tmp[key] = e.target[valueParam];
				}
				else {
					tmp = tmp[key];
				}
			});

			this.setState(state);
		};
	}
};