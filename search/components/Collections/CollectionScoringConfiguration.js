import './collection-modal.css';

import React, { Component } from 'react';
import classnames from 'classnames';
import { Card, CardBody, CardHeader, Col, Row, ButtonGroup, Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

import BaseCollectionForm from './BaseCollectionForm';

export default class CollectionScoringConfiguration extends BaseCollectionForm {
  constructor(props) {
    super(props);
    this.state = {
      wasValidated: false,
      isModalOpen: false,

      collection: props.collection,
    };

    this._formEl = React.createRef();
  }

  render() {
    return (
      <div style={{ ...this.props.style }}>
        <div
          className='btn btn-primary'
          onClick={() => this._setModalActive(true)}>
          Scoring configuration
        </div>
        <Modal isOpen={this.state.isModalOpen} className='modal-primary collection-scoring-modal'>
          <ModalBody>
            <form ref={this._formEl} className={classnames({ 'was-validated': this.state.wasValidated })}>
              {this._renderBody()}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={this._save.bind(this)}>
              Set
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
    const text = { type: 'text' };

    return (
      <div className='row'>
        <div className='col-md-6'>
          <h4>Scoring configuration</h4>
          {this._renderInput('content', 'collection.scoring.boosts.content', false)}
          {this._renderInput('title', 'collection.scoring.boosts.title', false)}
          {this._renderInput('sub_title', 'collection.scoring.boosts.sub_title', false)}
        </div>
        <div className='col-md-6'>
          <h4>Decay configuration</h4>
          {this._renderInput('origin', 'collection.scoring.topic_datetime_decay.origin', true, text)}
          {this._renderInput('scale', 'collection.scoring.topic_datetime_decay.scale', true, text)}
          {this._renderInput('offset', 'collection.scoring.topic_datetime_decay.offset', true, text)}
          {this._renderInput('decay', 'collection.scoring.topic_datetime_decay.decay', true)}
        </div>
      </div>
    )
  }

  _renderInput(label, param, required, opts = { type: 'number', step: 'any' }) {
    return (
      <div className='form-group'>
        <label>{label}</label>
        <input
          className='form-control' {...opts}
          value={this._value(param)}
          onChange={this._handleInput(param)} required={required} />
        {required && (
          <div className='invalid-feedback'>
            This field is required
          </div>
        )}
      </div>
    )
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
    if (form.checkValidity() === false) {
      return;
    }

    this._setModalActive(false);
    this.props.onChange(this.state.collection);
  }
}