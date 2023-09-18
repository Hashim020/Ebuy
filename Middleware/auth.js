const isLogin= async(req,res,next)=>{
    try {

        if(req.session.user_id){
            next();
        }
        else{
           return res.redirect('/');
            
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout= async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/')
        }else{
            next();
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}

const requireSignIn= async(req, res, next) =>{
    if (req.session.user_id) {
        // User is signed in, continue with the request
        next();
    } else {
        // User is not signed in, redirect to login page or take other action
        res.redirect('/login'); // Replace '/login' with the desired URL
    }
}




module.exports={
    isLogin,
    isLogout,
    requireSignIn

}