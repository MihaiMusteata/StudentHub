import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

const SendMessageForm = ({ sendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(message);
    setMessage('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup className='mb-3'>
        <InputGroup.Text>Chat</InputGroup.Text>
        <Form.Control onChange={(e) => setMessage(e.target.value)} value={message} placeholder='Enter message' />
        <Button variant='primary' type='submit' disabled={!message}>Send</Button>
      </InputGroup>
      <button type="submit">Send</button>
    </Form>
  );
}
export default SendMessageForm;