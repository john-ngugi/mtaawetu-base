const people = [
  {
    name: "James Gachanja",
    role: "Lead Designer",
    imageUrl:
      "https://github.com/john-ngugi/Email-Imgs/blob/main/james.png?raw=true",
  },
  {
    name: "John Ngugi",
    role: "Lead Developer",
    imageUrl:
      "https://github.com/john-ngugi/Email-Imgs/blob/main/john.png?raw=true",
  },
  {
    name: "Nashon Adero",
    role: "Comunity Liason",
    imageUrl:
      "https://github.com/john-ngugi/Email-Imgs/blob/main/adero.png?raw=true",
  },
  {
    name: "Ivy Muriuki",
    role: "Data Analyst",
    imageUrl:
      "https://github.com/john-ngugi/Email-Imgs/blob/main/ivy.png?raw=true",
  },
  // More people...
];

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Meet The team
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We’re a dynamic group of individuals who are passionate about what
            we do and dedicated to delivering the best results for our clients.
          </p>
        </div>
        <ul
          role="list"
          className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2"
        >
          {people.map((person) => (
            <li key={person.name}>
              <div className="flex items-center gap-x-6">
                <img
                  alt=""
                  src={person.imageUrl}
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
                    {person.name}
                  </h3>
                  <p className="text-sm font-semibold leading-6 text-indigo-600">
                    {person.role}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
