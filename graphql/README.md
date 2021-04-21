# GraphQL Server Example

Created By: Tyler Ivie

## Prisma as your data modeling tool

- [Prisma Schema](https://github.com/tivie001/DGM4790-graphql-example/blob/main/prisma/schema.prisma)
- [Schema.js](https://github.com/tivie001/DGM4790-graphql-example/blob/main/prisma/seed.js)

## Docker-based PostgreSQL or MySQL as your data store

- I used PostgresQL

## At least 3 Query resolvers allowing users to get data from your server

### 1. Get all popular movies

```graphql
query {
  allMovies {
    id
    title
    description
    releaseDate
    image
  }
}
```

### 2. Get all popular TV Shows

```graphql
query {
  tvShow {
    id
    title
    description
    releaseDate
    image
    voteAverage
  }
}
```

### 3. Get all TV Shows & Movies on Watchlist

Install npm dependencies:

```graphql
query {
  watchList {
    id
    title
    description
    releaseDate
    image
    watched
  }
}
```

## At least 2 Mutation resolvers allowing users to create, update, or upsert an item.

### 1. Add a movie/TV show to watchlist

```graphql
mutation addMovieToWatchlist {
  addMovieToWatchlist(
    data: {
      id: 1
      title: "Inception"
      description: "This is a description for the movie Inception"
      releaseDate: "2010-03-24T00:00:00.000Z"
      watched: false
    }
  ) {
    id
    title
    description
    releaseDate
    watched
  }
}
```

### 2. Update a movie/TV show on watchlist to "Watched"

```graphql
mutation updateWatchListMovie {
  updateWatchListMovie(
    id: 7
    data: { id: 1, title: "Inception", watched: false }
  ) {
    id
    watched
  }
}
```

## At least 1 Mutation resolver allowing users to delete an item.

### 2. Delete a movie/TV show from watchlist

```graphql
mutation deleteMovieWatchlist {
  deleteMovieWatchlist(id: 7) {
    title
    id
  }
}
```

## Your datastore will contain at least 25 items

- Movies database has 10 items
- Watchlist database has 5 items
- TV Show database has 10 items

## Your app will be deployable locally using Docker and will have seed data entered into the datastore.

- App running in a docker container and deployed to Heroku
