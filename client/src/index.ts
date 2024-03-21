export const server_address = 'http://localhost:1987'

async function login() {
    try {
        //location.href = (await fetch(server_address + '/login')).url
        const resp = await fetch(server_address + '/login');
        console.log(resp.status);
    } catch {
        alert("An error occured");
    }
}