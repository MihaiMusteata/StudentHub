import SearchOffIcon from '@mui/icons-material/SearchOff';

const NotFoundPage = () => {
  return (
    <div className='container-fluid py-4'>
      <div className='row'>
        <div className='col-12'>
          <div className='card my-4'>
            <div className='card-body text-center'>
              <h1 className='m-0' style={{fontSize: '150px', fontWeight: '900', letterSpacing: '5px'}}>404</h1>
              <h1 style={{fontSize: '80px'}}>Not Found</h1>
              <div className='d-flex align-middle justify-content-center align-items-center'>
                <p className='lead text-center mb-0'>We couldn't find what you were looking for</p>
                <SearchOffIcon className='ms-2 text-danger' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NotFoundPage;