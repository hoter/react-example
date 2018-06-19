import 'lyef-switch-button/css/main.css';

import React, { Component } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { Card, CardBody, CardHeader, Col, Row, ButtonGroup, Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import SwitchButton from 'lyef-switch-button';
import isUrl from 'is-url';

import BaseCollectionForm from './BaseCollectionForm';
import CollectionHistogram from './CollectionHistogram';
import CollectionScoringConfiguration from './CollectionScoringConfiguration';
import CollectionDynamicFieldsConfiguration from './CollectionDynamicFieldsConfiguration';

const defaultIcon = 'https://storage.googleapis.com/bdbq-public/eyfo-sources-logos/blank.jpg';

const collectionIconStyle = {
	width: 150, height: 150,
	borderRadius: 150,
	objectFit: 'contain',
	marginBottom: 20
};
 
export default class CollectionForm extends BaseCollectionForm {
	constructor (props) {
		super(props);

		this.state = {
			isEdit: this.props.isNew,

			wasValidated: false,
			isModalOpen: false,
			collection: null
		};

		this._formEl = React.createRef();
		this._handleEditClick = this._handleEditClick.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		if (props.isNew) {
			if (state.collection)	{
				return null;
			}
			else {
				return {
					collection: {
						name: {},
						description: {},
						searchable: false
					}
				}
			}
		}

		if (JSON.stringify(state.collection) == JSON.stringify(props.collection)) {
			return null
		}
		if (state.collection && props.collection && state.collection.key == props.collection.key) {
			return null;
		}
		return {
			isModalOpen: false,
			collection: props.collection
		};
	}

	componentDidMount () {
		if (! this.props.isNew) {
			this.props.getCollection(this.props.match.params.name);
		}
	}

	render () {
		if (this.props.isLoading || ! this.state.collection) {
			return 'Loading...';
		}

		const col = this.state.collection;
		
		return (
			<div>
				<Row>
					{this._renderFirstPanel(col)}
					{this._renderSecondPanel(col)}
					<Modal isOpen={this.state.isModalOpen} className={'modal-danger'}>
						<ModalBody>Remove {col.name ? `'${col.name.en}'` : 'this'} collection?</ModalBody>
						<ModalFooter>
							<Button color='danger' onClick={() => this._handleConfirmRemove()}>
								Delete
							</Button>{' '}
							<Button color='secondary' onClick={() => this._setModalActive(false)}>
								Cancel
							</Button>
						</ModalFooter>
					</Modal>
				</Row>
				{this._renderStats(col)}
			</div>
		);
	}

	_renderStats (col) {
		if (this.state.isEdit) {
			return false;
		}

		return <CollectionHistogram />;
	}

	_renderEditBtn () {
		const { isEdit } = this.state;
		const styles = isEdit ? {
			opacity: 0, cursor: 'default'
		} : { opacity: 1, cursor: 'pointer' };

		return (
			<div
				style={{ float: 'right', ...styles }}
				onClick={() => !isEdit && this._handleEditClick()}>
				<i className='icon-pencil' style={{ fontSize: '18px' }}></i>
			</div>
		);
	}

	renderDeleteBtn() {
		if (this.props.isNew) {
			return false;
		}
	
		return (
			<div className='row' style={{ paddingRight: 15 }}>
				<div
					className='btn btn-danger'
					style={{ paddingRight: '30px', marginLeft: 'auto' }}
					onClick={() => this._setModalActive(true)} >
					<i className='icon-trash'></i> Delete Collection
				</div>
			</div>
		)
	}

	_renderSaveBtn () {
		if (! this.state.isEdit) {
			return false;
		}

		const onClick = () => {
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

			if (this.props.isNew) {
				this.props.addCollection(this.state.collection);
			} else {
				alert('No save collection API');
			}
		};

		return (
			<div className='d-block'>
				<button
					onClick={onClick}
					className='btn btn-primary'
					disabled={this.props.isLoading}
					style={{ float: 'right', marginTop: 10 }}>
					{this.props.isNew ? 'Create collection' : 'Save changes'}
				</button>
			</div>
		)
	}

	_renderImage (col) {
		const urlInput = this.state.isEdit ? (
			<div className='form-group'>
				<label>Collection icon URL</label>
				<input
					className='form-control' type='text'
					value={col.icon || ''}
					onChange={this._handleInput('collection.icon')} required/>
				<div className='invalid-feedback'>
					This field is required
				</div>
			</div>
		) : false;

		const src = isUrl(col.icon) ? col.icon : defaultIcon;

		return (
			<div>
				<img className='img-thumbnail mx-auto d-block' src={src} style={collectionIconStyle} />
				{urlInput}
			</div>
		)
	}

	_renderFirstPanel (col) {
		const readOnly = ! this.state.isEdit;

		return (
			<div className='col-xs-12 col-sm-12 col-md-3' style={{ paddingRight: 7.5 }}>
				<Card>
					<CardBody>
						<form ref={this._formEl} className={classnames({ 'was-validated': this.state.wasValidated })}>
							{this._renderEditBtn()}

							{this._renderImage(col)}

							<div className='form-group'>
								<label>Collection name (EN)</label>
								<input
									className='form-control' type='text' readOnly={readOnly}
									value={this.state.collection.name.en}
									onChange={this._handleInput('collection.name.en')} required/>
								<div className='invalid-feedback'>
									This field is required
								</div>
							</div>

							<div className='form-group'>
								<label>Collection name (HE)</label>
								<input
									className='form-control' type='text' readOnly={readOnly}
									value={this.state.collection.name.he}
									onChange={this._handleInput('collection.name.he')} required/>
								<div className='invalid-feedback'>
									This field is required
								</div>
							</div>

							<div className='form-group'>
								<label>Collection description (EN)</label>
								<textarea className='form-control' readOnly={readOnly}
									value={this.state.collection.description.en}
									onChange={this._handleInput('collection.description.en')} required/>
								<div className='invalid-feedback'>
									This field is required
								</div>
							</div>
							
							<div className='form-group'>
								<label>Collection description (HE)</label>
								<textarea className='form-control' readOnly={readOnly}
									value={this.state.collection.description.he}
									onChange={this._handleInput('collection.description.he')} required/>
								<div className='invalid-feedback'>
									This field is required
								</div>
							</div>

							{this._renderSwitchBtn(col)}

							{this._renderSaveBtn()}
						</form>
					</CardBody>
				</Card>
			</div>			
		)		
	}

	_renderSwitchBtn (col) {
		return (
			<SwitchButton
				id='is-searchable-btn'
				labelLeft='Is Searchable'
				disabled={! this.state.isEdit}
				value={this.state.collection.searchable}
				onChange={this._handleInput('collection.searchable', 'checked')} />
		)
	}

	_renderSecondPanel (col) {
		if (this.props.isNew) {
			return false;
		}

		return (
			<div className='col-xs-12 col-sm-12 col-md-9' style={{ paddingLeft: 7.5 }}>
				<Card>
					<CardBody>
						<div style={{ paddingLeft: 10 }}>
							<Row>
								Number of documents: 100
							</Row>
							<Row>
								Last document ingested: {(new Date()).toLocaleDateString()}
							</Row>
							<Row>
								Associated crawlers
							</Row>
							<div className='row' style={{ paddingTop: 10 }}>
								<a
									style={{ marginRight: 5 }}
									href={'#/collections/pinned/' + this.props.match.params.name}
									className='btn btn-primary'>
									Pinned documents
								</a>
								<CollectionScoringConfiguration
									onChange={collection => this.setState({ collection })}
									collection={this.state.collection} />
								<CollectionDynamicFieldsConfiguration
									style={{ marginLeft: 5 }}
									onChange={collection => this.setState({ collection })}
									collection={this.state.collection} />
							</div>
						</div>
					</CardBody>
				</Card>
				{this.renderDeleteBtn()}
			</div>				
		)
	}

	_setModalActive(active) {
		this.setState({
			isModalOpen: active
		});
	}

	_handleEditClick() {
		this.setState({
			isEdit: true
		});
	};

	_handleConfirmRemove () {
		this.props.removeCollection(this.state.collection.name);
		this._setModalActive(false);
	}	
}