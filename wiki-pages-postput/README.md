## API Reference

### Pages ###
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
    * **400 Bad Request:** If the resource already exists, the API will return a 402 response code and the resource will not be created.
    * **401 Unauthorized:** If the user is signed in, but permissions are denied, then the API will respond with a 401 response code and the resource will not be created.
    * **403 Forbidden:** If the user is not signed in, the API will respond with a 403 response code and the resource will not be created.
    
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
    * **404 Not Found:** If the resource does not exist, the API will return a 404 response code and the resource will not be updated.
    * **401 Unauthorized:** If the user is signed in, but permissions are denied, then the API will respond with a 401 response code and the resource will not be created.
    * **403 Forbidden:** If the user is not signed in, the API will respond with a 403 response code and the resource will not be created.