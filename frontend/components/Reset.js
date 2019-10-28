import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from 'prop-types';
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from './User';

const RESET_MUTATION = gql`
  mutation RESET_MUTATION($resetToken: String!, $newPassword: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken, newPassword: $newPassword, confirmPassword: $confirmPassword) {
      name
    }
  }
`;

export default class Signin extends Component {
  static PropTypes = {
    resetToken: PropTypes.string.isRequired
  };

  state = {
    newPassword: "",
    confirmPassword: ""
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{
          ...this.state,
          resetToken: this.props.resetToken
        }}
        refetchQueries={[
          { query: CURRENT_USER_QUERY }
        ]}
      >
        {(resetPassword, { loading, error, called }) => {
          return (
            <Form
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                const res = await resetPassword();
                this.setState({ newPassword: "", confirmPassword: "" });
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Choose a new password</h2>
                <Error error={error} />
                {! error && !loading && called && <p>Sucess! Password changed succesfully.</p>}
              </fieldset>
              <label htmlFor="email">
                New Password
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Your new password"
                  value={this.state.newPassword}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="email">
                Confirm New Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={this.state.confirmPassword}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Change password</button>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}
