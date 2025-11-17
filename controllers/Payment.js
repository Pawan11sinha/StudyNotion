const {instance}=require("../config/razorpay");
const Course=require("...models/Course");
const User =require("../models/User");
const mailSender=require("../utils/mailSender");
const {courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");
const { useActionState } = require("react");
const { response } = require("express");


// capture the payment and initiate the razorpay order

exports.capturePayment=async(req,res)=>{
    // get courseId and UserId
    const {course_id}=req.body;
    const userId=req.user.id;

    // validation
    // valid courseId yha pe dekhe ki coursedetails aaya hi na ho req.body se
    if(!course_id){
        return res.json({
            success:false,
            message:"please provide valid course ID"
        })
    };
    // valid course details
    // iss id sei jo coursedetails aarhi h wo valid h ya nhi 
        let course;
        try {
            course=await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    message:"could not find the course",
                });
            }


    // user already pay for the same sourse
    // yha pe user id string hai uid mei convert krdiye jo ki object id hai 
    // course mei obj id mei stored kiye h aur req body sei id string k form mei h toh convert krna pdega usko obj id mei
    const uid=new mongoose.Types.objectId(userId);
    if(course.studentsEnrolled.include(uid)){
        return res.status(200).json({
            success:false,
            message:"student is already enrolled"
        })
    }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                    success:false,
                    message:error.message,
            })
        
        }

    // order create
    const amount=course.price;
    const currency="INR";


    const options={
        amount:amount*100,
        currency,
        reciept:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    };

    try {
        // intiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        // return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:"could not initiate order"
        })
    }

    // return response

};

// verify signature of razorpay

exports.verifySignature=async(req,res)=>{
    const webHookSecret="1234567";

    const signature=req.headers("x-razorpay-signature");

    // yha pe mai webhooksecret ko 3step sei cross kr k hashed krlunga phir signature se match krunga kyunki signature ko decrypt nhi kr skte
    // HMAC hashed based message authentication code
    // SHA secure hashing algorithm 

   const shasum= crypto.createHmac("sha256",webHookSecret);
   shasum.update(JSON.stringify(req.body));
   const digest =shasum.digest("digest");


   if(signature==digest){
    console.log("Payment is Authorized") 
// ye coursezid aur userId razorpay bhej rha 
const {courseId,userId}=req.body.payload.payment.entity.notes;

        try {
            // fulfill the action
            // find the course and enroll the student in it
            const enrolledCourse=await Course.findOneAndUpdate(
                                                {_id:courseId},
                                                {$oush:{studentsEnrolled:userId}},
                                                {new:true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"course not found"
                });
            }


            console.log(enrolledCourse);
            // find the student and add the course in their list enrolled course me
            const enrolledStudent=await User.findOneAndUpdate(
                                                            {_id:userId},
                                                            {$push:{courses:courseId}},
                                                            {new:true},
            );
            console.log(enrolledStudent);
            // mail send krdo confirmation wala 
            const emailResponse=await mailSender(
                                    enrolledCourse.email,
                                    "congratulation from codehelp",
                                    "congratulation you are onboarded into new codehelp course",

            );
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"signature verified and course added"
            })

        } catch (error) {
            return res.status(500).json({
                success:false,
                message:error.message
            });
        }

   }
   else{
    return res.status(400).json({
        success:false,
        message:""
    })
   }

//    yha pe userid course id razorpay se aarhi na ki frontend se



};