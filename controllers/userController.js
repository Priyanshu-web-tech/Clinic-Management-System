import User from '../models/User.js'; // Import User model or adjust the import path accordingly

export const createUser = async (req, res, next) => {
  const {
    name,
    phone,
    email,
    address,
    dob,
    occupation,
    gender,
    maritalStatus,
    hospitalName,
  } = req.body;

  try {
    // Check if user already exists with the same hospital and phone
    const existingUser = await User.findOne({ hospitalName, phone });
    if (existingUser) {
      return res.json({statusCode:400, success: false, message: 'Patient already exists' });
    }

    const newUser = new User({
      name,
      phone,
      email,
      address,
      dob,
      occupation,
      gender,
      maritalStatus,
      hospitalName,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: 'User created' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const { hospitalName } = req.params;

    // Fetch users with a specific hospitalName
    const users = await User.find({ hospitalName: hospitalName });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addToQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Add logic to assign queue number and record queue date
    let nextQueueNumber = 1; // Default to 1 if there are no documents

    // Find the maximum queue number in an optimized way
    const maxQueueUser = await User.findOne({ hospitalName: user.hospitalName })
      .sort({ queueNumber: -1 })
      .select("queueNumber")
      .lean()
      .exec();
    if (maxQueueUser && maxQueueUser.queueNumber) {
      nextQueueNumber = maxQueueUser.queueNumber + 1;
    }

    // Assign the next queue number and record queue date
    user.queueNumber = nextQueueNumber;
    user.queueDates.push(new Date());
    await user.save();

    res
      .status(200)
      .json({ message: "User added to the queue for appointment" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetQueueNumbers = async (req, res) => {
  try {
    const { hospitalName } = req.params;
    const users = await User.find({ hospitalName: hospitalName });
    for (const user of users) {
      user.queueNumber = null; // Reset queue number
      user.medStatus="FULLFILLED"
      await user.save();
    }
    res.status(200).json({ message: "Queue numbers reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const userData = req.body;

  if (!user) {
    return next(errorHandler(404, "User not found!"));
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, userData, {
      new: true,
    });

    const response = {
      acknowledged: true,
      updatedUser,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser=async(req,res,next)=>{
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(errorHandler(404, "User not found!"));
  }

  try {
    await User.findByIdAndDelete(req.params.id);

    const response = {
      acknowledged: true,
      message: "User has been deleted!",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
