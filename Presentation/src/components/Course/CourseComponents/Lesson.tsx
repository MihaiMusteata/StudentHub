import { Button, Divider } from 'antd';
import LessonDocument from './LessonDocument.tsx';
import { useContext, useEffect, useState } from 'react';
import { ApiGetRequest, ApiResponse } from '../../../scripts/api.tsx';
import AddLessonResource from './AddLessonResource.tsx';
import { FieldConfig as ModalFields } from '../../ModalForm.tsx';
import LessonTask from './LessonTask.tsx';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import axios, { AxiosResponse } from 'axios';
import { ToastContext } from '../../../App.tsx';

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
  name: string;
  description: string;
}

export interface Item {
  name: string;
  id: number;
}

const Lesson = ({name, id}: { name: string, id: number }) => {
  const [ documents, setDocuments ] = useState<Item[]>([]);
  const [ tasks, setTasks ] = useState<Item[]>([]);
  const [ newItem, setNewItem ] = useState<string>('');
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ response, setResponse ] = useState<ApiResponse>({status: 0, body: ''});
  const setToastComponent = useContext(ToastContext);

  const props: UploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    maxCount: 1,
    headers: {
      authorization: 'authorization-text',
    },
    async onChange(info) {
      if (info.file.status === 'done') {
        const formData = new FormData();
        formData.append('file', info.file.originFileObj as File);
        try {
          const result = await apiUploadDocument(id, formData);
          if (result.status === 200) {
            setToastComponent({type: 'success', message: 'Document uploaded successfully!'});
            fetchDocuments();
          } else {
            result.body = JSON.parse(result.body);
            setToastComponent({type: 'error', message: 'Document upload failed! ' + result.body.general});
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
      const result = await ApiGetRequest('lessonDocuments', {lessonId: id});
      if (result.status === 200) {
        setDocuments(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddItem = () => {
    setIsModalOpen(true);
  };

  const selectItemType = (data: ModalFields[]) => {
    setNewItem(data[0].value as string);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <>
      <li className='list-group-item border-0 p-4 mb-4 bg-gray-100 border-radius-lg'>
        <h5 className='m-0'>{name}</h5>
        <Divider className='m-0 my-3' />

        {
          documents.map((item, index) => {
            return <LessonDocument key={index} name={item.name} id={item.id} />;
          })
        }
        <LessonTask name={'Task 1'} id={1} />

        {
          tasks.map((item, index) => {
            return <LessonTask key={index} name={item.name} id={item.id} />;
          })
        }

        <div className='col-12 text-dark m-0 mt-4 p-0 d-flex justify-content-start mb-3 mb-lg-0 p-0 flex-column flex-sm-row'>
          <Upload {...props} showUploadList={false} className='me-4 mb-3'>
            <Button type='dashed' icon={<UploadOutlined />} block>Upload New Document</Button>
          </Upload>

          <Button type='dashed' onClick={handleAddItem}>
            + Add New Task
          </Button>
        </div>

      </li>
      {
        isModalOpen && <AddLessonResource
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          handleSave={selectItemType}
        />
      }
    </>
  );
};
export default Lesson;
