# Library Books REST API Design

A RESTful API specification for managing a library's book resources.

---

## Endpoints

### 1. List All Books
- **Method:** `GET`
- **Path:** `/books`
- **Description:** Retrieve a list of all books in the library catalog.
- **Request Body:** None
- **Success Status Code:** `200 OK`

### 2. Get a Single Book
- **Method:** `GET`
- **Path:** `/books/:id`
- **Description:** Retrieve detailed information about a specific book by its unique ID.
- **Request Body:** None
- **Success Status Code:** `200 OK`

### 3. Create a New Book
- **Method:** `POST`
- **Path:** `/books`
- **Description:** Add a new book to the library catalog.
- **Request Body:**
  ```json
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "publishedYear": 1925,
    "availableCopies": 4
  }
  ```
- **Success Status Code:** `201 Created`

### 4. Update an Existing Book
- **Method:** `PUT`
- **Path:** `/books/:id`
- **Description:** Update the full details of an existing book by its unique ID.
- **Request Body:**
  ```json
  {
    "title": "The Great Gatsby (Special Edition)",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "publishedYear": 1925,
    "availableCopies": 6
  }
  ```
- **Success Status Code:** `200 OK`

### 5. Delete a Book
- **Method:** `DELETE`
- **Path:** `/books/:id`
- **Description:** Permanently remove a book from the library catalog by its unique ID.
- **Request Body:** None
- **Success Status Code:** `204 No Content`

### 6. List Books by Author
- **Method:** `GET`
- **Path:** `/books?author={authorName}`
- **Description:** Retrieve all books written by a specific author using a query parameter.
- **Request Body:** None
- **Success Status Code:** `200 OK`

---

## Error Codes

- **400 Bad Request**
  - **Description:** The server cannot process the request due to invalid or malformed client input.
  - **Example Scenario:** A client sends a `POST /books` request where required fields are missing (such as omitting `"title"`) or fields contain invalid data types (such as passing `"publishedYear": "twenty-twenty"` instead of an integer).

- **404 Not Found**
  - **Description:** The requested resource could not be found on the server.
  - **Example Scenario:** A client sends a `GET /books/999` or `DELETE /books/999` request, but no book with ID `999` exists in the database.
