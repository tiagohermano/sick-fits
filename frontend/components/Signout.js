import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

export const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_MUTATION {
    signout {
      message
    }
  }
`;

export default function Signout() {
  return (
    <Mutation
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      mutation={SIGNOUT_MUTATION}
    >
      {((signout, {loading, error}) => (
        <button onClick={signout}>Sign Out</button>
      ))}
    </Mutation>
  );
}
