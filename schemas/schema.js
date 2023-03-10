const graphql = require('graphql');

const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } = graphql;

const Book = require('../models/book');
const Author = require('../models/author');
// dummy database
/*
var books = [
    { name: 'Lord of the Rings', genre: 'Fantasy', id: "1", authorId: "1" },
    { name: 'The Fault in our stars', genre: 'Young Adult', id: "1", authorId: "1" },
]

var authors = [
    { name: 'George R. R. Martin', age: 151, id: "1" },
    { name: 'Charles Dickens', age: 200, id: "2" },
]
*/

// This code defines a GraphQL object type called BookType, 
// which has four fields: id, name, genre and author. Each field specifies its type using the type property, which in this case is graphql.GraphQLString and for author we need to run a resolve function that performs join operation to populate the subdocument.
const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: graphql.GraphQLID },
        name: { type: graphql.GraphQLString },
        genre: { type: graphql.GraphQLString },
        // populating here
        author: {
            type: AuthorType,
            // parent is the root document found
            resolve(parent, args) {
                // find the author document for populating
                return Author.findById(parent.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: graphql.GraphQLID },
        name: { type: graphql.GraphQLString },
        age: { type: graphql.GraphQLInt },
        books: {
            type: new graphql.GraphQLList(BookType),
            resolve(parent, args) {
                return Book.find({authorId: parent.id})
            }
        }
    })
})

// 'query' performs READ operations to data. We provide the arguments to be passed to the query and the logic is inside resolve function
// for first type, the graphQL query will now be: book(id: 123) {
//    name,
//    genre
// }
//  here, 123 is the argument, name and genre is the field that wish to see and resolve function will use the argument to query the data and return to user
const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        book: {
            type: BookType,
            args: { id: {type: GraphQLID} },
            // write the logic to fetch the data here
            resolve(parent, args) {
                const id = args.id;
                return Book.findById(id);
            }
        },
        author: {
            type: AuthorType,
            args: { id: {type: GraphQLID} },
            // write the logic to fetch the data here
            resolve(parent, args) {
                const id = args.id;
                return Author.findById(id);
            }
        },
        // query to get books
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                return Book.find({})
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                // return all books without having any condition
                return Author.find({})
            }
        }
    }
})

// 'mutation' performs write operations to data. same way here also we provide the arguments to be passed to the query and the logic is inside resolve function
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: GraphQLString },
                age: { type: graphql.GraphQLInt }
            },
            resolve(parent, args) {
                let author = new Author({
                    name: args.name,
                    age: args.age
                })
                return author.save()
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: GraphQLString },
                genre: { type: GraphQLString },
                authorId: { type: GraphQLID  }
            },
            resolve(parent, args) {
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId,
                })
                return book.save()
            }
        }
    }
})
module.exports = new graphql.GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})