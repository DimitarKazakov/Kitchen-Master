import { Layout } from '../components/layout/Layout';
import { withAuth } from '../config/withauth';

export const Home = () => {
  return (
    <Layout>
      <h1>Test</h1>
    </Layout>
  );
};

export default withAuth(Home);
