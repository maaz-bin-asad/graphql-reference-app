const graphql = require('graphql');

const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql;

// dummy database
var books = [
    { name: 'Lord of the Rings', genre: 'Fantasy', id: "1" },
    { name: 'The Fault in our stars', genre: 'Young Adult', id: "1" },
]
// This code defines a GraphQL object type called BookType, 
// which has three fields: id, name, and genre. Each field specifies its type using the type property, which in this case is graphql.GraphQLString.
const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: graphql.GraphQLID },
        name: { type: graphql.GraphQLString },
        genre: { type: graphql.GraphQLString },
    })
})

// This code represents the schema of a GraphQL server, and specifies the available queries that a client can make. In this case, the 'book' field is the only query that is available, and it takes an id argument to retrieve a specific book.
// The GraphQLObjectType function is used to create a new GraphQL object type. The name property specifies the name of the object type, and the fields property specifies the fields that are available on the object type.
// the graphQL query will now be: book(id: 123) {
//    name,
//    genre
// }
const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        book: {
            type: BookType,
            args: { id: {type: GraphQLID} },
            // write the logic to fetch the data here
            resolve(parent, args) {
                const id = args.id;
                return books.find((book)=>{
                    return book.id == id
                })
            }
        }
    }
})

module.exports = new graphql.GraphQLSchema({
    query: RootQuery
})