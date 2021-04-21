const {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
} = require('nexus')
const { DateTimeResolver } = require('graphql-scalars')

const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allMovies', {
      type: 'Movie',
      resolve: (_parent, _args, context) => {
        return context.prisma.movie.findMany()
      },
    })
    t.nonNull.list.nonNull.field('watchList', {
      type: 'Watchlist',
      resolve: (_parent, _args, context) => {
        return context.prisma.watchlist.findMany()
      },
    })
    t.nonNull.list.nonNull.field('tvShow', {
      type: 'Tvshow',
      resolve: (_parent, _args, context) => {
        return context.prisma.tvshow.findMany()
      },
    })
  }
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.nonNull.field('addMovieToWatchlist', {
      type: 'Watchlist',
      args: {
        data: nonNull(
          arg({
            type: 'AddMovieInput',
          }),
        ),
      },
      resolve: (_, args, context) => {
        return context.prisma.watchlist.create({
          data: {
            title: args.data.title,
            description: args.data.description,
            image: args.data.image,
            releaseDate: args.data.releaseDate,
            watched: args.data.watched
          },
        })
      },
    })
    t.field('updateWatchListMovie', {
      type: 'Watchlist',
      args: {
        id: nonNull(intArg()),
        data: nonNull(
          arg({
            type: 'AddMovieInput',
          }),
        ),
      },
      resolve: (_, args, context) => {
        return context.prisma.watchlist.update({
          where: { id: args.id || undefined },
          data: {
            title: args.data.title,
            description: args.data.description,
            image: args.data.image,
            releaseDate: args.data.releaseDate,
            watched: args.data.watched
          },
        })
      },
    })
    t.field('deleteMovieWatchlist', {
      type: 'Watchlist',
      args: {
        id: nonNull(intArg()),
      },
      resolve: (_, args, context) => {
        return context.prisma.watchlist.delete({
          where: { id: args.id },
        })
      },
    })
  },
})

const Movie = objectType({
  name: 'Movie',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('title')
    t.string('description')
    t.string('image')
    t.field('releaseDate', { type: 'DateTime' })
  },
})
const Watchlist = objectType({
  name: 'Watchlist',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('title')
    t.string('description')
    t.string('image')
    t.field('releaseDate', { type: 'DateTime' })
    t.boolean('watched')
  },
})
const Tvshow = objectType({
  name: 'Tvshow',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('title')
    t.string('description')
    t.string('image')
    t.field('releaseDate', { type: 'DateTime' })
    t.string('voteAverage')
  },
})

const AddMovieInput = inputObjectType({
  name: 'AddMovieInput',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('title')
    t.string('description')
    t.string('image')
    t.field('releaseDate', { type: 'DateTime' })
    t.boolean('watched')
  },
})

// const PostCreateInput = inputObjectType({
//   name: 'PostCreateInput',
//   definition(t) {
//     t.nonNull.string('title')
//     t.string('content')
//   },
// })

// const UserCreateInput = inputObjectType({
//   name: 'UserCreateInput',
//   definition(t) {
//     t.nonNull.string('email')
//     t.string('name')
//     t.list.nonNull.field('posts', { type: 'PostCreateInput' })
//   },
// })

const schema = makeSchema({
  types: [
    Query,
    Mutation,
    Movie,
    Watchlist,
    Tvshow,
    AddMovieInput,
    // PostCreateInput,
    // PostOrderByUpdatedAtInput,
    DateTime,
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})

module.exports = {
  schema: schema,
}
