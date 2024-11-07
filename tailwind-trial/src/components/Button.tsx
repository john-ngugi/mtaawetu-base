interface props {
  onClick: () => void;
  text: string;
}

function Btn({ onClick, text }: props) {
  return (
    <a
      href="#"
      className="rounded-md  bg-green-600 px-1 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      onClick={onClick}
    >
      {text}
    </a>
  );
}

export default Btn;
