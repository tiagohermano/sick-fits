import React from 'react';
import Link from 'next/link';

export default function components() {
  return (
    <div>
      <Link href="/sell">
        <a>Sell!</a>
      </Link>
      <Link href="/">
        <a>Home</a>
      </Link>
    </div>
  );
}
