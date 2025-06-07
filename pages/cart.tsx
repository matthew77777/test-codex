import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <header>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/cart">Cart ({items.length})</Link>
        </nav>
      </header>
      <main style={{ padding: '1rem' }}>
        <h1>Your Cart</h1>
        {items.length === 0 ? (
          <p>Cart is empty.</p>
        ) : (
          <ul>
            {items.map(item => (
              <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                {item.name} x {item.quantity} - ${item.price * item.quantity}
                <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '0.5rem' }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <p>Total: ${total}</p>
      </main>
    </div>
  );
}
