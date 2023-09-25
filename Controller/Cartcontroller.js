const cartHelper=require('../Helper/cartHelper');
const Cart=require('../Model/CartModel');
const mongoose = require('mongoose');
module.exports={

     
    addToCart : async (req, res) => {
        try {
            cartHelper.addCart(req.params.id, req.session.user_id)
                .then((response) => {
                    res.send(response)
                })
                
        } catch (error) {
            console.log(error.message);
        }
    },


    loadcart : async (req, res) => {
        try {
            if(req.session.user_id){
                
          const user =req.session.user_id ;
    
          const count = await cartHelper.getCartCount(user);
        
          let cartTotal = 0;
      
          const total = await Cart.findOne({user:user});
        
          if (total) {
            cartTotal = total.cartTotal;
      
            const cart = await Cart.aggregate([
              {
                $match: {user: new mongoose.Types.ObjectId(user)}
              },
              
              { 
                $unwind: "$cartItems"
              },
              {
                $project:{
                  item:{$toObjectId:("$cartItems.productId")},
                  quantity:"$cartItems.quantity",
                  total:"$cartItems.total"
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
            if(req.session){
              var userId=req.session.user_id
              var cart1=await Cart.findOne({user:userId});
            }
            var totalQuantity = 0;
            if(cart1){
              cart1.cartItems.map(item => totalQuantity += item.quantity);
            }
            res.render("cart", { cart, user, count, cartTotal,cart1,totalQuantity });
          } else {
            res.render("cart", { user, count, cartTotal, cart: [],totalQuantity });
          }
            }else{
                res.redirect('/login')
            }
          
        } catch (error) {
          console.log(error); 
          res.redirect({ success: false, error: error.message });
        }
      },



       editQuantity : (req, res) => {

        const userId = req.session.user_id;
      
        cartHelper.updateQuantity(req.body).then(async (response) => {
          res.json(response);
        });
      },

       deleteProduct : (req, res) => {
  
        cartHelper.deleteProduct(req.body).then((response) => {
          res.send(response);
        });
      }
    


      
}