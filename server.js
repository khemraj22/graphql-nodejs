const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { GraphQLSchema, GraphQLObjectType,
    GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql')

const AUTHORS = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]

const BOOKS = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }

]

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Author of a book.',
    fields: () => {
        return ({
            id: {
                type: GraphQLNonNull(GraphQLInt),
            },
            name: {
                type: GraphQLNonNull(GraphQLString)
            },
            books: {
                type: new GraphQLList(BookType),
                resolve: (author) => {
                    return BOOKS.filter(book => book.authorId === author.id)
                }
            }
        })
    }
})
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This is a book description',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLInt),
        },
        name: {
            type: GraphQLNonNull(GraphQLString)
        },
        authorId: {
            type: GraphQLNonNull(GraphQLInt)
        },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return AUTHORS.find(author => author.id === book.authorId)
            }
        }
    })
})
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => BOOKS.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of all books',
            resolve: () => BOOKS
        },
        author: {
            type: AuthorType,
            description: 'author',
            args: { id: { type: GraphQLInt } },
            resolve: (parent, args) => AUTHORS.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all authors',
            resolve: () => AUTHORS
        }
    })

})

const RootMutationType = new GraphQLObjectType({
    name: 'mutation',
    description: 'root mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: "add a book",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = { id: BOOKS.length + 1, name: args.name, authorId: args.authorId }
                BOOKS.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "add a author",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = { id: AUTHORS.length + 1, name: args.name }
                AUTHORS.push(author)
                return author
            }
        }

    })
})

const MyGraphQLSchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
const app = express()
app.use('/graphql', graphqlHTTP({
    schema: MyGraphQLSchema,
    graphiql: true
}))
app.listen(5000, () => {
    console.log('server is running')
})