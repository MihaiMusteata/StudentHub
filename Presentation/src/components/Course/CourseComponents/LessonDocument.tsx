import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ClearIcon from '@mui/icons-material/Clear';

const LessonDocument = ({name, id}: { name: string, id?: number }) => {
  const downloadDocument = () => {
    console.log('Download document:', id);
  };
  const deleteDocument = () => {
    console.log('Delete document:', id);
  };
  return (
    <div className='col-12 text-dark d-flex justify-content-center align-items-center mb-3'>
      <div className='d-flex cursor-pointer' onClick={downloadDocument}>
        <PictureAsPdfIcon style={{color: '#ee0000'}} />
        <h6 className='font-weight-normal m-0 ms-2 text-start'>
          {name}
        </h6>
      </div>
      <ClearIcon className='ms-auto cursor-pointer' onClick={deleteDocument} />
    </div>
  );
};

export default LessonDocument;