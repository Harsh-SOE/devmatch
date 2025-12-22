# Getting Started with Redux Toolkit

## Purpose
Redux Toolkit is the recommended way to write Redux logic. It simplifies the setup process and reduces boilerplate code. It was created to address common concerns like:

- **Complicated store configuration**
- **Need for multiple packages**
- **Too much boilerplate code**

Redux Toolkit also includes **RTK Query**, a powerful data fetching and caching tool that simplifies API interaction.

## Installation
### Creating a New React Redux App
Use the official **Redux Toolkit + TypeScript** template for Vite:
```sh
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app
```
Or use Next.js with the `with-redux` template:
```sh
npx create-next-app --example with-redux my-app
```
For React Native, check these templates:
- [React Native Redux Template](https://github.com/rahsheen/react-native-template-redux-typescript)
- [Expo Redux Template](https://github.com/rahsheen/expo-template-redux-typescript)

### Adding Redux Toolkit to an Existing App
Install Redux Toolkit and React-Redux:
```sh
npm install @reduxjs/toolkit react-redux
```

## What's Included
Redux Toolkit provides:

### **Core APIs**
- **`configureStore()`**: Simplifies store setup, includes middleware, and enables Redux DevTools.
- **`createReducer()`**: Uses `immer` for writing immutable updates with mutable syntax.
- **`createAction()`**: Generates action creators.
- **`createSlice()`**: Combines reducers, actions, and initial state into one.
- **`combineSlices()`**: Merges multiple slices dynamically.
- **`createAsyncThunk()`**: Handles async logic like API calls.
- **`createEntityAdapter()`**: Manages normalized data in the store.
- **`createSelector()`**: Uses Reselect for memoized selectors.

## RTK Query
RTK Query simplifies data fetching and caching. It's included in `@reduxjs/toolkit` and can be used like this:

```js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUsers: builder.query({ query: () => 'users' })
  })
});

export const { useGetUsersQuery } = api;
```

### **RTK Query APIs**
- **`createApi()`**: Defines API endpoints.
- **`fetchBaseQuery()`**: Simplifies API requests.
- **`<ApiProvider />`**: Used if Redux store is not set up.
- **`setupListeners()`**: Enables automatic refetching on mount/reconnect.

## Learning Resources
### **Tutorials**
- [Redux Essentials](https://redux.js.org/tutorials/essentials/part-1-overview-concepts) - Recommended for beginners.
- [Redux Fundamentals](https://redux.js.org/tutorials/fundamentals/part-1-overview) - Teaches core concepts.
- [Learn Modern Redux (Livestream)](https://redux.js.org/modern-redux)

### **Community Support**
- Join the `#redux` channel on **Reactiflux Discord**.
- Ask questions on **Stack Overflow** using the `#redux` tag.

---
_Last updated: March 23, 2025_
