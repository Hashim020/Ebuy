const User = require('../Model/userModel');
const Order = require('../Model/OrderModel');
const bcrypt = require('bcrypt');
const Product = require('../Model/ProductModel');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Coupon = require('../Model/CouponModel');


const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}
const Loadadminlogin = async (req, res) => {
    try {
        res.render("authentication-login")
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
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('authentication-login', { message: "No Admin Access" })
                } else {
                    req.session.admin_id = userData.name
                    res.redirect('/admin/home')
                }

            } else {
                res.render('authentication-login', { message: "Email and password is incorrect" })
            }

        } else {
            res.render('authentication-login', { message: "Email and password is incorrect" })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadDashboard = async (req, res) => {
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message);
    }
}

const adminlogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}


const loadusers = async (req, res) => {

    try {
        const user = await User.find();
        res.render("UserMgmt", { user });

    } catch (error) {
        console.log(error);
    }
}

const blockuser = async (req, res) => {
    try {
        const id = req.params.id
        await User.findByIdAndUpdate({ _id: id }, { $set: { status: true } })

        res.redirect("/admin/Usermanagement")
    } catch (error) {
        console.log(error);
    }
};


const unblockuser = async (req, res) => {
    try {


        const id = req.params.id
        await User.findByIdAndUpdate({ _id: id }, { $set: { status: false } })
        res.redirect("/admin/Usermanagement")
    } catch (error) {
        console.log(error);
    }
};



const loadOrdermanagement = async (req, res) => {
    try {
        const Orders = await Order.find().populate('user'); // Use populate to retrieve user data
        console.log(Orders)
        res.render('ordermanagement', { Orders });
    } catch (error) {
        console.log(error);
    }
}

const moredetailedorder = async (req, res) => {
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId)
            .populate('user')
            .populate("items.productId")
            .populate('address');
        console.log(order);
        res.render('Detailedvieworder', { order })
    } catch (error) {
        console.log(error);
    }
}


const updateOrderStatusByAdmin = async (req, res) => {
    try {
        const { status, orderId } = req.body;

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            { status: status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
}



const GetCouponManagement = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.render('Coupon-Management', { coupons })
    } catch (error) {
        console.log(error);
    }
}


const postCoupon = async (req, res) => {
    try {
        const { code, discount, status, dateOfStart, expirationDate, minimumPurchase, maximumPurchase } = req.body;
        const coupons = await Coupon.find({ code: code });

        if (coupons.length > 0) {
            return res.json({ duplicate: false })
        }
        const newCoupon = new Coupon({
            code,
            discount,
            status,
            dateOfStart,
            expirationDate,
            minimumPurchase,
            maximumPurchase
        });

        await newCoupon.save(); // Save the new coupon to the database

        res.json({ success: true, message: 'Coupon saved successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while saving the coupon.' });
    }
};

const getSalesreport = async (req, res) => {
    try {
        const monthlySales = await Order.aggregate([
            {
                $match: {
                    status: 'Shipped'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: "$createdAt"
                        }
                    },
                    totalSales: { $sum: "$total" }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        const month = monthlySales.map(monthlySale => monthlySale._id.substring(5, 7));
        const totalSales = monthlySales.map(monthlySale => monthlySale.totalSales);
        const orders = await Order.find({status:'Shipped'}); // Wait for the query to complete
        res.render('Sales-Report', { orders,month,totalSales, });
    } catch (error) {
        console.log(error);
    }
}












module.exports = {
    loadusers,
    Loadadminlogin,
    verifyLogin,
    loadDashboard,
    blockuser,
    unblockuser,
    adminlogout,
    loadOrdermanagement,
    moredetailedorder,
    updateOrderStatusByAdmin,
    GetCouponManagement,
    postCoupon,
    getSalesreport
}