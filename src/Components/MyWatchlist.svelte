<script>
    import { onMount } from "svelte";
    import axios from "axios";
    import FaCheckSquare from "svelte-icons/fa/FaCheckSquare.svelte";
    import FaTrashAlt from "svelte-icons/fa/FaTrashAlt.svelte";

    let watchList = [];
    let favorites = [];

    onMount(async () => {
        const options = {
            method: "GET",
            url: "https://watchly-app-backend.herokuapp.com/api/movies",
        };
        axios
            .request(options)
            .then((res) => {
                watchList = res.data.watchList;
            })
            .catch((err) => {
                console.log(err);
            });
    });
    onMount(async () => {
        const options = {
            method: "GET",
            url: "https://watchly-app-backend.herokuapp.com/api/favorites",
        };
        axios
            .request(options)
            .then((res) => {
                favorites = res.data.favorites;
            })
            .catch((err) => {
                console.log(err);
            });
    });
    const updateMovieToWatched = (movie) => {
        console.log(movie);
        const options = {
            method: "PUT",
            url: `https://watchly-app-backend.herokuapp.com/api/updateList/${movie._id}`,
            data: {
                watched: !movie.watched,
            },
        };
        axios
            .request(options)
            .then((res) => {})
            .catch((err) => {
                console.log(err);
            });
    };
    const updateFavMovieToWatched = (movie) => {
        console.log(movie);
        const options = {
            method: "PUT",
            url: `https://watchly-app-backend.herokuapp.com/api/updateFavList/${movie._id}`,
            data: {
                watched: !movie.watched,
            },
        };
        axios
            .request(options)
            .then((res) => {})
            .catch((err) => {
                console.log(err);
            });
    };
    const deleteWatchListMovie = (movie, index) => {
        watchList.splice(index, 1);
        watchList = watchList;
        const options = {
            method: "DELETE",
            url: `https://watchly-app-backend.herokuapp.com/api/deleteList/${movie._id}`,
            data: {
                watched: !movie.watched,
            },
        };
        axios
            .request(options)
            .then((res) => {})
            .catch((err) => {
                console.log(err);
            });
    };
    const deleteFavoriteMovie = (movie, index) => {
        favorites.splice(index, 1);
        favorites = favorites;
        const options = {
            method: "DELETE",
            url: `https://watchly-app-backend.herokuapp.com/api/deleteFavList/${movie._id}`,
            data: {
                watched: !movie.watched,
            },
        };
        axios
            .request(options)
            .then((res) => {})
            .catch((err) => {
                console.log(err);
            });
    };
    function changeCheckbox(index) {
        const checkboxes = document.querySelectorAll(".check");
        let box = checkboxes.item(index);
        if (box.classList.contains("unchecked-icon")) {
            box.classList.remove("unchecked-icon");
            box.classList.add("checked-icon");
        } else {
            box.classList.remove("checked-icon");
            box.classList.add("unchecked-icon");
        }
    }
    function changeFavCheckbox(index) {
        const checkboxes = document.querySelectorAll(".fav-check");
        let box = checkboxes.item(index);
        if (box.classList.contains("unchecked-icon")) {
            box.classList.remove("unchecked-icon");
            box.classList.add("checked-icon");
        } else {
            box.classList.remove("checked-icon");
            box.classList.add("unchecked-icon");
        }
    }
</script>

<style>
    .card-wrapper {
        display: grid;
        column-gap: 20px;
        margin: 1rem 10rem;
        padding: 0 1rem;
        min-height: 100%;
    }
    .card-title {
        text-align: left;
        color: #2ec4b6;
        font-variant: small-caps;
        font-family: Raleway;
    }
    .list-container {
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 5px 5px -2px rgba(0, 0, 0, 0.9);
        background-color: #262626;
        text-align: left;
        color: #fdfffc;
        grid-column: 1 / 4;
        grid-row: 1 / 7;
    }
    h1 {
        margin-top: 0;
    }
    .fav-container {
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 5px 5px -2px rgba(0, 0, 0, 0.9);
        background-color: #262626;
        grid-column: 5 / 8;
    }
    .list-movie-item {
        border-radius: 5px;
        margin-bottom: 10px;
        color: #fdfffc;
        background-color: #454545;
        border-spacing: 0;
        padding-right: 1rem;
    }
    .list-movie-item h4 {
        text-transform: lowercase;
        font-variant: small-caps;
        margin: 0;
        padding-right: 2rem;
        width: 200px;
        word-wrap: break-word;
    }
    table {
        margin-right: 0;
    }
    table td {
        padding: 0;
    }
    .list-movie-item img {
        padding-right: 2rem;
        height: 100px;
        border-radius: 5px 0 0 5px;
    }
    .unchecked-icon,
    .checked-icon,
    .trash-icon {
        width: 30px;
        height: 30px;
    }
    .trash-icon {
        padding-left: 1rem;
    }
    .unchecked-icon:hover {
        color: #41db2a;
        cursor: pointer;
    }
    .checked-icon {
        color: #41db2a;
    }
    .checked-icon:hover {
        color: #ffffff;
        cursor: pointer;
    }
    .trash-icon:hover {
        color: red;
        cursor: pointer;
    }
    @media only screen and (max-width: 1099.99px) {
        .card-wrapper {
            margin: 1rem 0;
            row-gap: 20px;
        }
        .list-container {
            grid-column: 1 / 8;
        }
        .fav-container {
            grid-column: 1 / 8;
        }
    }
</style>

<section class="card-wrapper">
    <div class="list-container">
        <h1 class="card-title">my watchlist</h1>
        <!-- <button on:click={derp2}>{derp}</button> -->
        {#each watchList as movie, i}
            <table class="list-movie-item">
                <tbody>
                    <tr>
                        <td>
                            <img
                                src={movie.moviePoster}
                                height="100"
                                alt={movie.title} />
                        </td>
                        <td>
                            <h4>{movie.title}</h4>
                        </td>
                        <td>
                            <div on:click={updateMovieToWatched(movie)}>
                                {#if movie.watched}
                                    <div
                                        class="checked-icon check"
                                        on:click={() => changeCheckbox(i)}>
                                        <FaCheckSquare />
                                    </div>
                                {:else}
                                    <div
                                        class="unchecked-icon check"
                                        on:click={() => changeCheckbox(i)}>
                                        <FaCheckSquare />
                                    </div>
                                {/if}
                            </div>
                        </td>
                        <td>
                            <div on:click={deleteWatchListMovie(movie, i)}>
                                <div class="trash-icon">
                                    <FaTrashAlt />
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        {/each}
    </div>
    <div class="fav-container">
        <h1 class="card-title">my favorites</h1>
        {#each favorites as movie, i}
            <table class="list-movie-item">
                <tbody>
                    <tr>
                        <td>
                            <img
                                src={movie.moviePoster}
                                height="100"
                                alt={movie.title} />
                        </td>
                        <td>
                            <h4>{movie.title}</h4>
                        </td>
                        <td>
                            <div on:click={updateFavMovieToWatched(movie)}>
                                {#if movie.watched}
                                    <div
                                        class="checked-icon fav-check"
                                        on:click={() => changeFavCheckbox(i)}>
                                        <FaCheckSquare />
                                    </div>
                                {:else}
                                    <div
                                        class="unchecked-icon fav-check"
                                        on:click={() => changeFavCheckbox(i)}>
                                        <FaCheckSquare />
                                    </div>
                                {/if}
                            </div>
                        </td>
                        <td>
                            <div on:click={deleteFavoriteMovie(movie, i)}>
                                <div class="trash-icon">
                                    <FaTrashAlt />
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        {/each}
    </div>
</section>
