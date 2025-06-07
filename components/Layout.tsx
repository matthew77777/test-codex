import Link from 'next/link';
import { ReactNode } from 'react';
import { useCart } from '../context/CartContext';

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/cart">Cart ({count})</Link>
        </nav>
      </header>
      <main className="container">{children}</main>
    </div>
  );
};

export default Layout;
