const central = "http://localhost:2000";
const limes = "http://localhost:2001";

const apis = {
    request(url, json) {
        console.log("Sending request: ", json.api_name);
        return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) }).then(res => res.json());
    },

    authenticate_user(identifier, id_type, password) {
        const body = {
            api_name: "authenticate_user",
            body: {
                identifier: identifier,
                id_type: id_type,
                password: password
            }
        }

        this.request(central, body);
    },

    create_tag(user_id, password, tag_name) {
        const body = {
            api_name: "create_tag",
            body: {
                user_id: user_id,
                password: password,
                tag_name: tag_name
            }
        }

        this.request(limes, body);
    },

    create_file(id, password, title) {
        const body = {
            api_name: "create_file",
            body: {
                id: id,
                password: password,
                title: title
            }
        }

        this.request(limes, body);
    },

    get_user_settings(id, password) {
        const body = {
            api_name: "get_user_settings",
            body: {
                id: id,
                password: password
            }
        }

        this.request(limes, body);
    },

    get_user_tags(id, password) {
        const body = {
            api_name: "get_user_tags",
            body: {
                id: id,
                password: password
            }
        }

        this.request(limes, body);
    },

    get_user_file_ids(id, password) {
        const body = {
            api_name: "get_user_file_ids",
            body: {
                id: id,
                password: password
            }
        }

        this.request(limes, body);
    },

    get_login_info(id, password) {
        const body = {
            api_name: "get_login_info",
            body: {
                id: id,
                password: password
            }
        }

        this.request(limes, body);
    },

    set_user_settings(id, password, setting_name, setting_value) {
        const body = {
            api_name: "set_user_settings",
            body: {
                id:  id,
                password: password,
                setting_name: setting_name,
                setting_value: setting_value
            }
        }

        this.request(limes, body);
    },

    rename_tag(user_id, password, tag_id, tag_name) {
        const body = {
            api_name: "rename_tag",
            body: {
                user_id: user_id,
                password: password,
                tag_id: tag_id,
                tag_name: tag_name
            }
        }

        this.request(limes, body);
    }
}
