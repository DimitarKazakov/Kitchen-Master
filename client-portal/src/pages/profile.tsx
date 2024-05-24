import { Layout } from '../components/layout/Layout';
import { withAuth } from '../config/withauth';

export const Profile = () => {
  return (
    <Layout>
      <h1>Test</h1>
    </Layout>
  );
};

export default withAuth(Profile);
