const isLogin= async(req,res,next)=>{
    try {

        if(req.session.admin_id){
            next();
        }
        else{
            res.redirect('/admin');
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout= async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/home')
        }else{
            next()
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}
const is_admin= async(req,res,next)=>{
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


const isLogin1 = async (req, res, next) => {
    try {
      if (req.session.admin_id) {
        // If admin is logged in, redirect to a different page
        return res.redirect('/admin/home')// Change '/dashboard' to your desired destination
      } else {
        // If not logged in, continue with the normal flow
        return next();
      }
    } catch (error) {
      console.log(error.message);
    }
  }

module.exports={
    isLogin,
    isLogout,
    is_admin,
    isLogin1
}