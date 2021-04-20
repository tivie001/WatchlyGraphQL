<script>
    import { Router, Route } from 'svelte-routing'
    import MyMovies from './MyWatchList.svelte'
    export let url = ''
</script>

<Router {url}>
    <div style="background-color: black">
        <Route path="my-movies" component={MyMovies}/>
    </div>
</Router>