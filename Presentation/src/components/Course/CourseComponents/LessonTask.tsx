import ClearIcon from '@mui/icons-material/Clear';
import TaskIcon from '@mui/icons-material/Task';

const LessonTask = ({name, id}: { name: string, id?: number }) => {
  const accessTask = () => {
    console.log('Download document:', id);
  };
  const deleteDocument = () => {
    console.log('Delete document:', id);
  };
  return (
    <div className='col-12 text-dark d-flex justify-content-center align-items-center mb-3'>
      <div className='d-flex cursor-pointer' onClick={accessTask}>
        <TaskIcon style={{color: '#3498db'}} />
        <h6 className='font-weight-normal m-0 ms-2 text-start'>
          {name}
        </h6>
      </div>
      <ClearIcon className='ms-auto cursor-pointer' onClick={deleteDocument} />
    </div>
  );
};
export default LessonTask;