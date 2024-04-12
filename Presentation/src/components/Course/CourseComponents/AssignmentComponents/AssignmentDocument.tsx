import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Tooltip from '@mui/material/Tooltip';
import ClearIcon from '@mui/icons-material/Clear';
import { useContext, useState } from 'react';
import { ApiDeleteRequest, ApiDownloadDocument } from '../../../../scripts/api.tsx';
import { Document } from '../LessonComponents/Lesson.tsx';
import { ToastContext } from '../../../../App.tsx';
import { ProgressBar } from '../../../../scripts/linear-progress.tsx';

interface AssignmentDocumentProps {
  documentId: number;
  icon: JSX.Element;
  title: string;
  time?: string;
  permission?: boolean;
  extension: string;
  setDocumentTrigger?: (documentTrigger: string) => void;
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
  const [ progress, setProgress ] = useState<number>(-1);
  const setToastComponent = useContext(ToastContext);
  const deleteDocument = async (documetId: number) => {
    try {
      const result = await ApiDeleteRequest('deleteDocument', {documentId: documetId});
      if (result.status === 200) {
        if (setDocumentTrigger) {setDocumentTrigger(`Document ${documentId} deleted`);}
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
    await ApiDownloadDocument(document.name, document.extension, 'downloadDocument', setProgress, setIsLoading, setToastComponent, {documentId: document.id});
  };
  return (
    <>
      <Spin
        spinning={isLoading}
        indicator={<LoadingOutlined />}
      >
        <div className='timeline-block mb-0'>
          <div className='d-flex '>
            <div
              className='cursor-pointer'
              onClick={() => downloadDocument({id: documentId, name: title, extension: extension})}
            >
              <span className='timeline-step'>
                {icon}
              </span>
              <div className='timeline-content'>
                <h6 className='text-dark text-sm font-weight-bold mb-0'>{title}</h6>
                {
                  time &&
                  <p className='text-secondary font-weight-bold text-xs mt-1 mb-0'>{time}</p>
                }
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
      <div className='timeline-block'>
        <div className='timeline-content'>
          <ProgressBar progress={progress} />
        </div>
      </div>
    </>
  );
};
export default AssignmentDocument;