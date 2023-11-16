require('dotenv').config();
const User = require('../Model/userModel')
const Category = require('../Model/CatogoryModel');
const Address = require('../Model/AddressModel');
const Cart = require('../Model/CartModel');
const Order = require('../Model/OrderModel');
const Product = require('../Model/ProductModel');
const Coupon = require('../Model/CouponModel');
const Wallet = require('../Model/WalletModel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const userHelper = require('../Helper/userHelper');
const { v4: uuidv4 } = require('uuid');




const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const verifySid = process.env.verifySid;
const client = require("twilio")(accountSid, authToken);


const securePassword = async (password) => {
  try {

    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  } catch (error) {
    console.log(error.message);
  }
}

const loadHome = async (req, res) => {
  try {
    if (req.session) {
      var userId = req.session.user_id
      var cart = await Cart.findOne({ user: userId });
      var user1 = await User.findById(userId);
    }
    const categories = await Category.find().sort({ name: 1 });
    let totalQuantity = 0;
    if (cart) {
      totalQuantity = cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    }

    // Step 1: Find the total quantity of each product bought
    const productQuantities = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" }
        }
      }
    ]);

    // Step 2: Sort products based on quantity
    productQuantities.sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Step 3: Get the top 10 products
    const topProductIds = productQuantities.slice(0, 10).map(item => item._id);
    const topProducts = await Product.find({ _id: { $in: topProductIds } });

    // Step 4: Find new products based on createdAt date
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); // Assuming you want to find products added in the last 7 days

    let newProducts = await Product.find({
      createdAt: { $gte: sevenDaysAgo, $lte: today },
      is_Listed: true
    }).limit(10).populate('category');
    
    if (newProducts.length === 0) {
      const fallbackProducts = await Product.find({})
        .limit(10)
        .sort({ createdAt: -1 })
        .populate('category');
    
      newProducts = fallbackProducts;
    }
    var message = '';
    if (req.query.message) {
      message = req.query.message;
    }
    res.render("main", { categories, user1, totalQuantity, topProducts, productQuantities, newProducts, message });
  } catch (error) {
    console.log(error.message);
  }
}




const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/')
  } catch (error) {
    console.log(error.message);
  }

}

const loadregister = async (req, res) => {
  try {
    res.render('Register');
  } catch (error) {
    console.log(error.message);
  }
}

const validation = async (req, res) => {
  // console.log(req.body);


  const mobile = req.body.mobileNumber
  const email = req.body.email;
  const existingUser = await User.findOne({ email: email })
  const existingnumber = await User.findOne({ mobile: mobile })
  if (existingUser) {
    return res.render("Register", { message: "Email already exists" })
  }
  if (existingnumber) {
    return res.render("Register", { phone: "Phone Number Already Exist" })
  }
  let success = false;
  let retries = 10;
  while (!success && retries > 0) {
    const verification = await client.verify.v2.services(verifySid)
      .verifications.create({ to: `+91${mobile}`, channel: "sms", })
      .then((verification) => {
        console.log(verification.status)
        req.session.user = req.body;
        res.render('verifyOtp', { mobile })
        success = true;
      })
      .catch((error) => {
        console.log(error.message)
        retries--;
      })
  }
}

// ===================================Referal code Genarator=======================================================
function generateReferralCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
}

