//PascalCasing
// capitalize every first letter

function Message() {
  const name = "Ngugi";
  if (name)
    return (
      <h1 className="text-3xl font-bold underline bg-red-500">Hello {name} </h1>
    );
  return <h1>Hello World</h1>;
}

export default Message;
