import React from 'react';
import { Mutation } from 'react-apollo';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

const REMOVE_FROM_CART_MUTATION = gql`
	mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
		removeCartItem(id: $id) {
			id
		}
	}
`;

const BigButton = styled.button`
	font-size: 3rem;
	background: none;
	border: 0;
	&:hover {
		color: ${props => props.theme.red};
		cursor: pointer;
	}
`;

class RemoveFromCart extends React.Component {
	static propTypes = {
		id: PropTypes.string.isRequired
	};
	// This gets called as soon as we get a response back from the server after a mutation has been performed
	update = (cache, payload) => {
		// first read the cache
		const data = cache.readQuery({ query: CURRENT_USER_QUERY });
		// remove that item from the cart
		const cartItemId = payload.data.removeCartItem.id;
		data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);
		// write it back to the cache
		cache.writeQuery({ query: CURRENT_USER_QUERY, data });
	};
	render() {
		const { id } = this.props;
		return (
			<Mutation
				mutation={REMOVE_FROM_CART_MUTATION}
        update={this.update}
        optimisticResponse={{
          __typename: 'Mutation',
          removeCartItem: {
            __typename: 'CartItem',
            id: this.props.id,
          }
        }}
				variables={{ id }}
			>
				{(removeFromCart, { loading, error }) => (
					<BigButton
						title="Delete Item"
						disabled={loading}
						onClick={() => removeFromCart().catch(err => alert(err.message))}
					>
						&times;
					</BigButton>
				)}
			</Mutation>
		);
	}
}

export default RemoveFromCart;
