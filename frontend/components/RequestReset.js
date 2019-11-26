import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

export const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

export default class Signin extends Component {
  state = {
    email: ""
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <Mutation
        mutation={REQUEST_RESET_MUTATION}
        variables={this.state}
      >
        {(requestReset, { loading, error, called }) => {
          return (
            <Form
              method="post"
              data-test="form"
              onSubmit={async e => {
                e.preventDefault();
                const res = await requestReset();
                this.setState({ email: "" });
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Request a Password reset</h2>
                <Error error={error} />
                {! error && !loading && called && <p>Sucess! Check your e-mail for a reset link.</p>}
              </fieldset>
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  value={this.state.email}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Request Reset</button>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}
