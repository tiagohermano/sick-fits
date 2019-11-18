import PleaseSignIn from '../components/PleaseSignIn';
import Orders from '../components/Orders';

const OrdersPage = (props) => {
  return (
    <div>
      <PleaseSignIn>
        <Orders />
      </PleaseSignIn>
    </div>
  );
}

export default OrdersPage;
