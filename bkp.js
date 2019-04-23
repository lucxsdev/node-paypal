const router = require('express').Router();
const paypal = require('paypal-rest-sdk');
const paypalConfig = require('../config/paypal');

paypal.configure(paypalConfig);

const {products} = require('../config/products');

router.get('/', (req, res) => res.render('index', { products }));

router.post('/buy', (req, res) => {
 
    const productId = req.query.id; // recupera o ?id=  da url
    console.log(productId)
    const product = products.reduce((all, item)=> item.id.toString() === productId ? item : all, {});


    if(!product.id) return res.render('index', { products });

    const carrinho = [{
        "name": product.titulo,
        "sku": product.id,
        "price": product.preco.toFixed(2),
        "currency": "BRL",
        "quantity": 1
    }];

    const valor = {"currency": "BRL", "total": product.preco.toFixed(2)};
    const descricao = product.descricao;

    // json que será enviado para o paypal valida o pagamento

    const json_pagamento = {
        "intent": "sale",
        "payer": { "payment_method": "paypal"},
        "redirect_urls": {
            "return_url": "http://localhost:3333/success",
            "cancel_url": "http://localhost:3333/cancel"
        },
        "transactions": [{
            "item_list": {"items": carrinho },
            "amount": valor,
            "descripton": descricao
        }]
    };

 

    paypal.payment.create(json_pagamento, (err, pagamento)=>{
        if(err){
            console.warn(err)
        }
        else{
            pagamento.links.forEach((link) => {
                if(link.rel === 'approval_url') return res.redirect(link.href);
            }) 
        }
    })
    
});

router.get('/success', (req, res) => {
    // quando o cliente pagar com sucesso
    res.render('success')
});

router.get('/cancel', (req, res) => {
    // quando o cliente clicar em cancel
    res.render('cancel') //renderizando o arquivo cancel.ejs
});




var a = 'Luke Skywalker'
async function main(){
    try{
        const resultado = await services.obterPessoas(a)
        const names = []

        for(let i=0; i <= resultado.results.length -1; i++){
            const pessoas = resultado.results[i]
    
            names.push(pessoas.mass)
        console.log('Names', names)
        


        }
    }
    catch (error){
        console.error('Erro interno', error)
    }
   
}

module.exports = router;



/*

   var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://return.url",
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": valor,
            "description": descricao
        }]
    };

*/