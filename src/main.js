// https://assets.justinmind.com/wp-content/webp-express/webp-images/uploads/2019/10/list-ui-design-cflow-journal.png.webp
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser tidak mendukung local storage');
    return false;
  }

  return true;
}

function loadDataFromLocalStorage() {}

document.addEventListener('DOMContentLoaded', function () {
  if (isStorageExist()) {
    loadDataFromLocalStorage();
  }
});
