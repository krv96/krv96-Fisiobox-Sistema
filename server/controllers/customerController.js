const Customer = require("../models/Customer");
const mongoose = require("mongoose");

/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {

    const messages = await req.consumeFlash('info');
    const locals = {
      title: 'Fisiobox Usuarios',
      description: 'Fisiobox Sistema Manejo de Usuarios'
    }

    let perPage = 12;
    let page = req.query.page || 1;

    try {
      // const customers = await Customer.aggregate([ { $sort: { createdAt: -1 } } ])
      //   .skip(perPage * page - perPage)
      //   .limit(perPage)
      //   .exec(); 
      const customers = await Customer.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: perPage * page - perPage },
        { $limit: perPage }
      ]).exec();
      const count = await Customer.count();

      res.render('index', {
        locals,
        customers,
        current: page,
        pages: Math.ceil(count / perPage),
        messages
      });

    } catch (error) {
      console.log(error);
    }
}

// exports.homepage = async (req, res) => {
//     const messages = await req.consumeFlash('info');
//     const locals = {
//       title: 'NodeJs',
//       description: 'Free NodeJs User Management System'
//     }

//     try {
//       const customers = await Customer.find({}).limit(22);
//       res.render('index', { locals, messages, customers } );
//     } catch (error) {
//       console.log(error);
//     }
// }

/**
 * GET /
 * About
 */

