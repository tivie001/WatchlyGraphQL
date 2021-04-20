<script>
  import { query } from "svelte-apollo";
  import { gql } from "apollo-boost";
  const GET_MOVIES = gql`
    query Movie {
      allMovies {
        id
        title
        description
        image
        releaseDate
      }
    }
  `;
  const GET_WATCHLIST = gql`
    query Watchlist {
      watchList {
        id
        title
        description
        image
        releaseDate
        watched
      }
    }
  `;
  const movies = query(GET_MOVIES);
  const watchlist = query(GET_WATCHLIST);
</script>

<style>
  h1 {
    color: white;
  }
  .graphql-container {
    margin: 0 2rem;
    display: grid;
    grid-column-gap: 5px;
  }
  .card-wrapper {
    border-radius: 5px;
    box-shadow: 0 5px 5px -2px rgba(0, 0, 0, 0.9);
    background-color: #262626;
    margin: 2rem 0;
  }
  .movie-container {
    grid-row: 1 / 7;
    grid-column: 1 / 3;
  }
  .watchlist-container {
    grid-column: 4 / 6;
  }
  .new-movies-container {
    grid-column: 7 / 8;
  }
  .movie-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 20px;
    row-gap: 50px;
    grid-auto-rows: minmax(100px, auto);
    padding: 1rem;
  }
  .movie-item {
    transition: 0.5s ease;
  }
  .movie-item:hover {
    transform: scale(1.08);
    cursor: pointer;
  }
  .movie-item small {
    color: #fdfffc;
    margin-top: 10px;
    text-transform: uppercase;
  }
  img:hover {
    background-color: aqua;
  }
  @media only screen and (max-width: 639.99px) {
    .movie-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media only screen and (min-width: 640px) and (max-width: 1099.99px) {
    .movie-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  @media only screen and (min-width: 1100px) and (max-width: 1340px) {
    .movie-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }
</style>

<div class="graphql-container">
  <section class="card-wrapper movie-container">
    <h1>My Favorites Movies</h1>
    <div class="movie-grid">
      {#if $movies.loading}
        Loading...
      {:else if $movies.error}
        Error:
        {$movies.error.message}
      {:else}
        {#each $movies.data['allMovies'] as movie}
          <div class="movie-item">
            <div class="img-container">
              <img
                class="fav"
                src="https://image.tmdb.org/t/p/w500{movie.image}"
                height="200"
                alt={movie.title} />
            </div>
            <small>{movie.title}</small>
          </div>
        {/each}
      {/if}
    </div>
  </section>
  <section class="card-wrapper watchlist-container">
    <h1>My Favorite TV Shows</h1>
  </section>
  <section class="card-wrapper new-movies-container">
    <h1>Watchlist</h1>
    <div class="movie-grid">
      {#if $watchlist.loading}
        Loading...
      {:else if $watchlist.error}
        Error:
        {$movies.error.message}
      {:else}
        {#each $watchlist.data['watchList'] as movie}
          <div class="movie-item">
            <div class="img-container">
              <img
                class="fav"
                src="https://image.tmdb.org/t/p/w500{movie.image}"
                height="200"
                alt={movie.title} />
            </div>
            <small>{movie.title}</small>
          </div>
        {/each}
      {/if}
    </div>
  </section>
</div>
