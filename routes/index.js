const router = require('express').Router();
const paypal = require('paypal-rest-sdk');
const paypalConfig = require('../config/paypal');

paypal.configure(paypalConfig);

const {products} = require('../config/products');

let valor = {}; // transformando o valor em uma variavel global

router.get('/', (req, res) => res.render('index', { products }));

router.post('/buy', (req, res) => {
 
    const productId = req.query.id; // recupera o ?id=  da url
    console.log(productId)
    const product = products.reduce((all, item)=> item.id.toString() === productId ? item : all, {});


    if(!product.id) return res.render('index', { products });

    valor = {"currency": "BRL", "total": product.preco.toFixed(2)};

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3333/success",
            "cancel_url": "http://localhost:3333/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": product.titulo,
                    "sku": product.id,
                    "price": product.preco.toFixed(2),
                    "currency": "BRL",
                    "quantity": 1
                }]
            },
            "amount": valor,
            "description": product.descricao
        }]
    };

 

    paypal.payment.create(create_payment_json, (err, pagamento)=>{
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

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": valor
        }]
    } 

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) =>{
        if (error){
            console.warn(error.response)
            // throw error; // jogando erro no sistema
        } else{
            console.log("Pagamento efetuado com sucesso!");
            console.log(JSON.stringify(payment));

            res.render('success');
        }
    });
});

router.get('/cancel', (req, res) => {
    // quando o cliente clicar em cancel
    res.render('cancel') //renderizando o arquivo cancel.ejs
});

module.exports = router;


