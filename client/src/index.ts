interface tableRow {
    id: number,
    dateAdded: string
}

const server_address = 'http://localhost:1987'

async function getTable() {
    try {
        const response = await(await fetch(server_address + '/getTable')).json();
        loadTable(response);
    } catch {
        loadTable([]);
    }
}

document.addEventListener('DOMContentLoaded', () => getTable());

function renderRow(row: tableRow){
    return `<tr>
    <td>${row.id}</td>
    <td>${new Date(row.dateAdded).toLocaleString()}</td>
    <td><button class="delete-btn" onclick="deleteElement(${row.id})">Delete</td>
    </tr>`
}

function loadTable(rowArray: Array<tableRow>){
    const tbody = document.querySelector('table tbody') as HTMLTableElement;
    if (rowArray.length === 0){
        tbody.innerHTML = "<tr><td class='no-data' colspan='3'>No Data</td></tr>";
        return;
    }

    tbody.innerHTML = "";
    for (const row of rowArray) {
        let newRow = tbody.insertRow();
        newRow.outerHTML = renderRow(row);
    }
}

async function addElement(){
    try {
        const response = await (await fetch(server_address + '/addElement')).json();
        if (!response.success) throw Error;
        await getTable();
    } catch {
        alert("An error occured: the request did not reach the server");
    }
}

async function deleteElement(id: number) {
    try {
        const response = await (await fetch(server_address + '/deleteElement/' + id, {method: 'DELETE'})).json();
        if (response.status === "success") await getTable();
        alert("Deletion: " + response.status);
    } catch {
        alert("An error occured: the request did not reach the server");
    }
}