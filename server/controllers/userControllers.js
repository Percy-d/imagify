import { createUser, findUserByEmail, findUserById, updateUserById, createTransaction, findTransactionById, updateTransactionById } from '../models/firestoreModels.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import razorpay from 'razorpay';

export const registerUser = async(req , res) => {
    try{
        const{name, email , password} = req.body;

        if(!name || !email || !password){
            return res.json({success:false, message: 'Missing Details'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name, 
            email , 
            password: hashedPassword
        }

        const user = await createUser(userData);

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET)

        res.json({success: true, token, user: {name:user.name}})

    }catch(error){
        console.log(error);
        res.json({
            success:false, message : error.message
        })
    }
}

export const loginUser = async (req, res)=>{
    try{
        const {email, password} = req.body;
        const user = await findUserByEmail(email);

        if(!user){
            return res.json ({success: false, message: 'User does not exist'})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch){
            const token = jwt.sign({id: user.id}, process.env.JWT_SECRET)
            res.json({success: true, token, user: {name:user.name}})           
        }else{
            return res.json ({success: false, message: 'Invalid credentials'})
        }
    }catch(error){
        console.log(error);
        res.json({
            success:false, message : error.message + "login api error"
        })
    }
}

export const userCredits = async (req, res)=>{
    try{
        const {userId} = req.body;

        const user = await findUserById(userId);
        res.json({success: true, credits: user.creditBalance, user:{name:user.name}})

    }catch(error){
        console.log(error);
        res.json({
            success:false, message : 'credit api error'
        })
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

export const paymentRazorpay = async(req,res)=>{
    try{

        const {userId, planId} = req.body
        const userData = await findUserById(userId)

        if(!userId || !planId){
            return res.json({
                success:false, message : "Missing Details"
            })    
        }

        let credits, plan , amount , date

        switch (planId) {
            case 'Basic':
                plan = 'Baisc'
                credits = 100
                amount = 10
                break;

            case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 50
                break;

            case 'Business':
                plan = 'Business'
                credits = 5000
                amount = 250
                break;            

            default:
                res.json({
                    success:false, message : "Plan not found"
                })   
                break;
        }

        date = Date.now();

        const transactionData = {
            userId, plan, amount , credits,date
        }
        const newTransaction = await createTransaction(transactionData)

        const options = {
            amount: amount * 100,
            currency: process.env.CURRENCY,
            receipt: newTransaction.id
        }

        await razorpayInstance.orders.create(options, (error, order)=>{
            if(error){
                console.log(error)
                res.json({
                    success:false, message : error.message
                })  
            }
            res.json({success: true, order})
        })
    }catch(error){
        console.log(error)
        res.json({
            success:false, message : error.message
        })    
    }
}

export const verifyRazorpay = async(req,res)=>{
    try{

        const {razorpay_order_id} = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if(orderInfo.status === 'paid' ){
            const transactionData = await findTransactionById(orderInfo.receipt)
            if(transactionData.payment){
                return res.json({success: false, message: 'Payment failed'})
            }

            const userData = await findUserById(transactionData.userId)

            const creditBalance = userData.creditBalance + transactionData.credits;
            await updateUserById(userData.id, {creditBalance});

            await updateTransactionById(transactionData.id, {payment: true})

            res.json({success: true, message: "Credits Added"})
        }else{
            res.json({
                success:false, message : "Paymennt failed"
            })
        }
    }catch(error){
        console.log(error)
        res.json({
            success:false, message : error.message
        })
    }
}