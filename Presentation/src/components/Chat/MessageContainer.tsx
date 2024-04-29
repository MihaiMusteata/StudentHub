const MessageContainer = ({messages}) => {
  console.log('MessageContainer: ', messages);
  return (
    <div>
      {
        messages.map((msg, i) => (
        <div key={i}>
          {msg}
        </div>
      ))}
    </div>
  );
}
export default MessageContainer;