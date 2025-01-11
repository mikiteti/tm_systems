# Documentation

## Requests
- create_user
    - should contain name, username, password and phone
    - whole new user row is returned
- delete user
    - should contain id and password
- update user
    - should contain id, password, update_name and update_value
    - updatable properties: name, username, settings.*
- get user
    - should contain id, password
    - may contain data names to be returned in an array of strings
