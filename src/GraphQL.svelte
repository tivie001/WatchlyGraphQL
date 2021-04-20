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
        watched
      }
    }
  `;
  const movies = query(GET_MOVIES);
  // console.log(movies);
</script>

<style>
  .done {
    text-decoration: line-through;
  }
</style>

<div style="text-align:center">
  <h2>Svedos</h2>

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
