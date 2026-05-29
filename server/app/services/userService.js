const httpStatus = require("http-status").status;
const userRepository = require("../repositories/userRepository");
const { generateHash } = require("../utils/password");
const { generatePassword } = require("../utils/helper");
const { sendEmail, emailTypeSubject } = require("../utils/mailer");
const { userType: userTypeConst } = require("../constant/constant");

const getUsers = async (req) => {
  try {
    const { page, pageSize, search, designation } = req.query;
    const currentUser = req.data;

    const filter = {
      isActive: true,
      userType: userTypeConst.STAFF,
    };

    // Hospital-scoped: doctors only see their hospital's users
    if (currentUser.userType === userTypeConst.DOCTOR) {
      filter.hospital = currentUser.hospital?._id;
    }

    if (designation) {
      filter.designation = designation;
    }

    const { users, total } = await userRepository.findUsers({
      filter,
      search,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
    });

    const limit = parseInt(pageSize) || 10;

    return {
      error: false,
      data: {
        data: users,
        total,
        page: parseInt(page) || 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
      msgCode: "USERS_FETCHED",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const createUser = async (req) => {
  try {
    const { firstName, lastName, email, phone, designation } = req.body;
    const currentUser = req.data;

    const existing = await userRepository.findUserByEmail(email);

    const plainPassword = generatePassword();
    const hashedPassword = await generateHash(plainPassword);

    const hospital =
      currentUser.userType === userTypeConst.DOCTOR
        ? currentUser.hospital?._id
        : null;

    if (existing && existing.isActive) {
      const isSameHospital = String(existing.hospital) === String(hospital);
      return {
        error: true,
        data: {},
        msgCode: isSameHospital ? "USER_ALREADY_EXISTS" : "EMAIL_IN_USE_AT_ANOTHER_HOSPITAL",
        status: httpStatus.CONFLICT,
      };
    }

    let savedUser;

    if (existing && !existing.isActive) {
      // Reactivate the soft-deleted user with the new details
      savedUser = await userRepository.updateUserById(existing._id, {
        firstName,
        lastName,
        phone: phone || "",
        designation,
        password: hashedPassword,
        hospital,
        isActive: true,
        loginAttempts: 0,
        lockUntil: null,
      });
    } else {
      savedUser = await userRepository.createUser({
        firstName,
        lastName,
        email,
        phone: phone || "",
        userType: userTypeConst.STAFF,
        designation,
        password: hashedPassword,
        hospital,
        isActive: true,
      });
    }

    // Send welcome email (non-blocking — don't fail user creation if email fails)
    sendEmail(
      email,
      { userName: `${firstName} ${lastName}`, email, password: plainPassword },
      emailTypeSubject.WELCOME_USER,
    ).catch((err) => console.error("Welcome email failed:", err));

    return {
      error: false,
      data: {
        user: {
          _id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          phone: savedUser.phone,
          userType: savedUser.userType,
          designation: savedUser.designation,
          isActive: savedUser.isActive,
          createdAt: savedUser.createdAt,
        },
      },
      msgCode: "USER_CREATED",
      status: httpStatus.CREATED,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const updateUser = async (req) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, designation } = req.body;
    const currentUser = req.data;

    const target = await userRepository.findUserById(id);
    if (!target) {
      return {
        error: true,
        data: {},
        msgCode: "USER_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
      };
    }

    // Hospital-scoped: doctor can only update users in their hospital
    if (
      currentUser.userType === userTypeConst.DOCTOR &&
      String(target.hospital) !== String(currentUser.hospital?._id)
    ) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    const updated = await userRepository.updateUserById(id, {
      firstName,
      lastName,
      phone: phone || "",
      designation,
    });

    return {
      error: false,
      data: { user: updated },
      msgCode: "USER_UPDATED",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const deleteUser = async (req) => {
  try {
    const { id } = req.params;
    const currentUser = req.data;

    if (String(currentUser._id) === String(id)) {
      return {
        error: true,
        data: {},
        msgCode: "CANNOT_DELETE_SELF",
        status: httpStatus.BAD_REQUEST,
      };
    }

    const target = await userRepository.findUserById(id);
    if (!target) {
      return {
        error: true,
        data: {},
        msgCode: "USER_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
      };
    }

    if (target.userType === userTypeConst.DOCTOR) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    // Hospital-scoped: doctor can only delete users in their hospital
    if (
      currentUser.userType === userTypeConst.DOCTOR &&
      String(target.hospital) !== String(currentUser.hospital?._id)
    ) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    await userRepository.updateUserById(id, { isActive: false });

    return {
      error: false,
      data: {},
      msgCode: "USER_DELETED",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
