import { server_address } from "./utils";

interface tableRow {
    id: number,
    dateAdded: string
}

export async function getElements(id?: number) {
    try {
        const response = await(await fetch(server_address + `/getElements${id ? `?mode=id%3D${id}` : ''}`)).json();
        document.getElementById("search-active-msg")!.style.display = (id ? "block" : "none");
        loadTable(response);
    } catch {
        loadTable([]);
    }
}

document.addEventListener('DOMContentLoaded', () => getElements());

function renderRow(row: tableRow){
    return `<tr>
    <td>${row.id}</td>
    <td>${new Date(row.dateAdded).toLocaleString()}</td>
    <td><button class="delete-btn" onclick="__webpack_exports__.deleteElement(${row.id})">Delete</td>
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

export async function addElement(){
    try {
        const response = await (await fetch(server_address + '/addElement')).json();
        if (!response.success) throw Error;
        await getElements();
    } catch {
        alert("An error occured: the request did not reach the server");
    }
}

export async function deleteElement(id: number) {
    try {
        const response = await (await fetch(server_address + '/deleteElement/' + id, {method: 'DELETE'})).json();
        if (response.status === "success") await getElements();
        alert("Deletion: " + response.status);
    } catch {
        alert("An error occured: the request did not reach the server");
    }
}

export async function logout(){
    try {
        window.location.href = server_address + '/logout'
    } catch {
        alert("An error occured: the request did not reach the server");
    }
}