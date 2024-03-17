const Category = require("../models/Category");

// create tag handler
exports.createCategory= async (req, res) => {
  try {
    // get data from body
    const { name, description } = req.body;

    // validation

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: " All fields are required",
      });
    }

    // create entry in db

    const CategoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategoryDetails);

    //  return  res.

    return res.status(200).json({
      success: true,
      message: "Tag create SuccessFully",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

// getAll category handler
exports.showAllCategory = async (req, res) => {
  try { 
    const allCategory = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "All Tags returned successFully ",
      allCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.categoryPageDetails = async(req,res)=>{
  try {
    // get categoryId
    const {categoryId} = req.body;

    //get course  for specified category
     const selectedCategory = await Category.findById(categoryId) 
                                 .populate("courses")
                                 .exec();
    //validation
    if(!selectedCategory){
    return res.status(404).json({
      success:false,
      message:"Data Not Found",

    })
    }
      //get courses for different categories 
      const differentCategories = Category.find({
        _id:{$ne:categoryId}
        // ne mains not( != )
      }).populate("courses")
    //  get top selling courses -hw
    //return res.
    return res.status(200).json({
success:true,
data:{
  selectedCategory,
  differentCategories,
}
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
    
  }
}