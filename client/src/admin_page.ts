import { server_address } from "./backend_address";

interface tableRow {
    id: number,
    name: string,
    originroom: number,
    reservationhistory: string
}

async function authCheck(callback: typeof getElements){
    if (await (await fetch(server_address + `/authCheck`, {
        credentials: 'include'
    })).json()) {
        callback();
    }
    else {
        window.location.href = 'http://localhost/index.html'
    }
}

export async function getElements(mode?: string, search_query?: string | number) {
    try {
        hideEditForm()

        const response = await(await fetch(server_address + `/getElements${search_query ? `?mode=${mode}%3D'${search_query}'` : ''}`)).json();
        document.getElementById("search-active-msg")!.style.display = (search_query ? "block" : "none");
        loadTable(response);
    } catch {
        loadTable([]);
    }
}

document.addEventListener('DOMContentLoaded', () => authCheck(getElements));

function renderRow(row: tableRow){
    return `<tr>
    <td>${row.id}</td>
    <td>${row.name}</td>
    <td>${row.originroom}</td>
    <td>${row.reservationhistory}</td>
    <td><button class="edit-btn" onclick="__webpack_exports__.showEditForm(${row.id}, '${row.name}', ${row.originroom})">Edit</td>
    <td><button class="delete-btn" onclick="__webpack_exports__.deleteElement(${row.id})">Delete</td>
    </tr>`
}

function loadTable(rowArray: Array<tableRow>){

    const tbody = document.querySelector('table tbody') as HTMLTableElement;
    if (rowArray.length === 0){
        tbody.innerHTML = "<tr><td class='no-data' colspan='4'>No Data</td></tr>";
        return;
    }

    tbody.innerHTML = "";
    for (const row of rowArray) {
        let newRow = tbody.insertRow();
        newRow.outerHTML = renderRow(row);
    }
}

export async function addElement(name: string, originRoom: number){
    try {
        const response = await (await fetch(server_address + `/addElement?name=${name}&originRoom=${originRoom}`)).json();
        if (response.status === "ER_DUP_ENTRY") alert("Error: Item with this name already exists.");
        await getElements();
    } catch {
        alert("An error occured: the request did not reach the server");
    }
}

export function showEditForm(id: number, oldName: string, oldOriginRoom: number){
    document.getElementById('id-of-edited-element')!.innerHTML = `ID: ${id}`;

    (document.querySelector("#add-element-form") as HTMLElement).hidden = true;
    (document.querySelector("#edit-element-form") as HTMLElement).hidden = false;

    (document.querySelector(".name-input[placeholder='New device name']") as HTMLInputElement).value = oldName;
    (document.querySelector(".origin-room-input[placeholder='New device origin room']") as HTMLInputElement).value = `${oldOriginRoom}`;
}

function hideEditForm(){
    (document.querySelector("#add-element-form") as HTMLElement).hidden = false;
    (document.querySelector("#edit-element-form") as HTMLElement).hidden = true;
}

export async function editElement(id: number, updatedName: string, updatedOriginRoom: number) {
    try {
        const response = await (await fetch(server_address + '/editElement/' + id, {
            method: 'PATCH', 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: updatedName, 
                originRoom: updatedOriginRoom})
            })).json();

        if (response.status === "ER_DUP_ENTRY") {
            alert("Error: Item with this name already exists.")
            await getElements()
        }
        else {
            alert(`Edit: ${response.status}`);
            hideEditForm()
        }
    } catch {
        alert("An error occured: the request did not reach the server");
    }
}

export async function truncateTable(){
    try {
        const response = await(await fetch(server_address + '/truncateTable')).json();
        if (response.status === "success") {
            alert("Done.");
            await getElements();
        }
        else alert(`Error: ${response.status}`)
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

export function syncSearchInput(){
    let filterMenuSelectObject = document.querySelector("#search-filters-dropdown") as HTMLSelectElement
    let filterMenuSelectedElement = filterMenuSelectObject.options[filterMenuSelectObject.selectedIndex]
    let searchInput = document.querySelector("#search-input") as HTMLInputElement
    searchInput.placeholder = `Search by ${filterMenuSelectedElement.text.toLowerCase()}`.replace("search", "Search").replace("id", "ID")
    if (filterMenuSelectedElement.text == "ID" || filterMenuSelectedElement.text == "Origin Room") searchInput.type = "number"
    else searchInput.type = "text"
}

export async function logout(){
    try {
        await fetch(server_address + '/getElements')
        window.location.href = server_address + '/logout'
    } catch {
        alert("An error occured: the request did not reach the server");
    }
}