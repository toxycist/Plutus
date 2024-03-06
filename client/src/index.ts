interface tableRow {
    id: number,
    dateAdded: string
}

const server_address = 'http://localhost:1987'

function getTable(){
    fetch(server_address + '/getTable')
    .then((response) => response.json())
    .then((data) => {loadTable(data)}).catch(() => loadTable([]));
}

document.addEventListener('DOMContentLoaded', () => getTable());

function renderRow(row: tableRow){
    return `<tr>
    <td>${row.id}</td>
    <td>${new Date(row.dateAdded).toLocaleString()}</td>
    <td><button class="delete-btn" elem-id=${row.id}>Delete</td>
    </tr>`
}

function loadTable(rowArray: Array<tableRow>){
    const tbody = document.querySelector('table tbody') as HTMLTableElement;
    if (rowArray.length === 0){
        tbody.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
    }

    tbody.innerHTML = "";
    for (const row of rowArray) {
        let newRow = tbody.insertRow();
        newRow.outerHTML = renderRow(row);
    }
}

function addElement(){
    fetch(server_address + '/addElement')
    .then(response => response.json())
    .then(response => {
        if (response.success) getTable();
        else alert(`An error occured; status code: ${response.statusCode}`);
})}