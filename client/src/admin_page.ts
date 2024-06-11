import { server_address, frontend_address } from "./server_addresses";

interface tableRow {
    id: number,
    name: string,
    originroom: number,
    reservationhistory: string
}

export async function authCheck(){
    if (await (await fetch(server_address + `/authCheck`, {
        credentials: 'include'
    })).json()) {
        return true
    }
    else {
        window.location.href = `${frontend_address}/index.html`
        return false;
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

document.addEventListener('DOMContentLoaded', async () => {if(await authCheck()) getElements()});

export async function onEdit(id: number, name: string, originroom: string) {
    if(await authCheck()){
        eval(`__webpack_exports__.showEditForm(${id}, '${name}', ${originroom})`)
    }
}

export async function onDelete(id: number) {
    if(await authCheck()){
        eval(`__webpack_exports__.deleteElement(${id})`)
    }
}

function renderRow(row: tableRow){
    return `<tr>
    <td>${row.id}</td>
    <td>${row.name}</td>
    <td>${row.originroom}</td>
    <td>${row.reservationhistory}</td>
    <td><button class="edit-btn" onclick="__webpack_exports__.onEdit(${row.id}, '${row.name}', ${row.originroom})">Edit</td>
    <td><button class="delete-btn" onclick="__webpack_exports__.onDelete(${row.id})">Delete</td>
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
    } catch {}
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
    } catch {}
}

export async function truncateTable(){
    try {
        const response = await(await fetch(server_address + '/truncateTable')).json();
        if (response.status === "success") {
            alert("Done.");
            await getElements();
        }
        else alert(`Error: ${response.status}`)
    } catch {}
}

export async function deleteElement(id: number) {
    try {
        const response = await (await fetch(server_address + '/deleteElement/' + id, {method: 'DELETE'})).json();
        if (response.status === "success") await getElements();
        alert("Deletion: " + response.status);
    } catch {}
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
    } catch {}
}