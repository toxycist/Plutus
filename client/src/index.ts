interface tableRow {
    id: number,
    dateAdded: Date
}

document.addEventListener('DOMContentLoaded', function () {
    loadTable([
        // { id: 1, dateAdded: new Date() },
        // { id: 2, dateAdded: new Date() },
        // { id: 3, dateAdded: new Date() },
    ])
});

function renderRow(row: tableRow) {
    return `<tr>
    <td>${row.id}</td>
    <td>${row.dateAdded.toLocaleString()}</td>
    </tr>`
}

function loadTable(rowArray: Array<tableRow>){
    const tbody = document.querySelector('table tbody') as HTMLTableElement;
    if (rowArray.length === 0){
        tbody.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
    }

    for (const row of rowArray) {
        let newRow = tbody.insertRow();
        newRow.outerHTML = renderRow(row);
    }
}