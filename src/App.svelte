<script>
	let title = "Home";
	import Movies from "./Components/Movies.svelte";
	import Modal from "svelte-simple-modal";
	import { Router, Link, Route } from "svelte-routing";
	import ApolloClient from "apollo-boost";
	import { setClient } from "svelte-apollo";
	import MyWatchList from "./Components/MyWatchlist.svelte";
	import GraphQL from "./Components/GraphQL.svelte";
	export let url = "";

	const client = new ApolloClient({
		uri: "http://localhost:4000/graphql",

		onError: ({ networkError, graphQLErrors }) => {
			console.log("graphQLErrors", graphQLErrors);
			console.log("networkError", networkError);
		},
	});
	setClient(client);
</script>

<style>
	.app-container {
		background-color: #011627;
		min-height: 100%;
		text-align: center;
	}
	.wrapper {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 10px;
		grid-auto-rows: minmax(100px, auto);
		margin: 1rem 3rem 2rem 3rem;
		padding-top: 2rem;
		background-color: #011627;
	}
	/* ["011627","fdfffc","2ec4b6"] */
	.app-nav {
		height: 70px;
		width: 100%;
		color: #fdfffc;
		background-color: #011627;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		font-family: Raleway;
		border-radius: 0 0 5px 5px;
		box-shadow: 0 5px 5px -2px rgba(0, 0, 0, 0.9);
	}
	.nav-list-items {
		list-style-type: none;
		text-transform: uppercase;
		font-weight: 500;
		padding: 1rem 3rem 0 0;
	}
	.nav-list-items ul {
		margin: 0;
	}
	.title {
		font-weight: bold;
		font-size: 24px;
		color: #2ec4b6;
	}
	.nav-list-items ul li {
		display: inline;
		padding: 0 20px 0 10px;
	}
</style>

<Router {url}>
	<div class="app-container">
		<section class="app-nav">
			<nav class="nav-list-items">
				<ul>
					<li class="title">Watchly</li>
					<li>
						<Link
							to="/"
							class="links"
							style="color: #fdfffc; text-decoration: none">
							Home
						</Link>
					</li>
					<li>
						<Link
							to="watchlist"
							style="color: #fdfffc; text-decoration: none">
							My Movies
						</Link>
					</li>
					<li>
						<Link
							to="graphql"
							style="color: #fdfffc; text-decoration: none">
							GraphQL
						</Link>
					</li>
				</ul>
			</nav>
		</section>
		<Route path="/">
			<div class="wrapper">
				<Modal>
					<Movies />
				</Modal>
			</div>
		</Route>
		<Route path="watchlist" component={MyWatchList} />
		<Route path="graphql" component={GraphQL} />
	</div>
</Router>
