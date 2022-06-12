const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKSHELF-APP';

let books = [];
let formMode = 'CREATE';
let bookIdEdit = '';
let searchTerm = '';

function isStorageExist() {
	if (typeof Storage === undefined) {
		alert('Browser tidak mendukung local storage');
		return false;
	}

	return true;
}

function loadDataFromLocalStorage() {
	const serializedData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializedData);

	if (data !== null) {
		for (const book of data) {
			books.push(book);
		}
	}

	document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
	return +new Date();
}

function generateBookObject(id, bookTitle, bookAuthor, bookYear, isCompleted) {
	return {
		id,
		bookTitle,
		bookAuthor,
		bookYear,
		isCompleted,
	};
}

function getBookFormFieldValue() {
	const bookTitle = document.getElementById('inputBookTitle').value;
	const bookAuthor = document.getElementById('inputBookAuthor').value;
	const bookYear = document.getElementById('inputBookYear').value;
	const bookCheckbox = document.getElementById('inputBookIsCompleteCheckbox').checked;

	return { bookTitle, bookAuthor, bookYear, bookCheckbox };
}

function setBookFormFieldValue(title, author, year, status) {
	const bookTitle = document.getElementById('inputBookTitle');
	bookTitle.value = title;

	const bookAuthor = document.getElementById('inputBookAuthor');
	bookAuthor.value = author;

	const bookYear = document.getElementById('inputBookYear');
	bookYear.value = year;

	const inputBookIsCompleteCheckbox = document.getElementById('inputBookIsCompleteCheckbox');
	inputBookIsCompleteCheckbox.checked = status;
}

function makeTdElement(cssClass) {
	const tdElement = document.createElement('td');
	tdElement.classList.add(...cssClass);

	return tdElement;
}

function makeBookTitleAndBookAuthorTd(title, author) {
	const tdElement = makeTdElement(['pl-6', 'pr-2', 'py-6']);
	tdElement.classList.add('whitespace-nowrap');

	const container = document.createElement('div');
	container.classList.add('flex', 'flex-col', 'w-80');

	const bookTitleText = document.createElement('p');
	bookTitleText.classList.add('font-medium', 'text-gray-900', 'truncate');
	bookTitleText.innerText = title;

	const bookAuthorText = document.createElement('p');
	bookAuthorText.classList.add('text-sm', 'font-light', 'text-gray-500');
	bookAuthorText.innerText = author;

	container.append(bookTitleText, bookAuthorText);
	tdElement.append(container);

	return tdElement;
}

function makeBookYearTd(year) {
	const tdElement = makeTdElement(['px-2', 'py-6', 'whitespace-nowrap']);

	const bookYearText = document.createElement('p');
	bookYearText.classList.add('text-sm', 'text-gray-900');
	bookYearText.innerText = year;

	tdElement.append(bookYearText);

	return tdElement;
}

function makeBookActionButtonTd(bookId, isCompleted) {
	const tdElement = makeTdElement(['px-2', 'py-6', 'whitespace-nowrap']);

	const container = document.createElement('div');
	container.classList.add('flex', 'justify-center');

	const bookActionButton = makeBookActionButton(bookId, isCompleted);

	container.append(bookActionButton);
	tdElement.append(container);

	return tdElement;
}

function makeCancelEditButton() {
	const cancelEditButton = document.createElement('button');
	cancelEditButton.classList.add('secondary-button', 'rounded-full');
	cancelEditButton.setAttribute('id', 'cancelEditButton');
	cancelEditButton.setAttribute('type', 'button');
	cancelEditButton.innerText = 'Batalkan edit';
	cancelEditButton.addEventListener('click', function () {
		formMode = 'CREATE';
		bookIdEdit = '';
		setBookFormFieldValue('', '', '', false);
		cancelEditButton.remove();
	});

	return cancelEditButton;
}

function removeCancelButton() {
	const cancelEditButton = document.getElementById('cancelEditButton');
	cancelEditButton.remove();
}

function findBook(bookId) {
	for (const book of books) {
		if (book.id === bookId) {
			return book;
		}
	}

	return null;
}

function findBookIndex(bookId) {
	for (const index in books) {
		if (books[index].id === bookId) {
			return index;
		}
	}

	return -1;
}

function removeBookFromCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget === null) return;

	bookTarget.isCompleted = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function addBookToCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget === null) return;

	bookTarget.isCompleted = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function removeBookFromCollection(bookId) {
	const bookTarget = findBookIndex(bookId);

	if (bookTarget === -1) return;

	books.splice(bookTarget, 1);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function getBookDataToEdit(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget === null) return;

	const { id, bookTitle, bookAuthor, bookYear, isCompleted } = bookTarget;
	const formButtonGroup = document.getElementById('submit-form-button-group');
	const cancelEditButton = makeCancelEditButton();

	formButtonGroup.append(cancelEditButton);
	setBookFormFieldValue(bookTitle, bookAuthor, bookYear, isCompleted);

	formMode = 'UPDATE';
	bookIdEdit = id;
}

function searchBook(title) {
	const searchedBook = books.filter(function (book) {
		const bookName = book.bookTitle.toLowerCase();

		return bookName.includes(title.toLowerCase());
	});

	return searchedBook;
}

function addBook() {
	const { bookTitle, bookAuthor, bookYear, bookCheckbox } = getBookFormFieldValue();
	const generatedId = generateId();
	const bookObject = generateBookObject(generatedId, bookTitle, bookAuthor, bookYear, bookCheckbox);

	books.push(bookObject);

	document.dispatchEvent(new Event(RENDER_EVENT));

	setBookFormFieldValue('', '', '', false);
	saveData();
}

