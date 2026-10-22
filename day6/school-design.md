# School Database Design

## 1. Table Explanations

- **`students`**: Stores identity and contact information for individual students. Each record represents a registered student with a unique primary key (`id`), full `name`, and a `UNIQUE` `email` address.
- **`courses`**: Represents the school's academic catalog. Each record defines a course offering, identified by an auto-incrementing primary key (`id`), a course `title`, and a unique catalog identifier (`code`, e.g., `CS101`).
- **`enrolments`**: Serves as the join (junction) table bridging `students` and `courses`. It contains foreign keys referencing `students(id)` and `courses(id)` along with the student's earned or current `grade`. A composite `UNIQUE(student_id, course_id)` constraint ensures that a student cannot be enrolled in the same course more than once.

---

## 2. Relationships and Join Table

### Many-to-Many Relationship
The relationship between **students** and **courses** is **many-to-many**:
- A single student can take multiple courses throughout their studies.
- A single course can be attended by multiple students.

### One-to-Many Relationships
The join table breaks this many-to-many relationship into two **one-to-many (1:N)** relationships:
- One student has **many** enrolment records (`students` 1 → N `enrolments`).
- One course has **many** enrolment records (`courses` 1 → N `enrolments`).

### Why a Join Table is Needed
Relational database design principles (specifically First Normal Form, or 1NF) require atomic values in each column; storing lists or comma-separated foreign keys in a single field is an anti-pattern that impairs indexing, search performance, and data integrity. Furthermore, relationship-specific data (such as the `grade` awarded, attendance, or enrollment date) belongs neither solely to the student nor solely to the course, but to the intersection of the two. The `enrolments` join table models this cleanly, provides referential integrity through foreign keys, and prevents duplicate enrollments via unique constraints.

---

## 3. Recommended Index and Justification

### Recommended Index
```sql
CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);
```

### Reason
While the composite constraint `UNIQUE(student_id, course_id)` creates an underlying index that optimizes queries filtering by `student_id` (or both `student_id` and `course_id`), it is not efficient for queries filtering or joining on `course_id` alone. In a production school database with thousands of enrollments, queries such as *“list all students enrolled in course X”* or *“calculate the total student count per course”* (using `GROUP BY course_id`) would be forced to perform a full table scan of `enrolments`. Adding a dedicated index on `enrolments(course_id)` allows the database engine to perform fast index lookups when joining courses to enrolments.

---

## 4. Architectural Choice: SQL vs. NoSQL

For a school management system, **SQL (Relational Database)** is the optimal architectural choice over NoSQL. Educational databases demand strict ACID guarantees to ensure consistency—preventing catastrophic scenarios such as double-enrollments, over-enrolling beyond classroom capacity, or inconsistent student transcripts during concurrent registration periods. The domain data is structured, predictable, and inherently relational (students, courses, departments, and grades), making foreign key constraints and transactional boundaries essential. Furthermore, relational databases excel at complex cross-entity reporting (such as GPA computation, course roster generation, transcript exports, and prerequisite checking) through standard, declarative SQL `JOIN`s, whereas a NoSQL document or key-value store would either require error-prone data denormalization and duplication or inefficient multi-step application-level joins.