exports.pendings = async (req, res) => {

  const messages = await req.consumeFlash('info');
  const locals = {
    title: 'Fisiobox Usuarios',
    description: 'Fisiobox Sistema Manejo de Usuarios'
  }

  let perPage = 12;
  let page = req.query.page || 1;

  try {
    const customers = await Customer.aggregate([ { $sort: { createdAt: -1 } }, {$match: {overdue: true}} ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(); 
    const count = await Customer.count();

    res.render('pendings', {
      locals,
      customers,
      current: page,
      pages: Math.ceil(count / perPage),
      messages
    });

  } catch (error) {
    console.log(error);
  }
}


exports.payments = async (req, res) => {

  const messages = await req.consumeFlash('info');
  const locals = {
    title: 'Fisiobox Usuarios',
    description: 'Fisiobox Sistema Manejo de Usuarios'
  }

  let perPage = 12;
  let page = req.query.page || 1;

  try {
    const customers = await Customer.aggregate([ { $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(); 
    const count = await Customer.count();

    res.render('payments', {
      locals,
      customers,
      current: page,
      pages: Math.ceil(count / perPage),
      messages
    });

  } catch (error) {
    console.log(error);
  }
}






exports.about = async (req, res) => {
    const locals = {
      title: 'About',
      description: 'Free NodeJs User Management System'
    }

    try {
      res.render('about', locals );
    } catch (error) {
      console.log(error);
    }
}






/**
 * GET /
 * New Customer Form
 */
exports.addCustomer = async (req, res) => {
  const locals = {
    title: "Add New Customer - NodeJs",
    description: "Free NodeJs User Management System",
  };

  res.render("customer/add", locals);
};

/**
 * POST /
 * Create New Customer
 */
exports.postCustomer = async (req, res) => {
  console.log(req.body);

  const newCustomer = new Customer({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    details: req.body.details,
    cedula: req.body.cedula,
    birthday: req.body.birthday,
    height: req.body.height,
    weight: req.body.weight,
    bodyFat: req.body.bodyFat,
    muscleMass: req.body.muscleMass,
    overdue: false,
    payments: new Date(),
    tel: req.body.tel,
    email: req.body.email,
    registros: {height:req.body.height, weight: req.body.weight,bodyFat:req.body.bodyFat,muscleMass: req.body.muscleMass, updatedAt: new Date()}
  });

  try {
    await Customer.create(newCustomer);
    await req.flash("info", "New customer has been added.");

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};


/**
 * GET /
 * Customer Data 
*/
exports.view = async (req, res) => {

  try {
    const customer = await Customer.findOne({ _id: req.params.id })

    const locals = {
      title: "View Customer Data",
      description: "Free NodeJs User Management System",
    };

    res.render('customer/view', {
      locals,
      customer
    })

  } catch (error) {
    console.log(error);
  }

}


exports.viewhistorical = async (req, res) => {

  try {
    const customer = await Customer.findOne({ _id: req.params.id })
    console.log(customer)
    const locals = {
      title: "View Customer Data Historical",
      description: "Free NodeJs User Management System",
    };

    res.render('customer/view_historical', {
      locals,
      customer
    })

  } catch (error) {
    console.log(error);
  }

}

function isPaymentInCurrentMonthOrLater(paymentDate) {
  const currentDate = new Date();
  const date = new Date(paymentDate);
  const currentMonth = currentDate.getMonth();
  const paymentMonth = date.getMonth();
  const currentYear = currentDate.getFullYear(); // Use getFullYear() to get the year
  const paymentYear = date.getFullYear(); // Use getFullYear() to get the year
  return (paymentYear > currentYear || (paymentYear === currentYear && paymentMonth >= currentMonth));
}

function getFirstDayOfNextMonth(date) {
  const currentYear = date.getUTCFullYear();
  const currentMonth = date.getUTCMonth();

  // Calculate next month's year and month
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonth = (currentMonth + 1) % 12;

  // Create a new Date object for the first day of next month
  const firstDayOfNextMonth = new Date(Date.UTC(nextYear, nextMonth, 1, 0, 0, 0, 0));

  return firstDayOfNextMonth;
}

exports.registerPayment = async (req, res) => {

  try {
    const customer = await Customer.findOne({ _id: req.params.id })
const currentDate = new Date();
    const recentPayments = customer.payments.filter(isPaymentInCurrentMonthOrLater);
    console.log('all payments',customer.payments)


    const latestDate = new Date(Math.max(...customer.payments.map(dateString => new Date(dateString).getTime())));

    const firstDayOfNextMonth = getFirstDayOfNextMonth(latestDate);
    const formattedDate = firstDayOfNextMonth.toISOString().split('T')[0];
    const futureMonths = [];

    const locals = {
      title: "View Customer Data",
      description: "Free NodeJs User Management System",
    };

    while (latestDate < currentDate) {
      latestDate.setMonth(latestDate.getMonth() + 1); // Increment by 1 month
      futureMonths.push(new Date(latestDate));
    }

    res.render('customer/register_payment', {
      locals,
      customer,
      recentPayments,
      formattedDate,
      firstDayOfNextMonth
    })

  } catch (error) {
    console.log(error);
  }

}

/**
 * GET /
 * Edit Customer Data 
*/
exports.edit = async (req, res) => {

  try {
    const customer = await Customer.findOne({ _id: req.params.id })

    const locals = {
      title: "Edit Customer Data",
      description: "Free NodeJs User Management System",
    };

    res.render('customer/edit', {
      locals,
      customer
    })

  } catch (error) {
    console.log(error);
  }

}




/**
 * GET /
 * Update Customer Data 
*/
exports.editPost = async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id,{
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      details: req.body.details,
      cedula: req.body.cedula,
      birthday: req.body.birthday,
      height: req.body.height,
      weight: req.body.weight,
      bodyFat: req.body.bodyFat,
      muscleMass: req.body.muscleMass,
      tel: req.body.tel,
      email: req.body.email,
      updatedAt: Date.now(),

      $push:{'registros': {height:req.body.height, weight: req.body.weight,bodyFat:req.body.bodyFat,muscleMass: req.body.muscleMass, updatedAt: new Date()}}
       
    });
    await res.redirect(`/edit/${req.params.id}`);
    
    console.log('redirected');
  } catch (error) {
    console.log(error);
  }
}


exports.registerPaymentPost = async (req, res) => {
  try {
    console.log(req.body);
    await Customer.findByIdAndUpdate(req.params.id,{
      updatedAt: Date.now(),
      $push:{'payments': new Date(req.body.payment)}
       
    });
    await res.redirect(`/register_payment/${req.params.id}`);
    
    console.log('redirected');
  } catch (error) {
    console.log(error);
  }
}


/**
 * Delete /
 * Delete Customer Data 
*/
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.deleteOne({ _id: req.params.id });
    res.redirect("/")
  } catch (error) {
    console.log(error);
  }
}


/**
 * Get /
 * Search Customer Data 
*/
exports.searchCustomers = async (req, res) => {

  const locals = {
    title: "Search Customer Data",
    description: "Free NodeJs User Management System",
  };

  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const customers = await Customer.find({
      $or: [
        { firstName: { $regex: new RegExp(searchNoSpecialChar, "i") }},
        { lastName: { $regex: new RegExp(searchNoSpecialChar, "i") }},
      ]
    });

    res.render("search", {
      customers,
      locals
    })
    
  } catch (error) {
    console.log(error);
  }

}