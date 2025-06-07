import ProductList from '../components/ProductList';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <h1>Products</h1>
      <ProductList />
    </Layout>
  );
}
