import { FC, useContext, useEffect, useState } from 'react';
import { DatePicker, Form, Input, Modal, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { ApiResponse } from '../../scripts/api.tsx';
import { ToastContext } from '../../App.tsx';

// Target
interface TargetField {
  createField(field: FieldConfig): JSX.Element;
}

// Adapter
class FieldAdapterImpl implements TargetField {
  private adaptee: Adaptee = new Adaptee();

  createField(field: FieldConfig): JSX.Element {
    return this.adaptee.adaptField(field);
  }
}

// Adaptee
class Adaptee {
  private style = {height: '50px', fontSize: '16px', width: '100%'};
  adaptField(field: FieldConfig): JSX.Element {
    switch (field.type) {
      case 'text':
        return (
          <Input
            style={this.style}
            allowClear
            placeholder={field.label}
          />
        );
      case 'select':
        return (
          <Select
            style={this.style}
            size='large'
            placeholder={field.label}
            allowClear
          >
            {field.options &&
              field.options.map((option, index) => (
                <Select.Option key={index} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
          </Select>
        );
      case 'multiple-select':
        return (
          <Select
            mode='multiple'
            style={this.style}
            size='large'
            placeholder={field.label}
            allowClear
          >
            {field.options &&
              field.options.map((option, index) => (
                <Select.Option key={index} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
          </Select>
        );
      case 'date':
        return (
          <DatePicker
            allowClear
            placeholder={field.label}
            size='large'
            style={{width: '100%', height: '50px'}}
          />
        );
      case 'time':
        return (
          <TimePicker
            format={'HH:mm'}
            allowClear
            placeholder={field.label}
            size='large'
            style={{width: '100%', height: '50px'}}
          />
        );
      default:
        return <></>;
    }
  }
}

interface Rule {
  pattern?: RegExp;
  min?: number;
  max?: number;
  type?: 'email' | 'number';
  required?: boolean;
  message: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'time' | 'multiple-select';
  rules?: Rule[];
  value: string | number | undefined | Dayjs;
  options?: { value: string; label: string }[];
}

interface ModalFormProps<T> {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  fields: FieldConfig[];
  title: string;
  handleSave: (data: T) => void;
  response?: ApiResponse;
}

const ModalForm: FC<ModalFormProps<any>> = ({
  isModalOpen,
  setIsModalOpen,
  fields,
  title,
  handleSave,
  response,
}) => {
  const [ state, setState ] = useState<FieldConfig[]>(fields);
  const setToastComponent = useContext(ToastContext);
  const [ form ] = Form.useForm();
  const fieldAdapter: TargetField = new FieldAdapterImpl();

  const handleOk = () => {
    form.validateFields().then(() => {
      console.log('data:', data);
      handleSave(data);
    }).catch(() => {
      setToastComponent({type: 'warning', message: 'Please complete all requirements before submitting!'});
    });
    const data = state.map(field => {
      if (field.type === 'date') {
        return {...field, value: field.value ? dayjs(field.value).format('YYYY-MM-DD') : undefined};
      }
      if (field.type === 'time') {
        return {...field, value: field.value ? dayjs(field.value).format('HH:mm') : undefined};
      }
      return field;
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    let updatedState = state.map(field => ({
        ...field,
        value: allValues[field.key],
      }
    ));

    form.validateFields(Object.keys(changedValues));
    setState(updatedState);
  };

  useEffect(() => {
    setState(fields);
    const initialValues: any = {};

    state.forEach(field => {
      if (field.type === 'date') {
        initialValues[field.key] = field.value ? dayjs(field.value) : undefined;
      } else {
        initialValues[field.key] = field.value;
        field.value ? form.validateFields([ field.key ]) : form.resetFields([ field.key ]);
      }
    });

    form.setFieldsValue(initialValues);
  }, [ fields ]);

  useEffect(() => {
    if (response?.status === 200) {
      setIsModalOpen(false);
    } else {
      const errorFields: any[] = [];
      fields.forEach(field => {
        if (response?.body && response.body[field.key]) {
          errorFields.push({
            name: field.key,
            errors: [ response.body[field.key] ],

          });
        }
      });
      form.setFields(errorFields);
    }
  }, [ response ]);

  return (
    <>
      <Modal
        title={<span style={{fontSize: '20px'}}>{title}</span>}
        open={isModalOpen}
        onOk={handleOk}
        okText='Save changes'
        onCancel={handleCancel}
        cancelText='Cancel'
        centered
        footer={[
          <button key='back' className='btn bg-gradient-primary' onClick={handleCancel}>
            Cancel
          </button>,
          <button key='submit' className='btn bg-gradient-success' style={{marginLeft: '10px'}} onClick={handleOk}>
            Save changes
          </button>,
        ]}
      >
        <Form
          className='row'
          form={form}
          name='modal'
          initialValues={{remember: true}}
          onFinish={handleOk}
          style={{maxWidth: 500}}
          scrollToFirstError
          onValuesChange={handleValuesChange}
        >
          {state?.map((field, index) => {
            const isDateAndTimeAdjacent = field.type === 'date' && index + 1 < state.length && state[index + 1].type === 'time';
            const isTimeAndDateAdjacent = field.type === 'time' && index - 1 >= 0 && state[index - 1].type === 'date';
            return (
              <div className={`${isDateAndTimeAdjacent || isTimeAndDateAdjacent ? 'col-6' : 'col-12'}`} key={index}>
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
                >
                  {fieldAdapter.createField(field)}
                </Form.Item>
              </div>
            );
          })}
        </Form>
      </Modal>
    </>
  );
};

export default ModalForm;

