import React from "react";
import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from "./User";
import Signout from './Signout';

export default function components() {
  return (
    <User>
      {({ data: { me } }) => (
        <NavStyles>
          <Link href="/items">
            <a>Shop</a>
          </Link>
          {me && (
            <>
              <Link href="/sell">
                <a>Sell</a>
              </Link>
              <Link href="/orders">
                <a>Orders</a>
              </Link>
              <Link href="/me">
                <a>Account</a>
              </Link>
              <Signout />
            </>
          )}
          {!me && (
            <Link href="/signup">
              <a>Sign in</a>
            </Link>
          )}
        </NavStyles>
      )}
    </User>
  );
}
