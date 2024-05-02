import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentList, setCurrentList] = useState([])

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`http://localhost:8080/contacts`);
      const data = await response.json();
      setContacts(data);
      setPages(data.length%10===0?data.length/10:data.length/10+1);
      setCurrentList([...data].splice(0, 10))
    }
    fetchData();
  }, []);

  const handleCheckboxSelect = (e) => {
    const { checked, value } = e.target;
    if (checked) {
      setSelectedContacts([...selectedContacts, value]);
      console.log([...selectedContacts, value])
    } else {
      setSelectedContacts(selectedContacts.filter((c) => c != value));
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    console.log(selectedContacts);
    const response = await fetch("http://localhost:8080/download", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedContacts),
    });
    const data = await response.text();
    if (!response.ok) {
      throw new Error(`${data} : ${response.status}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setCurrentList([...contacts].splice(page*10,10))
  }

  return (
    <div className="flex flex-col text-base lg:text-xl items-center my-16">
      <div>
        <table>
          <thead>
            <tr className="bg-slate-400 p-20">
              <th className="px-2 py-1 lg:px-4 lg:py-2">Select</th>
              <th className="px-2 py-1 lg:px-4 lg:py-2">Name</th>
              <th className="px-2 py-1 lg:px-4 lg:py-2">Email</th>
              <th className="px-2 py-1 lg:px-4 lg:py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {currentList?.map((c) => {
              const flag = selectedContacts.filter((cnt) => cnt == c.id).length === 1
              return (
                <tr key={c.id}>
                  <td>
                    <input
                      type="checkbox"
                      name="select"
                      value={c.id}
                      checked={flag}
                      onChange={handleCheckboxSelect}
                      className="py-2 mx-8"
                    >
                    </input>
                  </td>
                  <td className="px-2 py-1 lg:px-4 lg:py-2">{c.name}</td>
                  <td className="px-2 py-1 lg:px-4 lg:py-2">{c.email}</td>
                  <td className="px-2 py-1 lg:px-4 lg:py-2">{c.contact}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex">
        {
        Array.from({ length: pages }).map((val, ind) => {
          return <p key={ind} className={`mx-2 cursor-pointer ${currentPage===ind?'font-bold underline':''}`} onClick={() => handlePageChange(ind)}>{ind+1}</p>
        })
      }
      </div>
      <div className="mt-8 bg-slate-600 hover:bg-slate-500 px-4 py-2 text-2xl rounded text-white">
        <button className="cursor-pointer" onClick={handleDownload}>
          Download
        </button>
      </div>
    </div>
  );
}

export default App;
