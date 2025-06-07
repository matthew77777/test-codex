import ProductItem from './ProductItem';
import { products } from '../data/products';

const ProductList = () => {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
