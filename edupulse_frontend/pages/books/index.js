import { useEffect, useState } from "react";
import axios from "axios";
import HeaderDiffer from "../../components/HeaderDiffer";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/Book");
        const data = res.data?.data || [];
        setBooks(data);
        setFiltered(data);
      } catch {
        setBooks([]);
        setFiltered([]);
      }
    };
    loadBooks();
  }, []);

  useEffect(() => {
    let items = books;
    if (category !== "ALL") items = items.filter((b) => String(b.BookID || "").startsWith(category));
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (b) =>
          String(b.BookName || "").toLowerCase().includes(q) ||
          String(b.Author || "").toLowerCase().includes(q) ||
          String(b.Description || "").toLowerCase().includes(q)
      );
    }
    setFiltered(items);
  }, [books, search, category]);

  return (
    <>
      <HeaderDiffer />
    <div className="books-container">
      <h1 className="books-title">Books</h1>
      <div className="books-filters">
        <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search books..." />
        <select className="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="ALL">All Books</option>
          <option value="IK">IT Books</option>
          <option value="EK">English Books</option>
          <option value="TK">Tamil Books</option>
          <option value="SK">Sinhala Books</option>
          <option value="AK">Arabic Books</option>
          <option value="OK">Other Books</option>
        </select>
      </div>
      <div className="books-grid">
        {filtered.length === 0 ? (
          <p className="no-books">No Books Found...</p>
        ) : (
          filtered.map((book) => (
            <div className="book-card" key={book._id || book.BookID}>
              <div className="book-img-frame">
                <img src={book.BookImg || "/logo.png"} alt={book.BookName || "Book"} />
              </div>
              <h3 className="book-name">{book.BookName}</h3>
              <p className="book-author">By {book.Author}</p>
              <button type="button" className="borrow-btn">
                Download
              </button>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}
