
const User = require("../models/user-model")
const Contacts = require("../models/contact-model");
// get all users

const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
 
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const deleteUserBYId = async(req, res) =>{
try {
  const id = req.params.id;
  await User.deleteOne({ _id: id });
  return res.status(200).json({message:"User Deleted successfully"})
} catch (error) {
  next(error);
}
}
// single user  logic
const getUserById = async(req, res) =>{
try {
  const id = req.params.id;
  const data = await User.findOne({ _id: id},{password:0 })
  return res.status(200).json(data);
} catch (error) {
  next(error);
}
}

// admin update logic
const updateUserId =async(req, res) =>{
try {
  const id = req.params.id;
  const updatedUserData = req.body;

  const updateUser = await User.updateOne({_id:id}, {
    $set: updatedUserData,
  })
  return res.status(200).json(updateUser)
} catch (error) {
  next(error)
}
}


// Get all contacts
const getAllcontacts = async (req, res, next) => {
  try {
    const contacts = await Contacts.find();

    if (!contacts || contacts.length === 0) {
      return res.status(404).json({ message: "No contacts found" });
    }
 

    return res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

//  delect contact 
const deleteContactBYId = async(req, res) =>{
  try {
    
 
  const id = req.params.id;
  await Contacts.deleteOne({ _id: id})
  return res.status(200).json("contact selete successfilly")
 } catch (error) {
    next(error);
  }
}

module.exports = {getAllUser, getAllcontacts,deleteUserBYId,updateUserId,getUserById, deleteContactBYId } ;