// ======================================================================================================
const insertUser = async (req, res) => {
  const { otp } = req.body;

  try {
    const userDatas = req.session.user;

    if (!userDatas) {
      res.render('verifyOtp', { message: "User data not found" });
    } else {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: `+91${userDatas.mobileNumber}`, code: otp, validityPeriod: 1000 })
        .then(async (verification_check) => {
          console.log(verification_check.status);
          if (verification_check.status === "approved") {
            const spasswords = await securePassword(userDatas.password);
            const referralCode = generateReferralCode(10);
            const user = new User({
              name: userDatas.name,
              email: userDatas.email,
              mobile: userDatas.mobileNumber,
              password: spasswords,
              referralCode: referralCode,
              is_admin: 0
            });
            try {
              const userDataSave = await user.save();
              if (userDataSave) {
                if (userDatas.referralCode) {
                  const code = userDatas.referralCode;
                  const ReferalUsinguser = await User.findOne({ referralCode: userDataSave.referralCode });
                  const Refereduser = await User.findOne({ referralCode: code });
                  console.log(ReferalUsinguser, Refereduser)
                  const wallet2 = await Wallet.findOne({ user: Refereduser._id });

                  const newWallet1 = new Wallet({ user: ReferalUsinguser._id, balance: 100 });
                  newWallet1.transactions.push({
                    orderId: null, // Add the relevant orderId if applicable
                    TransactioName: 'Referral Bonus',
                    Amount: 100, // Adjust this value as needed
                    transactionstype: 'Credit',
                    transactionsDate: new Date()
                  });
                  await newWallet1.save()

                  if (wallet2) {
                    wallet2.balance += 100;
                    wallet2.transactions.push({
                      orderId: null, // Add the relevant orderId if applicable
                      TransactioName: 'Referral Bonus',
                      Amount: 100, // Adjust this value as needed
                      transactionstype: 'Credit',
                      transactionsDate: new Date()
                    });

                    await wallet2.save(); // Corrected this line, removed Promise.all
                  } else {
                    const newWallet2 = new Wallet({ user: Refereduser._id, balance: 100 });
                    newWallet2.transactions.push({
                      orderId: null, // Add the relevant orderId if applicable
                      TransactioName: 'Referral Bonus',
                      Amount: 100, // Adjust this value as needed
                      transactionstype: 'Credit',
                      transactionsDate: new Date()
                    });

                    await Promise.all([newWallet1.save(), newWallet2.save()]);
                  }
                }
                const message = "Sucessfully Registered now You login";
                const encodedMessage = encodeURIComponent(message);
                res.redirect(`/?message=${encodedMessage}`);
              } else {
                res.render('Register', { message: "Registration Failed" });
              }
            } catch (error) {
              console.log(error.message);
              res.render('Register', { message: "Registration Failed" });
            }
          } else {
            res.render('verifyOtp', { otp: "Invalid OTP", mobile: userDatas.mobileNumber, });
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  } catch (error) {
    console.log(error.message);
  }
};






const loadlogin = async (req, res) => {
  try {
    if (req.session.user_id) {
      res.redirect('/')
    } else
      res.render('Login')
  } catch (error) {
    console.log(error);
  }
}





const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password

    const userData = await User.findOne({ email: email })
    if (userData) {
      if (userData.status === false) {
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if (passwordMatch) {
          console.log(passwordMatch);// checking password match or not
          req.session.user_id = userData._id
          // console.log(req.session.user_id);
          const message = "Sucessfully LogedIn";
                const encodedMessage = encodeURIComponent(message);
          res.redirect(`/?message=${encodedMessage}`)

        } else {
          res.render('Login', { message: "Email and Passwords are Incorrect" });
        }
      } else {
        res.render("Login", { message: "Your are blocked" })
      }
    } else {
      res.render('Login', { message: "Email and Password are Incorrect" });
    }

  } catch (error) {
    console.log(error.message);
  }
}




const ProfileLoad = async (req, res) => {
  try {

    const _id = req.session.user_id;
    const userData = await User.findOne({ _id: _id })
    // console.log(userData);
    if (userData) {
      res.render('userProfile', { userData })
    } else {
      res.redirect('login')
    }
  } catch (error) {
    console.log(error);
  }
}







