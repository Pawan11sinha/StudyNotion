const Category=require("../models/Category");

// create tag ka handler funstion
exports.createCategory=async(req,res)=>{
    try {
        // fetch data
        const {name,description}=req.body;
        // validation
        if(!name||!description){
            return res.status(400).json({
                success:false,
                messgage:"all fiels are required"
            })
        }
        // create entry in db 
        const CategoryDetails =await Category.create({
            name:name,
            description:description,
        });
        console.log(CategoryDetails);
        // return response
        return res.status(200).json({
            success:true,
            message:"tags created successfully "
        })



        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.showAllCategory= async(req,res)=>{
    try {
        const allCategory=await Category.find({},{name:true,description:true});
        // true krne k mtlb ye dono rhega tag mei toh hi dena do tag
        res.status(200).json({
            success:true,
            messgage:"all tags returned successfully ",
            allCategory
        })
    } catch (error) {
        return res.status().json({
            success:false,
            message:error.message
        })
        
    }
}