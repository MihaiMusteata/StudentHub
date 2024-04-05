import FilePresentIcon from '@mui/icons-material/FilePresent';
import ClearIcon from '@mui/icons-material/Clear';
import { ApiDeleteRequest, ApiDownloadDocument } from '../../../../scripts/api.tsx';
import { useContext, useState } from 'react';
import {
  LoadingOutlined, FileWordTwoTone, FilePdfTwoTone, FileExcelTwoTone, FileImageTwoTone, FileTextTwoTone, FileZipTwoTone,
} from '@ant-design/icons';
import { ToastContext } from '../../../../App.tsx';
import { Spin } from 'antd';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import { useUser } from '../../../../context/userContext.tsx';

export const iconMap: { [key: string]: JSX.Element } = {
  '.docx': <FileWordTwoTone twoToneColor='#0055ff' style={{fontSize: '20px'}} />,
  '.txt': <FileTextTwoTone twoToneColor='#798777' style={{fontSize: '20px'}} />,
  '.pdf': <FilePdfTwoTone twoToneColor='red' style={{fontSize: '20px'}} />,
  '.xls': <FileExcelTwoTone twoToneColor='#00a300' style={{fontSize: '20px'}} />,
  '.xlsx': <FileExcelTwoTone twoToneColor='#00a300' style={{fontSize: '20px'}} />,
  '.csv': <FileExcelTwoTone twoToneColor='green' style={{fontSize: '20px'}} />,
  '.png': <FileImageTwoTone twoToneColor='#886cc4' style={{fontSize: '20px'}} />,
  '.avif': <FileImageTwoTone twoToneColor='#886cc4' style={{fontSize: '20px'}} />,
  '.jpg': <FileImageTwoTone twoToneColor='#886cc4' style={{fontSize: '20px'}} />,
  '.jpeg': <FileImageTwoTone twoToneColor='#886cc4' style={{fontSize: '20px'}} />,
  '.zip': <FileZipTwoTone twoToneColor='orange' style={{fontSize: '20px'}} />,
  '.rar': <FileZipTwoTone twoToneColor='orange' style={{fontSize: '20px'}} />,
  'default': <FilePresentIcon />,
};

export interface LessonDocumentProps {
  setDocumentTrigger: (documentTrigger: string) => void;
  name: string;
  extension: string;
  documentId: number;
}

const LessonDocument = ({setDocumentTrigger, name, extension, documentId}: LessonDocumentProps) => {
  const setToastComponent = useContext(ToastContext);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const {user} = useUser();
  
  const downloadFile = (resource: number) =>{
    axios
    .get(`/api/Documents/download?id=${resource}`, {
      onDownloadProgress: (progressEvent) => {
        let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
        console.log(percentCompleted,"%");
      },
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const deleteDocument = async () => {
    setIsLoading(true);
    try {
      const result = await ApiDeleteRequest('deleteDocument', {documentId: documentId});
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
      <div className='col-12 text-dark d-flex align-items-center mb-3'>
        <div className='d-flex cursor-pointer' onClick={()=>downloadFile(documentId)}>
          {
            iconMap[extension] || iconMap['default']
          }
          <h6 className='font-weight-normal m-0 ms-2 text-start'>
            {name}
          </h6>
        </div>
        {
          user?.role === 'Teacher' &&
          <>
            {
              isLoading ? <LoadingOutlined className='ms-auto' /> :
                <Tooltip title={`Delete ${name}`} placement='top'>
                  <ClearIcon
                    className='ms-auto cursor-pointer'
                    onClick={deleteDocument}
                  />
                </Tooltip>
            }
          </>
        }
      </div>
    </Spin>
  );
};

export default LessonDocument;