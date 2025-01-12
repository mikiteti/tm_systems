const url = "http://localhost:2000";

const apis = {
    request (json) {
        console.log("Sending request: ", json.api_name);
        return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) }).then(res => res.json());
    },

    authenticate_user (identifier, id_type, password) {
        const body = {
            api_name: "authenticate_user",
            body: {
                identifier: identifier,
                id_type: id_type,
                password: password
            }
        }

        this.request(body);
    },

    create_user (name, username, phone, password) {
        const body = {
            api_name: "create_user",
            body: {
                name: name,
                username: username,
                phone: phone,
                password: password
            }
        }

        this.request(body);
    },

    delete_user (id, password) {
        const body = {
            api_name: "delete_user",
            body: {
                id: id,
                password: password
            }
        }

        this.request(body);
    },

    update_user (id, password, update_name, update_value) {
        const body = {
            api_name: "update_user",
            body: {
                id: id,
                password: password,
                update_name: update_name,
                update_value: update_value
            }
        }

        this.request(body);
    },

    get_user (id, password, properties) {
        const body = {
            api_name: "get_user",
            body: {
                id: id,
                password: password,
                properties: properties
            }
        }

        this.request(body);
    }
}
