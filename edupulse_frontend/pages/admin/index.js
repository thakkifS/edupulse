import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { AuthContext } from "../../context/AuthContext";
import AdminCoursesPanel from "../../components/AdminCoursesPanel";
import AdminLiveChatPanel from "../../components/AdminLiveChatPanel";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const authorized = useMemo(() => user?.role === "admin", [user]);
  const [tab, setTab] = useState("books"); // books | users | courses | chat
  const [busy, setBusy] = useState(false);

  // Books
  const [books, setBooks] = useState([]);
  const [bookForm, setBookForm] = useState({
    BookID: "",
    BookName: "",
    Author: "",
    Description: "",
    BookImg: "",
  });
  const [editingBookId, setEditingBookId] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    Name: "",
    studentID: "",
    PhoneNumber: "",
    Email: "",
    Password: "",
    role: "student",
  });
  const [editingUserId, setEditingUserId] = useState(null);

  const BOOKS_API = "http://localhost:3001/api/Book";
  const USERS_API = "http://localhost:3001/api/users";

  const loadBooks = async () => {
    const res = await axios.get(BOOKS_API);
    setBooks(res.data?.data || []);
  };

  const loadUsers = async () => {
    const res = await axios.get(USERS_API);
    setUsers(res.data?.data || []);
  };

  useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        await Promise.all([loadBooks(), loadUsers()]);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [authorized]);

  if (!authorized) {
    return (
      <div className="page-wrap">
        <div className="card-center">
          <h2>Admin access only</h2>
          <button className="primary-btn" onClick={() => router.push("/auth")}>
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const validateBook = () => {
    const { BookID, BookName, Author, Description } = bookForm;
    if (!BookID.trim()) return "BookID is required";
    if (!BookName.trim()) return "Book name is required";
    if (!Author.trim()) return "Author is required";
    if (!Description.trim()) return "Description is required";
    if (!/^[A-Za-z]{2}$/.test(BookID.trim().substring(0, 2))) return "BookID must start with 2 letters (e.g. EK)";
    return null;
  };

  const submitBook = async (e) => {
    e.preventDefault();
    const err = validateBook();
    if (err) return alert(err);
    setBusy(true);
    try {
      if (editingBookId) {
        await axios.put(`${BOOKS_API}/${editingBookId}`, {
          BookName: bookForm.BookName,
          Author: bookForm.Author,
          Description: bookForm.Description,
          BookImg: bookForm.BookImg,
        });
        alert("Book updated");
      } else {
        await axios.post(BOOKS_API, bookForm);
        alert("Book created");
      }
      setBookForm({ BookID: "", BookName: "", Author: "", Description: "", BookImg: "" });
      setEditingBookId(null);
      await loadBooks();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save book");
    } finally {
      setBusy(false);
    }
  };

  const editBook = (b) => {
    setTab("books");
    setEditingBookId(b.BookID);
    setBookForm({
      BookID: b.BookID || "",
      BookName: b.BookName || "",
      Author: b.Author || "",
      Description: b.Description || "",
      BookImg: b.BookImg || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBook = async (bookId) => {
    if (!confirm(`Delete book ${bookId}?`)) return;
    setBusy(true);
    try {
      await axios.delete(`${BOOKS_API}/${bookId}`);
      await loadBooks();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete book");
    } finally {
      setBusy(false);
    }
  };

  const validateUser = () => {
    const { Name, studentID, PhoneNumber, Email, Password } = userForm;
    if (!Name.trim()) return "Name is required";
    if (!/^[A-Za-z ]+$/.test(Name.trim())) return "Name must contain letters only";
    if (!studentID.trim()) return "Student ID is required";
    if (!/^07\d{8}$/.test(String(PhoneNumber || "").trim())) return "Invalid Phone Number";
    if (!String(Email || "").toLowerCase().trim().endsWith("@gmail.com")) return "Invalid Email";
    const validPrefixes = ["IT", "EN", "BS", "TC", "AR", "LE"];
    const prefix = String(studentID).substring(0, 2).toUpperCase();
    const digits = String(studentID).substring(2);
    if (String(studentID).length !== 10 || !validPrefixes.includes(prefix) || !/^\d{8}$/.test(digits)) {
      return "Invalid Student ID";
    }
    if (!editingUserId) {
      if (!Password) return "Password is required";
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d@$!%*?&]).{6,}$/.test(Password)) {
        return "Password must be 6+ chars with uppercase, lowercase, number and special char";
      }
    } else if (Password) {
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d@$!%*?&]).{6,}$/.test(Password)) {
        return "Password must be 6+ chars with uppercase, lowercase, number and special char";
      }
    }
    return null;
  };

  const submitUser = async (e) => {
    e.preventDefault();
    const err = validateUser();
    if (err) return alert(err);
    setBusy(true);
    try {
      if (editingUserId) {
        const payload = { ...userForm };
        if (!payload.Password) delete payload.Password;
        await axios.put(`${USERS_API}/${editingUserId}`, payload);
        alert("User updated");
      } else {
        await axios.post(USERS_API, userForm);
        alert("User created");
      }
      setUserForm({ Name: "", studentID: "", PhoneNumber: "", Email: "", Password: "", role: "student" });
      setEditingUserId(null);
      await loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save user");
    } finally {
      setBusy(false);
    }
  };

  const editUser = (u) => {
    setTab("users");
    setEditingUserId(u._id);
    setUserForm({
      Name: u.Name || "",
      studentID: u.studentID || "",
      PhoneNumber: u.PhoneNumber || "",
      Email: u.Email || "",
      Password: "",
      role: u.role || "student",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteUser = async (id, email) => {
    if (!confirm(`Delete user ${email || id}?`)) return;
    setBusy(true);
    try {
      await axios.delete(`${USERS_API}/${id}`);
      await loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="admin-wrap">
        <div className="admin-top">
          <div>
            <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
            <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
              Welcome, {user.Name}. Manage books, users, courses, and live student chat.
            </p>
          </div>
          <div className="admin-tabs">
            <button className={`admin-tab ${tab === "books" ? "active" : ""}`} onClick={() => setTab("books")} type="button">
              Books CRUD
            </button>
            <button className={`admin-tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")} type="button">
              Users CRUD
            </button>
            <button className={`admin-tab ${tab === "courses" ? "active" : ""}`} onClick={() => setTab("courses")} type="button">
              Courses &amp; MCQ
            </button>
            <button className={`admin-tab ${tab === "chat" ? "active" : ""}`} onClick={() => setTab("chat")} type="button">
              Live Chat
            </button>
          </div>
        </div>

        {tab === "chat" ? (
          <AdminLiveChatPanel busy={busy} setBusy={setBusy} />
        ) : tab === "courses" ? (
          <AdminCoursesPanel busy={busy} setBusy={setBusy} />
        ) : tab === "books" ? (
          <div className="admin-grid">
            <div className="admin-card">
              <h3 style={{ marginTop: 0 }}>{editingBookId ? `Edit Book (${editingBookId})` : "Add New Book"}</h3>
              <form onSubmit={submitBook} className="admin-form">
                <div className="admin-row">
                  <div className="admin-field">
                    <label>Book ID</label>
                    <input
                      value={bookForm.BookID}
                      onChange={(e) => setBookForm({ ...bookForm, BookID: e.target.value })}
                      placeholder="EK123..."
                      disabled={!!editingBookId}
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label>Book Name</label>
                    <input value={bookForm.BookName} onChange={(e) => setBookForm({ ...bookForm, BookName: e.target.value })} required />
                  </div>
                </div>
                <div className="admin-row">
                  <div className="admin-field">
                    <label>Author</label>
                    <input value={bookForm.Author} onChange={(e) => setBookForm({ ...bookForm, Author: e.target.value })} required />
                  </div>
                  <div className="admin-field">
                    <label>Image URL (optional)</label>
                    <input value={bookForm.BookImg} onChange={(e) => setBookForm({ ...bookForm, BookImg: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div className="admin-field">
                  <label>Description</label>
                  <textarea value={bookForm.Description} onChange={(e) => setBookForm({ ...bookForm, Description: e.target.value })} rows={4} required />
                </div>

                <div className="admin-actions">
                  {editingBookId && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setEditingBookId(null);
                        setBookForm({ BookID: "", BookName: "", Author: "", Description: "", BookImg: "" });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button className="primary-btn" type="submit" disabled={busy}>
                    {busy ? "Saving..." : editingBookId ? "Update Book" : "Create Book"}
                  </button>
                </div>
              </form>
            </div>

            <div className="admin-card">
              <div className="admin-card-head">
                <h3 style={{ margin: 0 }}>All Books ({books.length})</h3>
                <button className="secondary-btn" type="button" onClick={loadBooks} disabled={busy}>
                  Refresh
                </button>
              </div>
              <div className="admin-table">
                <div className="admin-thead admin-cols-books">
                  <div>ID</div>
                  <div>Name</div>
                  <div>Author</div>
                  <div>Actions</div>
                </div>
                {books.map((b) => (
                  <div key={b._id || b.BookID} className="admin-trow admin-cols-books">
                    <div className="mono">{b.BookID}</div>
                    <div>{b.BookName}</div>
                    <div>{b.Author}</div>
                    <div className="admin-btns">
                      <button type="button" className="secondary-btn" onClick={() => editBook(b)}>
                        Edit
                      </button>
                      <button type="button" className="danger-btn" onClick={() => deleteBook(b.BookID)} disabled={busy}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {books.length === 0 && <div className="admin-empty">No books yet.</div>}
              </div>
            </div>
          </div>
        ) : tab === "users" ? (
          <div className="admin-grid">
            <div className="admin-card">
              <h3 style={{ marginTop: 0 }}>{editingUserId ? "Edit User" : "Add New User"}</h3>
              <form onSubmit={submitUser} className="admin-form">
                <div className="admin-row">
                  <div className="admin-field">
                    <label>Full Name</label>
                    <input value={userForm.Name} onChange={(e) => setUserForm({ ...userForm, Name: e.target.value })} required />
                  </div>
                  <div className="admin-field">
                    <label>Student ID</label>
                    <input value={userForm.studentID} onChange={(e) => setUserForm({ ...userForm, studentID: e.target.value })} required />
                  </div>
                </div>
                <div className="admin-row">
                  <div className="admin-field">
                    <label>Phone Number</label>
                    <input value={userForm.PhoneNumber} onChange={(e) => setUserForm({ ...userForm, PhoneNumber: e.target.value })} required />
                  </div>
                  <div className="admin-field">
                    <label>Email</label>
                    <input type="email" value={userForm.Email} onChange={(e) => setUserForm({ ...userForm, Email: e.target.value })} required />
                  </div>
                </div>
                <div className="admin-row">
                  <div className="admin-field">
                    <label>{editingUserId ? "Reset Password (optional)" : "Password"}</label>
                    <input type="password" value={userForm.Password} onChange={(e) => setUserForm({ ...userForm, Password: e.target.value })} required={!editingUserId} />
                  </div>
                  <div className="admin-field">
                    <label>Role</label>
                    <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                      <option value="student">student</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                </div>

                <div className="admin-actions">
                  {editingUserId && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setEditingUserId(null);
                        setUserForm({ Name: "", studentID: "", PhoneNumber: "", Email: "", Password: "", role: "student" });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button className="primary-btn" type="submit" disabled={busy}>
                    {busy ? "Saving..." : editingUserId ? "Update User" : "Create User"}
                  </button>
                </div>
              </form>
            </div>

            <div className="admin-card">
              <div className="admin-card-head">
                <h3 style={{ margin: 0 }}>All Users ({users.length})</h3>
                <button className="secondary-btn" type="button" onClick={loadUsers} disabled={busy}>
                  Refresh
                </button>
              </div>
              <div className="admin-table">
                <div className="admin-thead admin-cols-users">
                  <div>Name</div>
                  <div>Email</div>
                  <div>StudentID</div>
                  <div>Role</div>
                  <div>Actions</div>
                </div>
                {users.map((u) => (
                  <div key={u._id} className="admin-trow admin-cols-users">
                    <div>{u.Name}</div>
                    <div className="mono">{u.Email}</div>
                    <div className="mono">{u.studentID}</div>
                    <div className="mono">{u.role}</div>
                    <div className="admin-btns">
                      <button type="button" className="secondary-btn" onClick={() => editUser(u)}>
                        Edit
                      </button>
                      <button type="button" className="danger-btn" onClick={() => deleteUser(u._id, u.Email)} disabled={busy}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <div className="admin-empty">No users yet.</div>}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
