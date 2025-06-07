import Link from 'next/link';
import ProductList from '../components/ProductList';

export default function Home() {
  return (
    <div>
      <header>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/cart">Cart</Link>
        </nav>
      </header>
      <main style={{ padding: '1rem' }}>
        <h1>Products</h1>
        <ProductList />
      </main>
    </div>
  );
}
