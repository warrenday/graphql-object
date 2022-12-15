<div align="center">
  <h1>GraphQL Local</h1>
  <h3>Query plain JS objects directly with GraphQL. Without the need for a schema or resolvers</h3>
</div>

<br />

## Intro

GraphQL Local was initially created to mock GraphQL APIs where the schema was not known. However it is a very useful solution for filtering complex objects in general.

Taking any object you can use GraphQL to reduce it down to only the data you care about.

## Example

```ts
import { queryObject } from "graphql-local";

const query = gql`
  {
    getUser(id: 5) {
      id
      name
      address {
        city
      }
    }
  }
`;

const userData = {
  getUser: {
    id: 5,
    name: "John Doe",
    age: 12,
    address: {
      line1: "Brickmore Lane",
      city: "London",
    },
  },
};

const reducedObject = queryObject(query, userData);

// {
//   getUser: {
//     id: 5,
//     name: "John Doe",
//     address: {
//       city: "London",
//     },
//   },
// };
```
