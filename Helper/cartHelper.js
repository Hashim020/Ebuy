const Product= require('../Model/ProductModel');
const Cart=require('../Model/CartModel');
const Category =require('../Model/CatogoryModel')
const User =require('../Model/userModel');
const {ObjectId} = require('mongodb')



const addCart = async (productId, userId) => {
  try {
      const product = await Product.findOne({ _id: productId });
      const productObj = {
          productId: productId,
          quantity: 1,
          total: product.price,
          category: product.category
      };

      const cart = await Cart.findOne({ user: userId });

      if (cart) {
          const productExist = await Cart.findOne({ user: userId, "cartItems.productId": productId });
          if (productExist) {
              await Cart.updateOne(
                  { user: userId, "cartItems.productId": productId },
                  {
                      $inc: {
                          "cartItems.$.quantity": 1,
                          "cartItems.$.total": product.price
                      },
                      $set: {
                          cartTotal: cart.cartTotal + product.price
                      }
                  }
              );
          } else {
              await Cart.updateOne(
                  { user: userId },
                  {
                      $push: { cartItems: productObj },
                      $inc: { cartTotal: product.price }
                  }
              );
          }
      } else {
          const newCart = new Cart({
              user: userId,
              cartItems: productObj,
              cartTotal: product.price,
              category: product.category
          });
          await newCart.save();
      }

      console.log('Cart updated successfully');
      return { status: true };
  } catch (error) {
      console.error('Error in try-catch block:', error);
      throw error;
  }
};



// const addCart = async (productId, userId) => {
//     const product = await Product.findOne({ _id: productId });
//     const productObj = {
//         productId: productId,
//         quantity: 1,
//         total: product.price,
//         category: product.category
//     };

//     try {
//         return new Promise((resolve, reject) => {
//             Cart.findOne({ user: userId }).then(async (cart) => {
//                 if (cart) {
//                     const productExist = await Cart.findOne({ user: userId, "cartItems.productId": productId });
//                     console.log(productExist);
//                     if (productExist) {
//                       Cart.updateOne(
//                         { user: userId, "cartItems.productId": productId },
//                         {
//                           $inc: {
//                             "cartItems.$.quantity": 1,
//                             "cartItems.$.total": product.price
//                           },
//                           $set: {
//                             cartTotal: cart.cartTotal + product.price
//                           }
//                         }
//                         ).then((response) => {
//                             // Log success
//                             console.log('Cart updated successfully');
//                             resolve({ status: true });
//                         }).catch((error) => {
//                             // Log error
//                             console.error('Error updating cart:', error);
//                             reject(error);
//                         });
//                     } else {
//                         Cart.updateOne(
//                             { user: userId },
//                             {
//                                 $push: { cartItems: productObj },
//                                 $inc: { cartTotal: product.price }
//                             }
//                         ).then((response) => {
//                             // Log success
//                             console.log('Cart updated successfully');
//                             resolve({ status: true });
//                         }).catch((error) => {
//                             // Log error
//                             console.error('Error updating cart:', error);
//                             reject(error);
//                         });
//                     }
//                 } else {
//                     const newCart = await Cart({
//                         user: userId,
//                         cartItems: productObj,
//                         cartTotal: product.price,
//                         category: product.category
//                     });
//                     await newCart.save().then((response) => {
//                         // Log success
//                         console.log('New cart created successfully');
//                         resolve({ status: true });
//                     }).catch((error) => {
//                         // Log error
//                         console.log(error)
//                         reject(error);
//                     });
//                 }
//             }).catch((error) => {
//                 // Log error
//                 console.error('Error finding cart:', error);
//                 reject(error);
//             });
//         });
//     } catch (error) {
//         console.log(error.message);
//         // Log error
//         console.error('Error in try-catch block:', error);
//         reject(error);
//     }
// };



const getCartCount = (userId) => {
        return new Promise((resolve, reject) => {
        let count = 0;
        Cart.findOne({ user: userId }).then((cart) => {
            if (cart) {
            count = cart.cartItems.length;
            }
            resolve(count); 
        });
    });
};


const updateQuantity = async(data) => {
    const cartId = data.cartId;
    const proId = data.proId;
    const userId = data.userId;
    const count = data.count;
    const quantity = data.quantity;
    const product = await Product.findOne({_id:proId})
  
    const quantitySingle = await Cart.aggregate([
      { $match: { user: userId.toString() } },
      { $unwind: "$cartItems" },
      { $match: { 'cartItems.productId': new ObjectId(proId) } },
      {$project:{'cartItems.quantity':1}}
  
    ]);
  
  
  
    try {
      return new Promise(async (resolve, reject) => {
        if (count == -1 && quantity == 1) {
        
          Cart.findOneAndUpdate(
            { _id: cartId, "cartItems.productId": proId },
            {
              $pull: { cartItems: { productId: proId } },
              $inc: {cartTotal:product.price * count } 
            },
            { new: true }
          )
          
          .then(() => { 
            resolve({ status: true });
          });
        } else {
            if(product.stock-quantity < 1 && count==1){
              resolve({ status: 'outOfStock' });
  
  
          }else{
            
            Cart.updateOne(
              { _id: cartId, "cartItems.productId": proId },
              {
                $inc: { "cartItems.$.quantity": count ,
                "cartItems.$.total":product.price*count,
                cartTotal:product.price * count
              },
              }
  
            )
        
            
          .then(() => {
              Cart.findOne(
                { _id: cartId, "cartItems.productId": proId },
                { "cartItems.$": 1,cartTotal:1 }
              ).then((cart) => { 
                const newQuantity = cart.cartItems[0].quantity;
                const newSubTotal = cart.cartItems[0].total;
                const cartTotal = cart.cartTotal
                resolve({ status: true, newQuantity: newQuantity,newSubTotal:newSubTotal,cartTotal:cartTotal});
              });
            }); 
  
          }
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  }






  const deleteProduct =  async (data) => {
    const cartId = data.cartId;
    const proId = data.proId;
    const product = await Product.findOne({_id:proId})
    const cart = await Cart.findOne({ _id: cartId, "cartItems.productId": data.proId });
    
    return new Promise((resolve, reject) => {
      try {
        
        const cartItem = cart.cartItems.find(item => item.productId.equals(data.proId));
        const quantityToRemove = cartItem.quantity;
        Cart.updateOne( 
          { _id: cartId ,"cartItems.productId":proId},
          { $inc: {cartTotal: product.price* quantityToRemove * -1 },
          $pull: { cartItems: { productId: proId } },
           }
        ).then(() => {
          resolve({ status: true });
        });
      } catch (error) { 
        throw error;
      }
    });
  }
















    












module.exports={
    addCart,
    getCartCount,
    updateQuantity,
    deleteProduct
}













