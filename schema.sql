DROP TABLE IF EXISTS bookspr;
CREATE TABLE bookspr(
    id serial primary key,
    img_url VARCHAR(255),
    title VARCHAR(255),
    auther VARCHAR(255),
    description TEXT
);