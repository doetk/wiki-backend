# Documentation for all GET APIs
#### base_url/api/v1/pages
#### base_url/api/v1/pages/:pageid
#### base_url/api/v1/pages/:pageid/current
#### base_url/api/v1/pages/:pageid/revisions/revisionid

*Successful* call returns 200 (OK)
*Unsuccessful* call return 404 (Page not Found)

*Error Handlers* are working effifiently

### *Set up Postgresql data base before these*
1. Fork/Clone
2. Install dependencies - `npm install`
3. Run the development server - `npm start`



### Pages ###
**GET** `/api/v1/pages`
Used in order to retrieve a representation of all pages and applicable routes to retrieve their page states.
* **Pre-Conditions:**
   * None.
* **Post-Conditions:**
   * **200 OK:** JSON Representation of title and route pairs for each page.
   ```
   {
     [
       {
          "title":"Example Title", 
          "route": "/api/v1/pages/example_title"
       },
       ...
     ]
   }
   ```
   
**GET** `/api/v1/pages/(id)`
Used in order to retrieve the full representation of a given page's page state.
* **Pre-Conditions:**
   * Must have a Page Identifier (id).
* **Post-Conditions:**
   * **200 OK:** JSON Representation of the current page state with all revisions attached.
   ```
   {
     "id": "example_title",
     "title": "Example Title",
     "lastmodified": "2017-11-01T00:00:00",
     "lastauthor": "JuicyKitten",
     "content": "Lorem *ipsum* dolor sit amet, consectetur adipiscing elit, ~sed do eiusmod tempor~ incididunt ut labore...",
     "revisions": [
       { "revision_id": "1", "route": "/api/v1/pages/example_title/revisions/1" },
       { "revision_id": "2", "route": "/api/v1/pages/example_title/revisions/2" },
      ]
   }
   ```
* **Error Conditions:**
   * **404 Not Found:** If the page is not found, the API will return a 404 response code.
   
**GET** `/api/v1/pages/(id)/current`
 Used in order to retrieve the page state for the most recent revision in a page's revision stack.
* **Pre-Conditions:**
   * Must have a Page Identifier (id).
* **Post-Conditions:**
   * **200 OK:** JSON Representation of the current page state __without revisions attached__.
   ```
   {
     "id": "example_title",
     "title": "Example Title",
     "lastmodified": "2017-11-01T00:00:00",
     "lastauthor": "JuicyKitten",
     "content": "Lorem *ipsum* dolor sit amet, consectetur adipiscing elit, ~sed do eiusmod tempor~ incididunt ut labore...",
   }
   ```
* **Error Conditions:**
   * **404 Not Found:** If the page is not found, the API will return a 404 response code.
   
 **GET** `/api/v1/pages/(id)/revisions/(rev-id)`
 Used in order to retrieve the page state for a specific revision within a page's revision stack.
* **Pre-Conditions:**
   * Must have a Page Identifier (id).
   * Must have a Revision Identifier (rev-id).
* **Post-Conditions:**
   * **200 OK:** JSON Representation of the page state for a given revision number.
   ```
   {
     "id": "example_title",
     "title": "Example Title",
     "lastmodified": "2017-11-01T00:00:00",
     "lastauthor": "JuicyKitten",
     "content": "Lorem *ipsum* dolor sit amet, consectetur adipiscing elit, ~sed do eiusmod tempor~ incididunt ut labore...",
   }
   ```
* **Error Conditions:**
   * **400 Bad Request:** If the page exists, but the revision does not, the API will return a 400 response code without a page state.
   * **400 Bad Request:** If the revision id is non-numeric, the API will return a 400 response code without a page state.
   * **404 Not Found:** If the page is not found, the API will return a 404 response code.
 
 **POST** `/api/v1/pages`
 Used in order to create a new blank page stub with no content. Use the applicable PUT function to update contents.
 * **Pre-Conditions:**
    * Must have a valid JSON representation of a page state.
    ```
    {
      "title": "New Resource Title!"
    }
    ```
    * Submitting user must be authenticated with a valid Javascript Web Token.
 * **Post-Conditions:**
    * **201 Created:** If the resource is created, then the API will return an object indicating the newly created resource.
    ```
    {
      "title": "New Resource Title!",
      "route": "/api/v1/pages/new_resource_title"
    }
    ```
 * **Error Conditions:**
    * **400 Bad Request:** If the resource already exists, the API will return a 400 response code and the resource will not be created.
    * **401 Unauthorized:** If the user is signed in, but permissions are denied, then the API will respond with a 401 response code and the resource will not be created.
    * **403 Forbidden:** If the user is not signed in, the API will respond with a 403 response code and the resource will not be created.
    * **412 Precondition Failed:** If the user's request is missing vital information (JSON), the API will respond with a 412 response code and the resource will not be created.
    
 **PUT** `/api/v1/pages/(id)`
 Used in order to update the contents of a given page.
 * **Pre-Conditions:**
    * Must have a valid Page Identifier (id).
    * Must have a valid JSON representation of a page state.
    ```
    { "content": "Lorem *ipsum* elit, ~sed do eiusmod tempor~ incididunt ut labore..." }
    ```
    * Submitting user must be authenticated with a valid Javascript Web Token.
 * **Post-Conditions:**
    * **200 OK:** If the resource is updated, the API will respond with a 200 response code and the state of the newly updated object.
    ```
    {
     "id": "example_title",
     "title": "Example Title",
     "lastmodified": "2017-11-01T14:12:36",
     "lastauthor": "JohnDoe",
     "content": "Lorem *ipsum* elit, ~sed do eiusmod tempor~ incididunt ut labore...",
   }
    ```
 * **Error Conditions:**
    * **401 Unauthorized:** If the user is signed in, but permissions are denied, then the API will respond with a 401 response code and the resource will not be created.
    * **403 Forbidden:** If the user is not signed in, the API will respond with a 403 response code and the resource will not be created.
    * **404 Not Found:** If the resource does not exist, the API will return a 404 response code and the resource will not be updated.
    * **412 Precondition Failed:** If the user's request is missing vital information (JSON), the API will respond with a 412 response code and the resource will not be created.