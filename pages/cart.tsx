import { useCart } from '../context/CartContext';
import Layout from '../components/Layout';

export default function CartPage() {
  const { items, removeFromCart, increaseQty, decreaseQty, clearCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Layout>
      <h1>Your Cart</h1>
      {items.length === 0 ? (
        <p>Cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map(item => (
              <li key={item.id}>
                {item.name} - ${item.price} x {item.quantity}
                <button onClick={() => decreaseQty(item.id)}>-</button>
                <button onClick={() => increaseQty(item.id)}>+</button>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={clearCart}>Clear Cart</button>
        </>
      )}
      <p>Total: ${total}</p>
    </Layout>
  );
}
