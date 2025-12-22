# User Slice in Redux Toolkit

## Overview
This Redux slice manages user authentication state. It provides actions to add and remove user data from the Redux store.

## Installation
Ensure you have Redux Toolkit installed in your project:

```sh
npm install @reduxjs/toolkit react-redux
```

## Code Implementation
Below is the `userSlice.js` file:

```js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: null,
    reducers: {
        addUser: (state, action )=>{
            return action.payload;
        },
        removeUser: () => {
            return null;
        },
    },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
```

## Explanation
- **`createSlice`**: Creates a Redux slice with name, initial state, and reducers.
- **Initial State**: `null`, meaning no user is logged in.
- **Reducers**:
  - `addUser`: Updates the state with user data.
  - `removeUser`: Resets the state to `null` (logs out the user).
- **Exports**:
  - `addUser` and `removeUser` actions for dispatching in components.
  - The reducer to be added to the Redux store.

## Enhancements
### 1. Persist User State
To retain the user state between page reloads:

```js
const initialState = JSON.parse(localStorage.getItem("user")) || null;

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        addUser: (state, action) => {
            localStorage.setItem("user", JSON.stringify(action.payload));
            return action.payload;
        },
        removeUser: () => {
            localStorage.removeItem("user");
            return null;
        },
    },
});
```

### 2. Async User Handling
For fetching user data from an API, use `createAsyncThunk`:

```js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUser = createAsyncThunk("user/fetchUser", async () => {
    const response = await fetch("/api/user");
    return response.json();
});

const userSlice = createSlice({
    name: "user",
    initialState: null,
    reducers: {
        removeUser: () => null,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action) => action.payload);
    },
});
```

## Usage in React Components
In your React component:

```jsx
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "./userSlice";

const UserComponent = () => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();

    return (
        <div>
            {user ? <p>Welcome, {user.name}!</p> : <p>Please log in.</p>}
            <button onClick={() => dispatch(addUser({ name: "John Doe" }))}>Log In</button>
            <button onClick={() => dispatch(removeUser())}>Log Out</button>
        </div>
    );
};
```

## Conclusion
This Redux slice effectively manages user authentication state. Enhancements like persistence and async handling improve user experience.

---
_Last updated: March 23, 2025_