const profileEdit = async (req, res) => {
  try {
    // Assuming you have user authentication and a session
    const userId = req.session.user_id;

    // Retrieve the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user data based on the request body
    user.name = req.body.name || user.name; // If field is not provided, keep the existing value
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;

    // Save the updated user data to the database
    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};






const profilePWchange = async (req, res) => {
  try {
    const id = req.session.user_id;
    const OldPassword = req.body.oldPassword;
    const newpassword = req.body.newPassword;
    const userData = await User.findOne({ _id: id });

    //comparing the old password
    const passwordMatch = await bcrypt.compare(OldPassword, userData.password);
    if (passwordMatch) {
      // Encrypt the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newpassword, salt);

      userData.password = hashedPassword;

      // Save the updated user data to the database
      await userData.save();

      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Old Password Does Not Match'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}


// =======================================================================================================================================

/*********************************************
 *           USER ORDER - RELATED            *
 *********************************************
 * This section of the code handles user    *
 * orders and related functionalities.       *
 *                                           *
 * Functions in this section:                *
 *  - fetchUserOrders()                      *
 *  - createOrder()                          *
 *  - cancelOrder()                          *
 *  - ... (other order-related functions)     *
 *********************************************/




const loadcheckout = async (req, res) => {
  try {
    const id = req.session.user_id
    const user = req.session.user_id
    const categories = await Category.find()
    const address = await Address.find({ userId: id });
    var user1 = await User.findById(user);
    let cartTotal = 0;

    const total = await Cart.findOne({ user: user });
    if (total) {
      cartTotal = total.cartTotal;
    }
    const cart = await Cart.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(user) }
      },

      {
        $unwind: "$cartItems"
      },
      {
        $project: {
          item: { $toObjectId: ("$cartItems.productId") },
          quantity: "$cartItems.quantity",
          total: "$cartItems.total"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "carted"
        }
      },
      {
        $project: {
          item: 1,
          quantity: 1,
          total: 1,
          carted: { $arrayElemAt: ["$carted", 0] }
        }
      }
    ]);
    if (req.session) {
      var userId = req.session.user_id
      var cart1 = await Cart.findOne({ user: userId });
    }
    let totalQuantity = 0;
    if (cart1) {
      cart1.cartItems.map(item => totalQuantity += item.quantity);
    }
    const coupons = await Coupon.find({
      minimumPurchase: { $lte: cart1.cartTotal }, // Find coupons where minimumPurchase is greater than or equal to cartTotal
      status: 'Active', // Optionally, include a condition for active coupons
    })
    coupons.sort((a, b) => new Date(b.expirationDate) - new Date(a.expirationDate));
    const wallet = await Wallet.findOne({ user: id });
    res.render('checkout', { wallet, categories, address, cart, cartTotal, totalQuantity, user, coupons, cart1, user1 })
  } catch (error) {

    console.log(error);
  }
}


const Applycoupen = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const CART = await Cart.findOne({ user: userId });
    const couponCode = req.body.couponCode;

    if (couponCode) {
      const code = await Coupon.findOne({ code: couponCode });

      if (code) {
        if (code.status == 'Active') {
          // Check if coupon is already used by the user
          const user = await User.findById(userId);
          const usedCoupons = user.usedCoupons.map(coupon => coupon.code);

          if (usedCoupons.includes(couponCode)) {
            return res.json({ used: false, message: 'Coupon already used' });
          }

          // Check if cart total meets minimum purchase requirement
          if (CART.cartTotal < code.minimumPurchase) {
            return res.json({ minimumPrice: false, message: 'Minimum purchase requirement not met' });
          }

          // Check if cart total exceeds maximum purchase limit
          if (code.maximumPurchase && CART.cartTotal > code.maximumPurchase) {
            return res.json({ maximumPrice: false, message: 'Cart total exceeds maximum purchase limit' });
          }

          if (CART.discountCoupon) {
            return res.json({ usedfororder: false, message: 'Cart total exceeds maximum purchase limit' });
          }
          // Calculate discount value
          const discountPercentage = code.discount;
          const discountValue = (discountPercentage / 100) * CART.cartTotal;

          // Update CART document
          await Cart.updateOne(
            { user: userId },
            {
              $inc: { cartTotal: -discountValue },
              $set: { discountAmount: discountValue, discountCoupon: couponCode }
            }
          );

          // Update user's usedCoupons array
          await User.updateOne(
            { _id: userId },
            { $push: { usedCoupons: { code: couponCode } } }
          );

          return res.json({ success: true, discountValue });
        } else if (code.status == 'Inactive') {
          return res.json({ validity: false });
        } else {
          // Handle other status if needed
        }
      } else {
        return res.json({ success: false });
      }
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};










