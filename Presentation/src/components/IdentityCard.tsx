import { FC, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FieldConfig as ModalFieldConfig } from './ModalForm';
import { DatePicker, Form, Input, Select } from 'antd';
import dayjs from 'dayjs';
import { ToastContext } from '../App';

export interface FieldConfig extends ModalFieldConfig {
  editable: boolean;
}

interface IdentityCardProps<T> {
  fields: FieldConfig[];
  title: string;
  handleSave: (data: T) => void;
}

const IdentityCard: FC<IdentityCardProps<any>> = ({handleSave, fields, title}) => {

  const navigate = useNavigate();
  const [ editingField, setEditingField ] = useState<string | null>(null);
  const [ previousFields, setPreviousFields ] = useState<string | null>(null);
  const [ state, setState ] = useState<FieldConfig[]>(fields);

  const [ form ] = Form.useForm();
  const setToastComponent = useContext(ToastContext);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRowClick = (name: string) => {
    form.validateFields([ previousFields ]).then(() => {
      setEditingField(name);
      setPreviousFields(name);
    }).catch(() => {
      return;
    });
  };

  const handleOk = () => {
    form.validateFields().then(() => {
      setEditingField(null);
      handleSave(state);
    }).catch(() => {
      setToastComponent({type: 'warning', message: 'Please complete all requirements before submitting!'});
      return;
    });
  };

  const handleFieldChange = (value: any, name: string) => {
    const updatedState = state.map(field => {
      if (field.key === name) {
        if (field.type === 'date') {
          value = value ? dayjs(value).format('YYYY-MM-DD') : undefined;
        }
        return {...field, value};
      }
      return field;
    });

    setState(updatedState);
  };

  useEffect(() => {
    setState(fields);
    const initialValues: any = {};

    state.forEach(field => {
      if (field.type === 'date') {
        initialValues[field.key] = field.value ? dayjs(field.value) : undefined;
      } else if (field.type === 'select') {
        const option = field.options?.find(option => option.value == field.value);
        initialValues[field.key] = option?.label;
      } else {
        initialValues[field.key] = field.value;
      }

    });

    form.setFieldsValue(initialValues);
  }, [ fields ]);
  
  return (
    <>
      <div className='container-fluid py-4'>
        <div className='row'>
          <div className='col-12'>
            <div className='card my-4'>
              <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2'>
                <div className='d-flex justify-content-between align-items-center bg-gradient-info shadow-info border-radius-lg pt-4 pb-3 px-3'>
                  <ArrowBackIcon style={{color: 'white', cursor: 'pointer'}} onClick={() => handleGoBack()} />
                  <h6 className='text-white text-capitalize mb-0'>{title}</h6>
                  <div className='bg-white border-radius-md'>
                    <button className='btn btn-outline-info btn-sm mb-0 border-0' onClick={() => handleOk()}>Save
                      Changes
                    </button>
                  </div>
                </div>
              </div>

              <div className='card-body px-0 pb-2'>
                <div className='table-responsive p-0'>
                  <table className='table mb-0'>

                    <tbody>
                    {state.map((field, index) => (
                      <>
                        <tr
                          key={index}
                          onClick={() => handleRowClick(field.key)}
                          style={{cursor: field.editable ? 'pointer' : 'default', height: '30px'}}
                        >
                          <td
                            className='text-end'
                            style={{width: '30%', fontWeight: 'bold', padding: '10px'}}
                          >{field.label}</td>
                          <td className='text-start' style={{width: '70%', padding: '10px'}}>
                            {editingField === field.key && field.editable ? (
                              <>
                                <Form
                                  form={form}
                                  initialValues={{remember: true}}
                                  onFinish={handleOk}
                                  scrollToFirstError
                                  className='align-middle text-start'
                                >
                                  <Form.Item
                                    name={field.key}
                                    hasFeedback
                                    rules={[
                                      {required: true, message: field.label + ' is required!'},
                                      ...(field.rules ?
                                        field.rules.map(rule => ({
                                          pattern: rule.pattern,
                                          message: rule.message,
                                          type: rule.type,
                                        }))
                                        : []),
                                    ]}
                                    style={{
                                      margin: '0',
                                      alignContent: 'center',
                                      justifyContent: 'center',
                                      width: '100%',
                                    }}
                                  >
                                    {field.type === 'text' && (
                                      <Input
                                        styles={{
                                          input: {
                                            fontSize: '16px',
                                            color: '#7b809a',
                                            display: 'default',
                                            fontFamily: '"Roboto", Helvetica, Arial, sans-serif',
                                          },
                                        }}
                                        allowClear
                                        placeholder={field.label}
                                        onChange={(e) => handleFieldChange(e.target.value, field.key)}
                                      />
                                    )}
                                    {field.type === 'select' && (
                                      <Select
                                        size='large'
                                        placeholder={field.label}
                                        allowClear
                                        defaultValue={field.value}
                                        onChange={(value) => handleFieldChange(value, field.key)}
                                      >
                                        {field.options && field.options.map((option, index) => (
                                          <Select.Option key={index} value={option.value}>{option.label}</Select.Option>
                                        ))}
                                      </Select>
                                    )}
                                    {field.type === 'date' && (
                                      <DatePicker
                                        allowClear
                                        placeholder={field.label}
                                        size='large'
                                        style={{width: '100%'}}
                                        onChange={(date) => handleFieldChange(date, field.key)}
                                      />
                                    )}
                                  </Form.Item>
                                </Form>
                              </>
                            ) : (
                              <>
                                {field.type === 'select' && field.options ? (
                                  <span>{field.options.find(option => option.value === field.value)?.label}</span>
                                ) : (
                                  <span>{String(field.value)}</span>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      </>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default IdentityCard;