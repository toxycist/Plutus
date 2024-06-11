import { server_address } from "./server_addresses";

export async function login() {
    try {
        window.location.href = server_address + '/login'
    } catch {
        alert("An error occured");
    }
}