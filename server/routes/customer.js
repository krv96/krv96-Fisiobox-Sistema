const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

/**
 *  Customer Routes 
*/
router.get('/', customerController.homepage);
router.get('/pendings', customerController.pendings);
router.get('/payments', customerController.payments);
router.get('/register_payment/:id', customerController.registerPayment);
router.put('/register_payment/:id', customerController.registerPaymentPost);
router.get('/about', customerController.about);
router.get('/add', customerController.addCustomer);
router.post('/add', customerController.postCustomer);
router.get('/view/:id', customerController.view);
router.get('/view_historical/:id', customerController.viewhistorical);
router.get('/edit/:id', customerController.edit);
router.put('/edit/:id', customerController.editPost);
router.delete('/edit/:id', customerController.deleteCustomer);

router.post('/search', customerController.searchCustomers);



module.exports = router;