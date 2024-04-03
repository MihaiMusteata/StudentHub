import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Tooltip from '@mui/material/Tooltip';
import ClearIcon from '@mui/icons-material/Clear';
import { useContext, useState } from 'react';
import { ApiDeleteRequest, ApiDownloadDocument } from '../../../../scripts/api.tsx';
import { Document } from '../LessonComponents/Lesson.tsx';
import { ToastContext } from '../../../../App.tsx';

interface AssignmentDocumentProps {
  documentId: number;
  icon: JSX.Element;
  title: string;
  time?: string;
  permission?: boolean;
  extension: string;
  setDocumentTrigger: (documentTrigger: string) => void;
}

const AssignmentDocument = ({
  documentId,
  icon,
  title,
  time,
  permission,
  extension,
  setDocumentTrigger,
}: AssignmentDocumentProps) => {
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const setToastComponent = useContext(ToastContext);
  const deleteDocument = async (documetId: number) => {
    try {
      const result = await ApiDeleteRequest('deleteDocument', {documentId: documetId});
      if (result.status === 200) {
        setDocumentTrigger(`Document ${documentId} deleted`);
        setToastComponent({type: 'success', message: 'Document deleted successfully!'});
      } else {
        result.body = JSON.parse(result.body);
        setToastComponent({type: 'error', message: 'Document deletion failed! ' + result.body.general});
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const downloadDocument = async (document: Document) => {
    setIsLoading(true);
    try {
      console.log('Document:', document);
      await ApiDownloadDocument(document.name, document.extension, 'downloadDocument', {documentId: document.id});
      setIsLoading(false);
    } catch (error) {
      console.error('Error downloading document:', error);
      setToastComponent({type: 'error', message: 'Document download failed!'});
      setIsLoading(false);
    }
  };
  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined />}
    >
      <div className='timeline-block mb-3'>
        <div className='d-flex '>
          <div className='cursor-pointer' onClick={() => downloadDocument({id: documentId, name: title, extension})}>
          <span className='timeline-step'>
            {icon}
          </span>
            <div className='timeline-content'>
              <h6 className='text-dark text-sm font-weight-bold mb-0'>{title}</h6>
              <p className='text-secondary font-weight-bold text-xs mt-1 mb-0'>{time}</p>
            </div>
          </div>
          {
            permission &&
            <div className='ms-auto'>
              <Tooltip title={`Delete ${title}`} placement='top'>
                <ClearIcon
                  className='cursor-pointer'
                  onClick={() => deleteDocument(documentId)}
                />
              </Tooltip>
            </div>
          }
        </div>
      </div>
    </Spin>
  );
};
export default AssignmentDocument;