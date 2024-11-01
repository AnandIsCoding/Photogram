import validator from "validator";
export function validateSignUpdata(req){
    // fetch all data from request body
    const {userName, email, password} = req.body
    if(!userName || !email || !password ){
        return 'All inputs are required'
    }
    if(userName.length < 3 || userName.length > 15){
        return 'Username should be between 3 and 15 characters'
    }
    if(!validator.isEmail(email)){
        return 'email is not valid '
    }
    if(!validator.isStrongPassword(password)){
        return 'password is not strong enough'
    }
    //return null if all validation passes
    return null
}