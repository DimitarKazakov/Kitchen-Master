import { Layout } from '../components/layout/Layout';
import { withAuth } from '../config/withauth';

export const Calculator = () => {
  return (
    <Layout>
      <></>
    </Layout>
  );
};

export default withAuth(Calculator);
