import React from "react";
import * as BooksAPI from "../../api/BooksAPI";
import "./App.css";
import Home from "../Home";
import Search from "../Search";

class BooksApp extends React.Component {
  state = {
    /**
     * TODO: Instead of using this state variable to keep track of which page
     * we're on, use the URL in the browser's address bar. This will ensure that
     * users can use the browser's back and forward buttons to navigate between
     * pages, as well as provide a good URL they can bookmark and share.
     */
    showSearchPage: false,
    // Will store a key-value pair, key the bookId and the value the book object
    books: {},
    // Inside each array we will have the bookIds of the books in that shelve
    shelves: {
      currentlyReading: [],
      wantToRead: [],
      read: []
    }
  };

  onBookShelfChange = async (bookId, newShelf) => {
    let previousStateForOptimisticUI = this.state;

    let oldShelf = this.state.books[bookId].shelf;

    let booksCopy = Object.assign({}, this.state.books);
    let shelvesCopy = Object.assign({}, this.state.shelves);

    // On book shelf change of remove from shelf we need to remove the bookId
    // from the old shelf. For new self depends on if it is an existant shelf or none.
    shelvesCopy = {
      ...shelvesCopy,
      [oldShelf]: shelvesCopy[oldShelf].filter(_bookId => _bookId !== bookId)
    };

    if (newShelf === "none") {
      delete booksCopy[bookId];
    } else {
      booksCopy = {
        ...booksCopy,
        [bookId]: {
          ...booksCopy[bookId],
          shelf: newShelf
        }
      };
      // TODO: Would be great to find a way of updating [newShelf] conditionally in the nested update :D
      shelvesCopy = {
        ...shelvesCopy,
        [newShelf]: shelvesCopy[newShelf].concat(bookId)
      };
    }

    this.setState({
      books: booksCopy,
      shelves: shelvesCopy
    });

    try {
      await BooksAPI.update(this.state.books[bookId], newShelf);
      // If we manage errors on the BooksAPI we might inspect also the returned
      // response from this update call
    } catch (e) {
      console.log("Error happened on the update API query");
      this.setState(previousStateForOptimisticUI);
    }
  };

  componentDidMount() {
    BooksAPI.getAll().then(booksArr => {
      let booksObject = {};
      let shelves = {
        currentlyReading: [],
        wantToRead: [],
        read: []
      };
      if (booksArr && booksArr.length) {
        booksObject = booksArr.reduce((books, book) => {
          shelves[book.shelf].push(book.id);
          books[book.id] = book;
          return books;
        }, {});
      }
      this.setState({
        books: booksObject,
        shelves
      });
    });
  }

  render() {
    const { books, shelves } = this.state;
    return (
      <div className="app">
        {this.state.showSearchPage ? (
          <Search />
        ) : (
          <Home
            books={books}
            shelves={shelves}
            onBookShelfChange={this.onBookShelfChange}
          />
        )}
      </div>
    );
  }
}

export default BooksApp;