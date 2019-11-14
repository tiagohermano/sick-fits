import React from 'react';
import Downshift, { resetIdCounter } from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import {
	Dropdown,
	DropdownItem,
	SearchStyles,
	DropDown,
	DropDownItem
} from './styles/DropDown';

const routeToItem = item => {
	Router.push({
		pathname: '/item',
		query: {
			id: item.id
		}
	});
};

const SEARCH_ITEMS_QUERY = gql`
	query SEARCH_ITEMS_QUERY($searchTerm: String!) {
		items(
			where: {
				OR: [
					{ title_contains: $searchTerm }
					{ description_contains: $searchTerm }
				]
			}
		) {
			id
			image
			title
		}
	}
`;

class AutoComplete extends React.Component {
	state = {
		items: [],
		loading: false
	};

	onChange = debounce(async (e, client) => {
		console.log('Searching...');
		this.setState({ loading: true });
		const res = await client.query({
			query: SEARCH_ITEMS_QUERY,
			variables: { searchTerm: e.target.value }
		});
		this.setState({
			items: res.data.items,
			loading: false
		});
	}, 350);

	render() {
    resetIdCounter();
		return (
			<SearchStyles>
				<Downshift
					onChange={routeToItem}
					itemToString={item => (item === null ? '' : item.title)}
				>
					{({
						getInputProps,
						getItemProps,
						isOpen,
						inputValue,
						highlightedIndex
					}) => (
						<div>
							<ApolloConsumer>
								{client => (
									<input
										{...getInputProps({
											type: 'search',
											classname: this.state.loading ? 'loading' : '',
											id: 'search',
											placeholder: 'Search for an item',
											onChange: e => {
												e.persist();
												this.onChange(e, client);
											}
										})}
									/>
								)}
							</ApolloConsumer>
							{isOpen && (
								<DropDown>
									{this.state.items.map((item, index) => (
										<DropDownItem
											key={item.id}
											{...getItemProps({ item })}
											highlighted={index === highlightedIndex}
										>
											<img width="50" src={item.image} alt={item.title} />
											{item.title}
										</DropDownItem>
									))}
									{!this.state.items.length && !this.state.loading && (
										<DropDownItem>Nothing found for {inputValue}</DropDownItem>
									)}
								</DropDown>
							)}
						</div>
					)}
				</Downshift>
			</SearchStyles>
		);
	}
}

export default AutoComplete;
