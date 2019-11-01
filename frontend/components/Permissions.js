import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';
import PropTypes from 'prop-types';

const possiblePermissions = [
	'ADMIN',
	'USER',
	'ITEMCREATE',
	'ITEMUPDATE',
	'ITEMDELETE',
	'PERMISSIONUPDATE'
];

const ALL_USERS_QUERY = gql`
	query ALL_USERS_QUERY {
		users {
			id
			name
			email
			permissions
		}
	}
`;

export default function Permissions(props) {
	return (
		<Query query={ALL_USERS_QUERY}>
			{({ data, loading, error }) => (
				<div>
					<Error error={error} />
					<div>
						<h2>Manage Permissions</h2>
						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									{possiblePermissions.map(permission => (
										<th key={permission}>{permission}</th>
									))}
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{data.users.map(user => (
									<UserPermissions key={user.id} user={user} />
								))}
							</tbody>
						</Table>
					</div>
				</div>
			)}
		</Query>
	);
}

class UserPermissions extends React.Component {
	static propTypes = {
		user: PropTypes.shape({
			name: PropTypes.string,
			email: PropTypes.string,
			id: PropTypes.string,
			permissions: PropTypes.array
		}).isRequired
	};
	handlePermissionChange = e => {
		const { checked, value } = e.target;
		let updatedPermissions = [...this.state.permissions];
		if (checked) {
			updatedPermissions.push(value);
			this.setState({
				permissions: updatedPermissions
			});
		} else {
			updatedPermissions = updatedPermissions.filter(
				permission => permission !== value
			);
			this.setState({
				permissions: updatedPermissions
			});
		}
	};
	state = {
		permissions: this.props.user.permissions
	};
	render() {
		const user = this.props.user;
		return (
			<tr>
				<td>{user.name}</td>
				<td>{user.email}</td>
				{possiblePermissions.map(permission => (
					<td key={permission}>
						<label htmlFor={`${user.id}-permission-${permission}`}>
							<input
								type="checkbox"
								checked={this.state.permissions.includes(permission)}
								value={permission}
								onChange={this.handlePermissionChange}
							/>
						</label>
					</td>
				))}
				<td>
					<SickButton>Update</SickButton>
				</td>
			</tr>
		);
	}
}