const orderplace = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.body.addressId;
    let paymentMethod = req.body.paymentMethod;

    // Map payment method to user-friendly names
    if (paymentMethod === 'payment-2') {
      paymentMethod = 'Cash On Delivery';
    } else if (paymentMethod === 'payment-1') {
      paymentMethod = 'Online Payment';
    } else if (paymentMethod === 'payment-3') {
      paymentMethod = 'Wallet';
    }

    // Find the user's cart
    const userCart = await Cart.findOne({ user: userId });

    if (!userCart || !userCart.cartItems.length) {
      throw new Error('User cart is empty or not found');
    }

    // Find the selected address
    const orderAddress = await Address.findById(addressId);

    // Create an array of promises to fetch product details and update stock
    const productPromises = userCart.cartItems.map(async (item) => {
      const product = await Product.findById(item.productId);

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product with ID ${item.productId}`);
      }

      // Calculate the total and update stock
      const total = item.quantity * product.offerprice;
      product.stock -= item.quantity;
      await product.save();

      return {
        productId: item.productId,
        quantity: item.quantity,
        total: total,
      };
    });

    // Use Promise.all() to wait for all product details and stock updates
    const items = await Promise.all(productPromises);

    // Calculate the subTotal
    const subTotal = items.reduce((total, item) => total + item.total, 0);

    const generateOrderID = () => {
      return uuidv4(); // Generates a unique UUID
    };
    const orderID = 'ORD' + generateOrderID();

    // Get discountAmount and discountCoupon from Cart
    const discountAmount = userCart.discountAmount;
    const discountCoupon = userCart.discountCoupon;

    // Create the order document
    const newOrder = new Order({
      OrderId: orderID,
      user: userId,
      address: addressId,
      items: items,
      total: userCart.cartTotal, // Use cart total as order total
      subTotal: subTotal,
      paymentMethod: paymentMethod,
      discountAmount: discountAmount,
      discountCoupon: discountCoupon
    });

    // Save the order to the database
    await newOrder.save();

    // Clear the user's cart
    if (userCart) {
      await Cart.deleteOne({ user: userId });
    }

    // Handle payment method
    if (paymentMethod === 'Cash On Delivery') {
      return res.json({ success: true, total: userCart.cartTotal });
    } else if (paymentMethod === 'Online Payment') {
      const orderId = newOrder._id;
      const response = await userHelper.generateRazorpay(orderId, userCart.cartTotal);
      const response1String = JSON.stringify(response); // Convert the response to a JSON string
      return res.json({ response: response1String, onlinepayment: true, total: userCart.cartTotal });
    } else if (paymentMethod === 'Wallet') {
      const orderId = newOrder._id;
      const UserId = req.session.user_id;
      const response = await Walletpayment(orderId, UserId);
      console.log(response);
      return res.json({ response });
    }
  } catch (error) {
    console.error(error.message);
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' }); // Return an error response
  }
};



async function Walletpayment(orderId, userId) {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 10000,
        transactions: []
      });
    }
    // Check if there's enough balance in the wallet
    if (wallet.balance < order.total) {
      throw new Error('Insufficient balance in the wallet');
    }

    // Perform the update atomically
    const updatedWallet = await Wallet.findOneAndUpdate(
      { user: userId },
      {
        $inc: { balance: -order.total }, // Decrease the balance
        $push: {
          transactions: {
            orderId: orderId,
            Amount: order.total,
            transactionstype: 'Debit',
            transactionsDate: new Date(),
          }
        }
      },
      { new: true } // Return the updated wallet
    );

    await Order.updateOne(
      { _id: orderId }, // Use _id if you have the specific order ID
      { $set: { paymentStatus: 'Paid' } }
    );

    if (!updatedWallet) {
      throw new Error('Failed to update wallet');
    }

    return { WalletPayment: true, message: 'Payment successful' };
  } catch (error) {
    await Order.updateOne(
      { _id: orderId },
      { $set: { paymentStatus: 'Payment Failed' } }
    );
    return { success: false, message: error.message };
  }
}






// const orderplace = async (req, res) => {
//   try {
//     const userId = req.session.user_id;
//     const addressId = req.body.addressId;
//     let paymentMethod = req.body.paymentMethod;

//     // Map payment method to user-friendly names
//     if (paymentMethod === 'payment-2') {
//       paymentMethod = 'Cash On Delivery';
//     } else if (paymentMethod === 'payment-1') {
//       paymentMethod = 'Online Payment';
//     } else if (paymentMethod === 'payment-3') {
//       paymentMethod = 'Wallet';
//     }

//     // Find the user's cart
//     const userCart = await Cart.findOne({ user: userId });

//     if (!userCart || !userCart.cartItems.length) {
//       throw new Error('User cart is empty or not found');
//     }

//     // Find the selected address
//     const orderAddress = await Address.findById(addressId);

//     // Create an array of promises to fetch product details and update stock
//     const productPromises = userCart.cartItems.map(async (item) => {
//       const product = await Product.findById(item.productId);

//       if (!product) {
//         throw new Error(`Product with ID ${item.productId} not found`);
//       }

//       if (product.stock < item.quantity) {
//         throw new Error(`Insufficient stock for product with ID ${item.productId}`);
//       }

//       // Calculate the total and update stock
//       const total = item.quantity * product.offerprice;
//       product.stock -= item.quantity;
//       await product.save();

//       return {
//         productId: item.productId,
//         quantity: item.quantity,
//         total: total,
//       };
//     });

//     // Use Promise.all() to wait for all product details and stock updates
//     const items = await Promise.all(productPromises);

//     // Calculate the subTotal and total
//     const subTotal = items.reduce((total, item) => total + item.total, 0);
//     const total = subTotal; // You can add shipping costs or taxes if needed

//     const generateOrderID = () => {
//       return uuidv4(); // Generates a unique UUID
//     };
//     const orderID = 'ORD' + generateOrderID();
//     // Create the order document
//     const newOrder = new Order({
//       OrderId: orderID,
//       user: userId,
//       address: addressId,
//       items: items,
//       total: total,
//       subTotal: subTotal,
//       paymentMethod: paymentMethod,
//     });

//     // Save the order to the database
//     await newOrder.save();

//     // Clear the user's cart
//     if (userCart) {
//       await Cart.deleteOne({ user: userId });
//     }

//     // Handle payment method
//     if (paymentMethod === 'Cash On Delivery') {
//       return res.json({ success: true });
//     } else if (paymentMethod === 'Online Payment') {
//       const orderId = newOrder._id;
//       const response = await userHelper.generateRazorpay(orderId, total);
//       const response1String = JSON.stringify(response); // Convert the response to a JSON string
//       return res.json({ response: response1String, onlinepayment: true });
//     } else if (paymentMethod === 'Wallet') {

//     }
//   } catch (error) {
//     console.error(error.message);
//     console.log(error);
//     return res.status(500).json({ error: 'Internal Server Error' }); // Return an error response
//   }
// };





const thankyouorderplaced = async (req, res) => {
  try {
    if (req.session) {
      var userId = req.session.user_id;
      var user1 = await User.findById(userId);
      var cart1 = await Cart.findOne({ user: userId });
      var user = req.session.user_id
    }
    let totalQuantity = 0;
    if (cart1) {
      cart1.cartItems.map(item => totalQuantity += item.quantity);
    }
    res.render('thankyou', { totalQuantity, user, user1 });
  } catch (error) {
    console.log(error);
  }
}


const loadorderhistory = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const orders = await Order.find({ user: userId }).populate('address');

    const ordersWithProductDetails = await Promise.all(orders.map(async (order) => {
      const populatedItems = await Promise.all(order.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          ...item.toObject(),
          productDetails: product ? product.toObject() : null,
        };
      }));

      return {
        ...order.toObject(),
        items: populatedItems,
      };
    }));
    ordersWithProductDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.render('orderhistory', { userData, orders: ordersWithProductDetails });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.order_id;

    // Update Order Status
    await Order.findByIdAndUpdate(orderId, { status: 'Return-Req' });

    // Retrieve Order Details
    const order = await Order.findById(orderId);

    const items = order.items;
    // Increase Product Stock
    items.forEach(async (item) => {
      const product = await Product.findById(item.productId);
      product.stock += item.quantity; // Assuming there's a 'stock' property in the Product schema
      await product.save();
    });  // Check if payment status is 'Paid'
    if (order.paymentStatus === 'Paid') {
      // Find associated wallet for the user
      const wallet = await Wallet.findOne({ user: order.user });

      if (wallet) {
        // Increase the balance of the wallet by the total amount of the canceled order
        wallet.balance += order.total;

        // Add a transaction to the wallet
        const transaction = {
          orderId: orderId,
          Amount: order.total,
          transactionstype: 'Credit',
          transactionsDate: new Date()
        };

        wallet.transactions.push(transaction);

        await wallet.save();
      }else {
        const user_id=req.session.user_id
        const newWallet = new Wallet({
            user: user_id,
            balance: order.total, // Assuming this is the initial balance
            transactions: [{
                orderId: orderId,
                Amount: order.total,
                transactionstype: 'Credit',
                transactionsDate: new Date()
            }]
        });
    
        await newWallet.save();
    }
    }

    // Update Order Status
    await Order.findByIdAndUpdate(orderId, { status: 'Return Accepted' });

    res.redirect('http://localhost:3000/Order-histoty'); // Redirect to order history page after cancelling
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}



const OrderMoreDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const orders = await Order.find({ _id: orderId }).populate('address');

    const ordersWithProductDetails = await Promise.all(orders.map(async (order) => {
      const populatedItems = await Promise.all(order.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          ...item.toObject(),
          productDetails: product ? product.toObject() : null,
        };
      }));

      return {
        ...order.toObject(),
        items: populatedItems,
      };
    }));
    res.render('moredetailsorder', { userData, orders: ordersWithProductDetails });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const getMywallet = async (req, res) => {
  try {
    const userId = req.session.user_id; // Assuming you have user sessions set up
    const wallet = await Wallet.findOne({ user: userId }).populate({
      path: 'transactions',
      populate: {
        path: 'orderId',
        model: 'Order'
      }
    });

    if (!wallet) {
      // If wallet is not found, you can handle it here
      res.render('My-Wallet', { wallet });
      return;
    }

    wallet.transactions.sort((a, b) => new Date(b.transactionsDate) - new Date(a.transactionsDate));
    res.render('My-Wallet', { wallet });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
}





const updateCouponStatus = async () => {
  try {
    const currentDate = new Date();

    // Find all active coupons that have expired
    const expiredCoupons = await Coupon.find({
      status: 'Active',
      expirationDate: { $lt: currentDate }
    });

    // Update the status of expired coupons to 'Inactive'
    const updatePromises = expiredCoupons.map(coupon => {
      coupon.status = 'Inactive';
      return coupon.save();
    });

    // Execute all update operations
    await Promise.all(updatePromises);

    console.log(`${expiredCoupons.length} coupons have been updated.`);
  } catch (error) {
    console.error('Error updating coupons:', error);
  }
}












module.exports = {
  loadlogin,
  loadHome,
  loadregister,
  insertUser,
  verifyLogin,
  userLogout,
  validation,
  ProfileLoad,
  profileEdit,
  profilePWchange,
  //..................
  loadcheckout,
  Applycoupen,
  orderplace,
  thankyouorderplaced,
  loadorderhistory,
  cancelOrder,
  OrderMoreDetails,
  getMywallet,
  updateCouponStatus,
}