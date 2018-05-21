## API Reference

### Users ###

**POST** `/api/v1/newuser`
Used in order to create a user.
* **Pre-Conditions:**
    * Must send valid user account details to the API.
    ```
    {
      "username": "",
      "password": "",
      "first_name": "",
      "last_name": "",
      "email": ""
    }
    ```
* **Post-Conditions:**
    * **200 OK:** User was successfully created using the specified details.
* **Error Conditions:**
   * **400 Bad Request:** If the user already exists, the API will return a 400 response code and no user will be created.
   
**POST** `/api/v1/login`
Used to authenticate a user to a specified account.
* **Pre-Conditions:**
    * Must have posted valid credentials to the API.
* **Post-Conditions:**
    * **200 OK:** If authentication was successful, the API will return a 200 response code and update the last_login entry associated with the account.
* **Error Conditions:**
   * **400 Bad Request:** Wrong credentials *(Suggest: 401 Unauthorized for Incorrect Credentials.)*
   * *(Suggest: 400 Bad Request for improperly formatted JSON.)*
 
**GET** `/api/v1/user/(id)`
Used to retrieve the current state of a user account.
* **Pre-Conditions:**
    * Must have a User Identifier (id).
* **Post-Conditions:**
    * **200 OK:** JSON Representation of a user account object.
* **Error Conditions:**
    * **404 Not Found:** If the user is not found, the API will return a 404 response code and no user state will be returned.
