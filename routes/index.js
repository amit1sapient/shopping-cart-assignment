const express = require('express');
const router = express.Router();
const banners = require('../helpers/db/banners/index.get.json');
const prodCategories = require('../helpers/db/categories/index.get.json');
const loginData = require('../helpers/db/label/login.get.json');
const registerData = require('../helpers/db/label/register.get.json');


const products = require('../helpers/db/products/index.get.json');
const cart = {
    items: [],
    count: 0,
    totalPrice: 0
}
/* GET home page. */
router.get('/', function (req, res, next) {
    ActiveBanners = banners.filter(banner => banner.isActive);
    ActiveCategories = prodCategories.filter(category => category.enabled);
    res.render('index', {
        banners: ActiveBanners,
        categories: ActiveCategories,
        cart
    });
});

router.get('/product', function (req, res, next) {
    ActiveCategories = prodCategories.filter(category => category.enabled);
    res.render('product', {
        productList: products,
        categories: ActiveCategories,
        cart
    });
});

router.get('/product/:id', function (req, res, next) {
    var catId = req.params.id;
    ActiveCategories = prodCategories.filter(category => category.enabled);
    productListDetail = products.filter(prod => prod.category === catId);
    res.render('product', {
        productList: productListDetail,
        categories: ActiveCategories,
        cart
    });
});

router.get('/login', function (req, res, next) {
    res.render('login.hbs', {
        cart, loginData
    });
});

router.get('/register', function (req, res, next) {
    res.render('register.hbs', {
        cart, registerData
    });
});

router.get('/cart', function (req, res, next) {
    res.render('cart.hbs', {
        cart
    });
});



// cart operations 
router.post('/cart/:operation', function (req, res) {
    const operation = req.params.operation;
    console.log('Hello')
    let count = 0;
    if (operation === 'add') {
        count = 1;
    } else if (operation === 'remove') {
        count = -1;
    } else {
        return res.status(404).send('Not Found');
    }
    const product = products.find(val => val.id === req.body.productId);
    if (product) {
        const oldItem = cart.items.find(item => item.product.id === product.id);
        if (oldItem) {
            oldItem.count += count;
            cart.totalPrice -= oldItem.totalPrice;
            oldItem.totalPrice = oldItem.product.price * oldItem.count
            cart.count += count;
            cart.totalPrice += oldItem.totalPrice;
            if (oldItem.count <= 0) {
                cart.items.splice(cart.items.findIndex(item => item.product.id === product.id), 1);
            }
        } else {
            let itemPrice = product.price;
            cart.items.push({
                product,
                count,
                totalPrice: itemPrice
            });
            cart.count += count;
            cart.totalPrice += itemPrice;
        }
        return res.send(cart);
    }
    return res.status(404).send('Not Found');
});



module.exports = router;