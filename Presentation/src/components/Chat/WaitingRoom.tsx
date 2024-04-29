import { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

const WaitingRoom = ({joinChatRoom}) => {
  const [ username, setUsername ] = useState('');
  const [ chatRoom, setChatRoom ] = useState('');

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        joinChatRoom(username, chatRoom);
      }}
    >
      <Row className='px-5 py-5'>
        <Col sm={12}>
          <Form.Group>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Form.Control
              placeholder='Enter chat room'
              value={chatRoom}
              onChange={(e) => setChatRoom(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col sm={12}>
          <hr />
          <button type='submit' className='btn btn-primary'>
            Join Chat Room
          </button>
        </Col>
      </Row>
    </Form>
  );
};
export default WaitingRoom;