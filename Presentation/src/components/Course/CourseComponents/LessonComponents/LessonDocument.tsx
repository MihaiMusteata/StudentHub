import FilePresentIcon from '@mui/icons-material/FilePresent';
import ClearIcon from '@mui/icons-material/Clear';
import { ApiDeleteRequest } from '../../../../scripts/api.tsx';
import { useContext, useState } from 'react';
import {
  LoadingOutlined, FileWordTwoTone, FilePdfTwoTone, FileExcelTwoTone, FileImageTwoTone, FileTextTwoTone, FileZipTwoTone,
} from '@ant-design/icons';
import { ToastContext } from '../../../../App.tsx';
import { Spin } from 'antd';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';

const iconMap: { [key: string]: JSX.Element } = {
  '.docx': <FileWordTwoTone twoToneColor='#0055ff' style={{fontSize: '20px'}} />,
  '.txt': <FileTextTwoTone twoToneColor='#798777' style={{fontSize: '20px'}} />,
  '.pdf': <FilePdfTwoTone twoToneColor='red' style={{fontSize: '20px'}} />,
  '.xls': <FileExcelTwoTone twoToneColor='#00a300' style={{fontSize: '20px'}} />,
  '.xlsx': <FileExcelTwoTone twoToneColor='#00a300' style={{fontSize: '20px'}} />,
  '.csv': <FileExcelTwoTone twoToneColor='green' style={{fontSize: '20px'}} />,
  '.png': <FileImageTwoTone twoToneColor='#886cc4' style={{fontSize: '20px'}} />,
  '.jpg': <FileImageTwoTone twoToneColor='#886cc4' style={{fontSize: '20px'}} />,
  '.jpeg': <FileImageTwoTone twoToneColor='#886cc4' style={{fontSize: '20px'}} />,
  '.zip': <FileZipTwoTone twoToneColor='orange' style={{fontSize: '20px'}} />,
  '.rar': <FileZipTwoTone twoToneColor='orange' style={{fontSize: '20px'}} />,
  'default': <FilePresentIcon />,
};

export interface LessonDocumentProps {
  setDocumentTrigger: (documentTrigger: string) => void;
  lessonId: number;
  name: string;
  extension: string;
  documentId: number;
}

const LessonDocument = ({setDocumentTrigger, lessonId, name, extension, documentId}: LessonDocumentProps) => {
  const setToastComponent = useContext(ToastContext);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const downloadDocument = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/Documents/download?id=${documentId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([ response.data ]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name}${extension}`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      setIsLoading(false);
    } catch (error) {
      console.error('Error downloading document:', error);
      setToastComponent({type: 'error', message: 'Document download failed!'});
      setIsLoading(false);
    }
  };

  const deleteDocument = async () => {
    setIsLoading(true);
    try {
      const result = await ApiDeleteRequest('deleteLessonDocument', {lessonId, documentId});
      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Document deleted successfully!'});
        setDocumentTrigger(`Document ${documentId} deleted`);
      } else {
        result.body = JSON.parse(result.body);
        setToastComponent({type: 'error', message: 'Document deletion failed! ' + result.body.general});
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Spin spinning={isLoading} indicator={<></>}>
      <div className='col-12 text-dark d-flex justify-content-center align-items-center mb-3'>
        <div className='d-flex cursor-pointer' onClick={downloadDocument}>
          {
            iconMap[extension] || iconMap['default']
          }
          <h6 className='font-weight-normal m-0 ms-2 text-start'>
            {name}
          </h6>
        </div>
        {
          isLoading ? <LoadingOutlined className='ms-auto' /> :
            <Tooltip title={`Delete ${name}`} placement='top'>
              <ClearIcon
                className='ms-auto cursor-pointer'
                onClick={deleteDocument}
              />
            </Tooltip>
        }
      </div>
    </Spin>
  );
};

export default LessonDocument;