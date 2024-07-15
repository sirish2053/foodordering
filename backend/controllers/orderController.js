import orderModel from "../models/orderModel.js";
import Stripe from "stripe"
import userModel from "../models/userModel.js";

const stripe =new Stripe(process.env.STRIPE_SECRET_KEY)

//placing user order for frontend

const placeOrder = async (req,res) =>{
    const frontend_url = "http://localhost:5173"

    try{
        const newOrder = new orderModel({        
            userId:req.body.userId, //creating new order
            items:req.body.items,
            amount: req.body.amount,
            address:req.body.address,

        })
        await newOrder.save();//save order in our database
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});//when user place order we have to clear cart

        //payment link using strip which is necessary for strip payment
        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency:"NRP",
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100*132
            },
            quantity:item.quantity
        }))
        //for creating delivery charges
        line_items.push({
            price_data:{
                currency:"NRP",
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount:2*100*132
            },
            quantity:1
        })
        //creating session variable in session to get payment success and cancel

        const session =await stripe.checkout.session.create({
            line_items:line_items,
            mode:'payment',
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,

        })
        res.json({success:true,session_url:session.url})


    }catch (error){
        console.log(error);
        res.json({success:false,message:"error"})

    }

}
const verifyOrder = async(req,res)=>{
    const {orderId,success}= req.body;
    try{
        if(success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not paid"})
        }
    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }

}

//user order for frontend
const userOrders= async(req,res)=>{
    try{
        const orders= await orderModel.find({userId:req.body.userId});
        res.json({success:true,data:orders})

    } catch (error){
        console.log(error);
        res.json({success:false,message:"error"})
    }

}
//listing order for admin panel
const listOrders=async(req,res)=>{
    try{
        const orders= await orderModel.find({});
        res.json({success:true,data:orders})

    } catch (error){
        console.log(error);
        res.json({success:false,message:"Error"})

    }

}
//api for updating order status
const updateStatus= async (req,res)=>{
    try{

        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"status Updated"})
    } catch (error){
        console.log(error);
        res.json({success:false,message:"Error"})

    }

}


export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}