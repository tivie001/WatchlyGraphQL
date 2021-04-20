<script>
    import { getContext } from "svelte";
    import MovieDialog from "./MovieDialog.svelte";
    import axios from "axios";
    let movies = [];

    const { open } = getContext("simple-modal");
    const openDialog = (movie) => {
        open(MovieDialog, { movie: movie });
    };

    const apiRequest = (method) => {
        const options = {
            method: method,
            url:
                "https://api.themoviedb.org/3/movie/popular?api_key=122cb5fa006839351612caa3df4aa718",
        };
        axios
            .request(options)
            .then((res) => {
                console.log(res);
                movies = res.data.results;
                console.log(movies);
            })
            .catch((err) => {
                console.log(err);
            });
    };
    async function getResult() {
        await apiRequest("get");
    }
    getResult();
</script>

<style>
    .card-wrapper {
        grid-column: 1 / 8;
        grid-row: 1 / 7;
        border-radius: 5px;
        box-shadow: 0 5px 5px -2px rgba(0, 0, 0, 0.9);
        background-color: #262626;
        margin-bottom: 2rem;
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

<section class="card-wrapper">
    <div class="movie-grid">
        {#each movies as movie}
            <div class="movie-item" on:click={openDialog(movie)}>
                <div class="img-container">
                    <img
                        class="fav"
                        src="https://image.tmdb.org/t/p/w500{movie.poster_path}"
                        height="200"
                        alt={movie.title} />
                </div>
                <small>{movie.title}</small>
            </div>
        {/each}
    </div>
</section>
