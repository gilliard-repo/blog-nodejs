const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Routes
// Home
router.get('/', async (req, res) => {

    const locals = {
        title : "NodeJs Blog",
        description : "Simple Blog created with NodeJs, Express & MongoDb"
    }

    try {
        
        let perPage = 9; // Registros por página
        let page = req.query.page || 1; // Numero da pagina coletada na URL pela palavra chave ( page )
                                // Adiciona o $sort, que tem por objetivo organizar decrescente -1
        const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
        .skip(perPage * page - perPage) // Pula os primeiros documentos, os primeiros 6, 12, etc...
        .limit(perPage) // Limita quantos documentos são exibidos por vez
        .exec(); // Executa a query e retorna uma promisse

        const count = await Post.countDocuments(); // Documentos no Banco
        const nextPage = parseInt(page) + 1; // Numero da próxima página
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
                        // Se a quantidade de registro por pagina
                        // dividido pela quantidade de registros
                        // armazenados no banco de dados, resultar
                        // em 1, é porque todos os registros
                        // ja forram exibidos na tela, mas
                        // se for maior que 1, então falta registros
                        // a serem msotrados.
                        // 2 <= ( 10 / 10 ) = 1

        // console.log({
        //     "page" : page,
        //     "count" : count,
        //     "nextPage" : nextPage,
        //     "hasNextPage" : hasNextPage,
        //     "data" : data
        // })

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
        
    } catch (error) {
        console.log(error);
    }

});

// Post + ID
router.get('/post/:id', async (req, res) => {
    try {

        let slug = req.params.id;

        const data = await Post.findById({ _id : slug });

        const locals = {
            title : data.title,
            description : data.body,
            currentRoute : `/post/${slug}`
        }

        res.render('post', { locals, data });

    } catch (error) {
        console.log(error);
    }

});

// Post searchTerms
router.post('/search', async (req, res) => {
    try {

        const locals = {
            title : "Search",
            description : "description"
        }

        let searchTerm = req.body.searchTerm;
        let searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        })

        res.render('search', {
            data,
            locals
        });

    } catch (error) {
        console.log(error);
    }

});

// About
router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute: '/about'
    });
});

module.exports = router;