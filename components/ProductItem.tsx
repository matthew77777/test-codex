import Image from 'next/image';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

const ProductItem = ({ product }: Props) => {
  const { addToCart } = useCart();
  return (
    <div className="product-item">
      <Image src={product.image} alt={product.name} width={200} height={200} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
};

export default ProductItem;
