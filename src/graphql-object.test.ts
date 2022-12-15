import { describe, it, expect } from "vitest";
import gql from "graphql-tag";
import { parseGraphQLResponse } from "./index";

describe("parseGraphQLResponse", () => {
  it("parses a basic object", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          name
        }
      }
    `;

    const inputObject = {
      getUser: {
        id: 5,
        name: "John Doe",
        age: 12,
      },
    };

    const response = parseGraphQLResponse(query, inputObject);
    expect(response).toEqual({
      getUser: {
        id: 5,
        name: "John Doe",
      },
    });
  });

  it("parses a complex object", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          name
          address {
            line1
            postcode {
              part2
            }
          }
        }
      }
    `;

    const inputObject = {
      getUser: {
        id: 5,
        name: "John Doe",
        age: 12,
        address: {
          line1: "line 1",
          line2: "line 2",
          line3: "line 3",
          postcode: {
            part1: "part 1",
            part2: "part 2",
          },
        },
      },
    };

    const response = parseGraphQLResponse(query, inputObject);
    expect(response).toEqual({
      getUser: {
        id: 5,
        name: "John Doe",
        address: {
          line1: "line 1",
          postcode: {
            part2: "part 2",
          },
        },
      },
    });
  });

  it("parses an object where the root is an array", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          name
        }
      }
    `;

    const inputObject = {
      getUser: [
        {
          id: 1,
          name: "John Doe",
          age: 12,
        },
        {
          id: 2,
          name: "Jane Doe",
          age: 14,
        },
      ],
    };

    const response = parseGraphQLResponse(query, inputObject);
    expect(response).toEqual({
      getUser: [
        {
          id: 1,
          name: "John Doe",
        },
        {
          id: 2,
          name: "Jane Doe",
        },
      ],
    });
  });

  it("parses an object where the nested data is an array", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          age
        }
      }
    `;

    const inputObject = {
      getUser: [
        {
          id: 1,
          name: "John Doe",
          age: [12],
        },
        {
          id: 2,
          name: "Jane Doe",
          age: [14, 15, 16],
        },
      ],
    };

    const response = parseGraphQLResponse(query, inputObject);
    expect(response).toEqual({
      getUser: [
        {
          id: 1,
          age: [12],
        },
        {
          id: 2,
          age: [14, 15, 16],
        },
      ],
    });
  });

  it("parses a complex object where the nested data is an array", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          name
          addresses {
            line1
            postcodes {
              part2
            }
          }
        }
      }
    `;

    const inputObject = {
      getUser: [
        {
          id: 1,
          name: "John Doe",
          age: 12,
          addresses: [
            {
              line1: "14 Main St",
              line2: "East Village",
              line3: "New York",
              postcodes: [
                {
                  part2: "N2",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: "Jane Doe",
          age: 14,
          addresses: [
            {
              line1: "18 Summer St",
              line2: "Hackney",
              line3: "London",
              postcodes: [
                {
                  part1: "E1",
                  part2: "E2",
                },
                {
                  part1: "X1",
                  part2: "X2",
                },
              ],
            },
            {
              line1: "289 Fifth Ave",
              line2: "Manhattan",
              line3: "New York",
              postcodes: [],
            },
          ],
        },
      ],
    };

    const response = parseGraphQLResponse(query, inputObject);
    expect(response).toEqual({
      getUser: [
        {
          id: 1,
          name: "John Doe",
          addresses: [
            {
              line1: "14 Main St",
              postcodes: [
                {
                  part2: "N2",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: "Jane Doe",
          addresses: [
            {
              line1: "18 Summer St",
              postcodes: [
                {
                  part2: "E2",
                },
                {
                  part2: "X2",
                },
              ],
            },
            {
              line1: "289 Fifth Ave",
              postcodes: [],
            },
          ],
        },
      ],
    });
  });

  it("parses an object where the query includes fragments", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          age
          ...UserDetails
        }
      }

      fragment UserDetails on User {
        name {
          first
          last
        }
        favouriteColor
      }
    `;

    const inputObject = {
      getUser: [
        {
          id: 1,
          name: {
            first: "John",
            last: "Doe",
            shouldBeIgnored: "should be ignored",
          },
          favouriteColor: "blue",
          age: 12,
        },
        {
          id: 2,
          name: {
            first: "Jane",
            last: "Doe",
            shouldBeIgnored: "should be ignored",
          },
          favouriteColor: "red",
          age: 14,
        },
      ],
    };

    const response = parseGraphQLResponse(query, inputObject);
    expect(response).toEqual({
      getUser: [
        {
          id: 1,
          name: {
            first: "John",
            last: "Doe",
          },
          favouriteColor: "blue",
          age: 12,
        },
        {
          id: 2,
          name: {
            first: "Jane",
            last: "Doe",
          },
          favouriteColor: "red",
          age: 14,
        },
      ],
    });
  });

  it("parses an object where the query includes inline fragments", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          age
          ... on User {
            ...UserDetails
          }
        }
      }

      fragment UserDetails on User {
        name {
          first
          last
        }
        favouriteColor
      }
    `;

    const inputObject = {
      getUser: [
        {
          id: 1,
          name: {
            first: "John",
            last: "Doe",
            shouldBeIgnored: "should be ignored",
          },
          favouriteColor: "blue",
          age: 12,
        },
        {
          id: 2,
          name: {
            first: "Jane",
            last: "Doe",
            shouldBeIgnored: "should be ignored",
          },
          favouriteColor: "red",
          age: 14,
        },
      ],
    };

    const response = parseGraphQLResponse(query, inputObject);
    expect(response).toEqual({
      getUser: [
        {
          id: 1,
          name: {
            first: "John",
            last: "Doe",
          },
          favouriteColor: "blue",
          age: 12,
        },
        {
          id: 2,
          name: {
            first: "Jane",
            last: "Doe",
          },
          favouriteColor: "red",
          age: 14,
        },
      ],
    });
  });

  it("parses many queries", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          ...UserDetails
          address {
            street
            postcode {
              part1
              part2
            }
          }
        }
      }

      mutation updateUser {
        updateUser(id: 1) {
          id
          updates {
            name {
              first
            }
          }
        }
      }

      query getString {
        getString
      }

      fragment UserDetails on User {
        name {
          first
          last
        }
        favouriteColor
      }
    `;

    const inputObject = {
      getUser: {
        id: 1,
        name: {
          first: "John",
          last: "Doe",
          extra: "should not appear",
        },
        favouriteColor: "red",
        age: 2,
        address: {
          house: 2,
          street: "123 Main St",
          postcode: {
            part1: "123",
            part2: "4567",
            part3: "1234",
          },
        },
      },
      updateUser: {
        id: 1,
        updates: {
          name: {
            first: "John",
            last: "Doe",
            extra: "should not appear",
          },
        },
      },
      getString: "Hello World",
    };

    const response = parseGraphQLResponse(query, inputObject);
    expect(response).toEqual({
      getUser: {
        id: 1,
        name: {
          first: "John",
          last: "Doe",
        },
        favouriteColor: "red",
        address: {
          street: "123 Main St",
          postcode: {
            part1: "123",
            part2: "4567",
          },
        },
      },
      updateUser: {
        id: 1,
        updates: {
          name: {
            first: "John",
          },
        },
      },
      getString: "Hello World",
    });
  });

  it("fills missing data with 'null' when includeMissingData true", () => {
    const query = gql`
      {
        getUser(id: 5) {
          id
          name
          address {
            line1
            line2
            postcode {
              part1
              part2
            }
          }
        }
      }
    `;

    const inputObject = {
      getUser: {
        id: 5,
        name: "John Doe",
        address: {
          line1: "line 1",
          postcode: {
            part1: "part 1",
          },
        },
      },
    };

    const response = parseGraphQLResponse(query, inputObject, {
      includeMissingData: true,
    });

    expect(response).toEqual({
      getUser: {
        id: 5,
        name: "John Doe",
        address: {
          line1: "line 1",
          line2: null,
          postcode: {
            part1: "part 1",
            part2: null,
          },
        },
      },
    });
  });
});
