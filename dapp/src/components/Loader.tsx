import Spinner from 'react-bootstrap/Spinner';

const Loader = () => (
  <div className="Spinner">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

export default Loader;