function updateBook(bookId) {
	const bookTarget = findBookIndex(bookId);

	if (bookTarget === -1) return;

	const { bookTitle, bookAuthor, bookYear, bookCheckbox } = getBookFormFieldValue();
	const updatedBook = { ...books[bookTarget], bookTitle, bookAuthor, bookYear, isCompleted: bookCheckbox };

	books = [...books.slice(0, bookTarget), updatedBook, ...books.slice(bookTarget + 1)];

	document.dispatchEvent(new Event(RENDER_EVENT));

	bookIdEdit = '';
	formMode = 'CREATE';
	setBookFormFieldValue('', '', '', false);
	saveData();
}

function saveData() {
	if (isStorageExist()) {
		const parsed = JSON.stringify(books);
		localStorage.setItem(STORAGE_KEY, parsed);
	}
}

function makeBookActionButton(bookId, bookIsCompleted) {
	const buttonElement = document.createElement('button');
	buttonElement.setAttribute('type', 'button');

	if (bookIsCompleted) {
		buttonElement.classList.add('uncomplete-button');
		buttonElement.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 mr-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      Belum selesai
    `;
		buttonElement.setAttribute('id', 'uncomplete-button');
		buttonElement.addEventListener('click', function () {
			removeBookFromCompleted(bookId);
		});
	} else {
		buttonElement.classList.add('complete-button');
		buttonElement.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 mr-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
          clip-rule="evenodd"
        />
      </svg>
      Selesai baca
    `;
		buttonElement.setAttribute('id', 'complete-button');
		buttonElement.addEventListener('click', function () {
			addBookToCompleted(bookId);
		});
	}

	return buttonElement;
}

function makeActionButtonTd(bookId) {
	const tdElement = makeTdElement(['pl-2', 'pr-6', 'py-6', 'whitespace-nowrap']);
	const actionButton = makeActionButton(bookId);

	tdElement.append(actionButton);

	return tdElement;
}

function makeActionButton(bookId) {
	const container = document.createElement('div');
	container.classList.add('flex', 'justify-center', 'gap-2');

	const editButtonElement = document.createElement('button');
	editButtonElement.classList.add('action-button');
	editButtonElement.setAttribute('type', 'button');
	editButtonElement.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      stroke-width="4"
    >
      <path
        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
      />
    </svg>
  `;
	editButtonElement.addEventListener('click', function () {
		getBookDataToEdit(bookId);
	});

	const deleteButtonElement = document.createElement('button');
	deleteButtonElement.classList.add('action-button');
	deleteButtonElement.setAttribute('type', 'button');
	deleteButtonElement.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
        clip-rule="evenodd"
      />
    </svg>
  `;
	deleteButtonElement.addEventListener('click', function () {
		removeBookFromCollection(bookId);
	});

	container.append(editButtonElement, deleteButtonElement);

	return container;
}

function makeBook(bookObject) {
	const bookTitleAndAuthorTd = makeBookTitleAndBookAuthorTd(bookObject.bookTitle, bookObject.bookAuthor);
	const bookYearTd = makeBookYearTd(bookObject.bookYear);
	const bookActionButtonTd = makeBookActionButtonTd(bookObject.id, bookObject.isCompleted);
	const actionButtonTd = makeActionButtonTd(bookObject.id);

	const tr = document.createElement('tr');
	tr.classList.add('odd:bg-white', 'even:bg-slate-50');
	tr.append(bookTitleAndAuthorTd, bookYearTd, bookActionButtonTd, actionButtonTd);
	tr.setAttribute('id', `book-${bookObject.id}`);

	return tr;
}

document.addEventListener('DOMContentLoaded', function () {
	if (isStorageExist()) {
		loadDataFromLocalStorage();
	}

	const inputBookIsCompleteCheckbox = document.getElementById('inputBookIsCompleteCheckbox');
	const bookCategoryText = document.getElementById('bookCategoryText');

	inputBookIsCompleteCheckbox.addEventListener('change', function (event) {
		if (event.target.checked) {
			bookCategoryText.innerText = 'Selesai dibaca';
		} else {
			bookCategoryText.innerText = 'Belum selesai dibaca';
		}
	});

	const inputBookSearch = document.getElementById('searchBookTitle');

	inputBookSearch.addEventListener('keyup', function (event) {
		searchTerm = event.target.value;
		document.dispatchEvent(new Event(RENDER_EVENT));
	});

	const clearSearchButton = document.getElementById('clearSearch');

	clearSearchButton.addEventListener('click', function () {
		searchTerm = '';
		inputBookSearch.value = '';
		document.dispatchEvent(new Event(RENDER_EVENT));
	});

	const inputBookForm = document.getElementById('inputBook');

	inputBookForm.addEventListener('submit', function (event) {
		event.preventDefault();

		if (formMode === 'CREATE') {
			addBook();
		} else {
			updateBook(bookIdEdit);
			removeCancelButton();
		}
	});
});

document.addEventListener(RENDER_EVENT, function () {
	const uncompletedBookList = document.getElementById('uncompleteBookshelfList');
	const completedBookList = document.getElementById('completeBookshelfList');

	uncompletedBookList.innerHTML = '';
	completedBookList.innerHTML = '';

	for (const book of searchBook(searchTerm)) {
		const bookElement = makeBook(book);

		if (!book.isCompleted) {
			uncompletedBookList.append(bookElement);
		} else {
			completedBookList.append(bookElement);
		}
	}
});
