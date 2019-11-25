import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Link from 'next/link';
import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

export const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
  <Query query={PAGINATION_QUERY}>
      {({ error, loading, data }) => {
        if(loading) return <p>Loading...</p>
        const count = data.itemsConnection.aggregate.count;
        const pages = Math.ceil(count / perPage);
        const page = props.page;
        return (
          <PaginationStyles data-test="pagination">
            <Link
              prefetch
              href={{
                pathname: 'items',
                query: { page: page-1 }
              }}>
              <a className="prev" aria-disabled={page<=1}>&larr; Prev</a>
            </Link>
            <p>Page {props.page} of  <span className="total-pages">{pages}</span></p>
            <p>{count} Items Total</p>
            <Link
              prefetch
              href={{
                pathname: 'items',
                query: { page: page+1 }
              }}>
              <a className="next" aria-disabled={page>=pages}>Next &rarr;</a>
            </Link>
          </PaginationStyles>
        )
      }}
    </Query>
);

export default Pagination