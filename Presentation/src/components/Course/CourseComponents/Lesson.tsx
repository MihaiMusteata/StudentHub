import { Button, Divider, Spin } from 'antd';
import LessonDocument from './LessonDocument.tsx';
import { FC, useContext, useEffect, useState } from 'react';
import { ApiDeleteRequest, ApiGetRequest, ApiResponse } from '../../../scripts/api.tsx';
import LessonTask from './LessonTask.tsx';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import DriveFileRenameOutlineTwoToneIcon from '@mui/icons-material/DriveFileRenameOutlineTwoTone';
import Tooltip from '@mui/material/Tooltip';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import axios, { AxiosResponse } from 'axios';
import { ToastContext } from '../../../App.tsx';
import EditLessonModal from './EditLessonModal.tsx';

const apiUploadDocument = async (lessonId: number, formData: FormData) => {
  try {
    const url = `/api/Lesson/upload-document/${lessonId}`;

    const response: AxiosResponse<ApiResponse> = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
    return {status: response.status, body: response.data};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      console.log('Axios Error:', axiosError);
      return {status: axiosError.response?.status || 400, body: axiosError.response?.data};
    } else {
      return {status: 400, body: 'Unknown error'};
    }
  }
};

export interface LessonData {
  id: number;
  courseId:number;
  name: string;
}

export interface Item {
  name: string;
  id: number;
}

interface Document extends Item {
  extension: string;
}

interface LessonProps {
  lesson: LessonData;
  onDeleteLesson: (lessonId: number) => void;
  onEditLesson: (lesson: LessonData) => void;
}

const Lesson: FC<LessonProps> = ({lesson, onDeleteLesson, onEditLesson}) => {
  const [ documents, setDocuments ] = useState<Document[]>([]);
  const [ tasks, setTasks ] = useState<Item[]>([]);
  const [ documentTrigger, setDocumentTrigger ] = useState<string>('');
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ isEditModalOpen, setIsEditModalOpen ] = useState<boolean>(false);
  const setToastComponent = useContext(ToastContext);

  const props: UploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    maxCount: 1,
    headers: {
      authorization: 'authorization-text',
    },
    async onChange(info) {
      setIsLoading(true);
      if (info.file.status === 'done') {
        const formData = new FormData();
        formData.append('file', info.file.originFileObj as File);
        try {
          const result = await apiUploadDocument(lesson.id, formData);
          if (result.status === 200) {
            setToastComponent({type: 'success', message: 'Document uploaded successfully!'});
            setDocumentTrigger(`Document ${documents.length + 1} uploaded`);
            setIsLoading(false);
          } else {
            result.body = JSON.parse(result.body);
            setToastComponent({type: 'error', message: 'Document upload failed! ' + result.body.general});
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const fetchDocuments = async () => {
    try {
      const result = await ApiGetRequest('lessonDocuments', {lessonId: lesson.id});
      if (result.status === 200) {
        setDocuments(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddTask = () => {
  };
  const DeleteLesson = async () => {
    try {
      const result = await ApiDeleteRequest('deleteLesson', {id: lesson.id});
      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Lesson deleted successfully!'});
        onDeleteLesson(lesson.id);
      } else {
        result.body = JSON.parse(result.body);
        setToastComponent({type: 'error', message: 'Lesson deletion failed! ' + result.body.general});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const EditLesson = () =>{
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchDocuments();
  }, [ documentTrigger ]);

  return (
    <>
      <li className='list-group-item border-0 p-4 mb-4 bg-gray-100 border-radius-lg'>
        <div className='d-flex align-items-center justify-content-between'>
          <h5 className='m-0'>{lesson.name}</h5>
          <div>
            <Tooltip title={`Rename ${lesson.name}`} placement='top'>
              <DriveFileRenameOutlineTwoToneIcon
                className='cursor-pointer'
                style={{color: '#03a9f4'}}
                onClick={EditLesson}
              />
            </Tooltip>
            <Tooltip title={`Delete ${lesson.name}`} placement='top'>
              <IndeterminateCheckBoxIcon className='cursor-pointer' style={{color: '#f44335'}} onClick={DeleteLesson} />
            </Tooltip>
          </div>
        </div>

        <Divider className='m-0 my-3' />

        {
          documents.map((item, index) => {
            return <LessonDocument
              key={index}
              name={item.name}
              documentId={item.id}
              extension={item.extension}
              lessonId={lesson.id}
              setDocumentTrigger={setDocumentTrigger}
            />;
          })
        }
        <LessonTask name={'Task 1'} id={1} />

        {
          tasks.map((item, index) => {
            return <LessonTask key={index} name={item.name} id={item.id} />;
          })
        }

        <div className='col-12 text-dark m-0 mt-4 p-0 d-flex justify-content-start mb-3 mb-lg-0 flex-column flex-sm-row'>

          <Spin spinning={isLoading} indicator={<LoadingOutlined />}>
            <Upload {...props} showUploadList={false} className='me-4 mb-3'>
              <Button type='dashed' icon={<UploadOutlined />} block>Upload New Document</Button>
            </Upload>
          </Spin>

          <Button type='dashed' onClick={handleAddTask}>
            + Add New Task
          </Button>
        </div>

      </li>
      {
        isEditModalOpen &&
        <EditLessonModal isModalOpen={isEditModalOpen} setIsModalOpen={setIsEditModalOpen} lesson={lesson} onEditLesson={onEditLesson} />
      }
    </>
  );
};
export default Lesson;
