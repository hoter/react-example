import React, { Component } from 'react';
import { Table, Button } from 'reactstrap';

class CTable extends Component {
	state = {};

	rows = () => {
		// url = /#/collections/get?name=
		const { data, url, handleEdit, handleRemove } = this.props;
		return data && data.length ? data.map((val, index) => (
			<tr key={index}>
				{Object.keys(val).map((item, key) => (
					<td key={key}>{key === 0 ? <a href={`${url}${val[item]}`}>{val[item]}</a> : val[item]}</td>
				))}
				<td style={{ textAlign: 'right' }}>
					<Button onClick={() => handleEdit(val.name)} color='primary' style={{ marginRight: 5 }}>
						Edit
					</Button>
					<Button onClick={() => handleRemove(val.name)} color='danger' outline>
						Remove
					</Button>
				</td>
			</tr>
		)) : null;
	};

	header = () => {
    const { headerItems } = this.props;

    return headerItems && headerItems.length ? headerItems.map((val, index) => (
			<th style={{ textAlign: headerItems.length - 1 === index ? 'right' : 'left' }} key={index}>
				{val}
			</th>
		)) : null;
	};

	render () {
		return (
			<Table responsive>
				<thead>
					<tr>{this.header()}</tr>
				</thead>
				<tbody>{this.rows()}</tbody>
			</Table>
		);
	}
}

export default CTable;
