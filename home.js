function incrementCount() {
  let value = database.getItem('myvalue');
  console.log(value);
  value = value + 1;
  database.saveItem('myvalue', value);

  document.getElementById('counter').textContent = value;
}

document.getElementById('counter').textContent = database.getItem('myvalue');
