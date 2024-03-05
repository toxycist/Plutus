interface tableRow {
    id: number,
    dateAdded: string
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:1987/getTable')
    .then((response) => response.json())
    .then((data) => {loadTable(data)}).catch(() => loadTable([]));
});

function renderRow(row: tableRow) {
    return `<tr>
    <td>${row.id}</td>
    <td>${new Date(row.dateAdded).toLocaleString()}</td>
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