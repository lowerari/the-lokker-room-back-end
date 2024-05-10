# The Lokker Room API

Welcome to the lokker room api, a basic back end for a practice messaging app for teams.

## Utilization

In order to make use of this back end, a SQL database must first be set up. The original database uses the following tables (with their respective columns):

Users
-id (primary key, auto increment)
-email (text)
-password (text)
-nickname (text)
-team (text)

Lobbies
-id (primary key, auto increment)
-user_id (foreign key referencing "id" of "users" table)
-name (text)
-team (text)

Messages
-id (primary key, auto increment)
-lobby_id (foreign key, references "id" of "lobbies" table)
-sender_id (foreign key, references "id" of "users" table)
-created_at (timestamp)

DM
-id (you guessed it: primary key, auto increment)
-recipient_id (foreign key, references "id" of "users" table)
-sender_id (another foreign key referencing "id" of "users" table)
-created_at (timestamp)

The following endpoints can be utilized:

- /api/test (GET request to test connection to the API)
- /api/register (POST request to register a new user)
    - Requires:
        - 'email, nickname, password, team' from request body
- /api/login (POST request to login. Generates a JWT)
    - Requires:
        - 'email, password' from request body
- /api/lobbies/hello (GET request that returns "Hello + username")
    - Requires:
        - JWT from authorization header
- /api/lobbies (POST request to make a new lobby)
    - Requires:
        - JWT from authorization header
        - 'name' from request body
- /api/lobbies (GET request to view lobbies)
    - Requires:
        - JWT from authorization header
- /api/lobbies/:lobbyID/add_user (POST request that allows a new user to be added to the application)
    - Requires:
        - JWT from authorization header
        - 'newUserEmail, newUserNickname, newUserPassword' from request body
- /api/lobbies/user (GET request that retrieves user information)
    - Requires:
        - JWT from authorization header
- /api/lobbies/:lobbyID/messages (GET request to view messages in a lobby)
    - Requires:
        - JWT from authorization header
- /api/lobbies/:lobbyID/new_message (POST request to send a new message)
    - Requires:
        - JWT from authorization header
        - 'message' from request body 
- /api/lobbies/:lobbyID/messages/:messageID (PUT request to edit a message)
    - Requires:
        - JWT from authorization header
        - 'newContent' from request body
- /api/lobbies/:lobbyID/messages/:messageID (DELETE request to delete a message)
    - Requires:
        - JWT from authorization header
- /api/direct_messages/:userID (GET request to retrieve all dms associated with a certain user ID)
    - Requires:
        - JWT from authorization header
- /api/direct_messages/:userID/new_message (POST request to send a new message)
    - Requires:
        - JWT from authorization header
        - 'messageRecipient, directMessage' from request body

## Live server

All end points can be used with server:
https://frozen-dusk-10243-6bbfc1b3a39e.herokuapp.com

## Points for improvement

- Check email is unique during registration
- Possibly redo direct messaging in order to be more front end friendly
