import './collection-modal.css';

import React, { Component } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { Card, CardBody, CardHeader, Col, Row, ButtonGroup, Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

export default class CollectionDynamicFieldsConfiguration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wasValidated: false,
      isModalOpen: false,
      
      collection: this.props.collection
    };

    this._formEl = React.createRef();
  }

  render() {
    return (
      <div style={{ ...this.props.style }}>
        <button
          disabled={this._getFields() === null}
          className='btn btn-primary' onClick={() => this._setModalActive(true)}>Dynamic fields</button>
        <Modal isOpen={this.state.isModalOpen} className='modal-primary collection-scoring-modal'>
          <ModalBody>
            <form ref={this._formEl} className={classnames({ 'was-validated': this.state.wasValidated })}>
              {this._renderBody()}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={this._save.bind(this)}>
              Save
            </Button>
            <Button color='secondary' onClick={() => this._setModalActive(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }

  _renderBody () {
    const fields = this._getFields();
    if (! fields) {
      return false;
    }

    const items = fields.map(field => {
      return (
        <div key={field.key} className='list-group-item'>
          {field.en} 
          <div style={{ float: 'right' }}>
            <input type='checkbox' className='form-control' style={{ width: 20, height: 20 }} />
          </div>
        </div>
      )
    });

    return (
      <div>
        <h5>Choose fields, on which you want to enable dynamic facets</h5>
        <div className='list-group'>
          {items}
        </div>
      </div>
    )
  }

  _renderInput(name, opts = { type: 'number', step: 'any' }) {
    return (
      <div className='form-group'>
        <label>{name}</label>
        <input
          className='form-control' {...opts} readOnly={! this.props.isEdit}
          value={this.state[name]}
          onChange={this._handleInput(name)} required/>
        <div className='invalid-feedback'>
          This field is required
        </div>
      </div>
    )
  }

  _getFields() {
    const { facets } = this.state.collection;
    if (! facets) {
      return null;
    }

    const keys = Object.keys(facets);
    keys.sort();

    return keys.map(key => ({
      key,
      ...facets[key]
    }));
  }

  _handleInput(prop) {
    return e => {
      this.setState({
        [prop]: e.target.value
      });
    };
  }

  _setModalActive(active) {
    this.setState({
      isModalOpen: active
    });
  }

  _save() {
    if (! this._formEl) {
      return;
    }

    this.setState({
      wasValidated: true
    });
    const form = this._formEl.current;

  }
}