const httpStatus = require("http-status").status;
const dashboardRepository = require("../repositories/dashboardRepository");
const {
  userType: userTypeConst,
  designation: designationConst,
  visitStatus: visitStatusConst,
} = require("../constant/constant");

const getStats = async (req) => {
  try {
    const currentUser = req.data;
    const hospitalId = currentUser.hospital?._id;

    if (!hospitalId) {
      return {
        error: true,
        data: {},
        msgCode: "HOSPITAL_NOT_FOUND",
        status: httpStatus.BAD_REQUEST,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateRange = { $gte: today, $lt: tomorrow };

    const isChemist =
      currentUser.userType === userTypeConst.STAFF &&
      currentUser.designation === designationConst.CHEMIST;
    const isDoctor = currentUser.userType === userTypeConst.DOCTOR;

    const [visitCounts, totalPatients, todayPrescriptions, totalPrescriptions, totalStaff] =
      await Promise.all([
        isChemist
          ? Promise.resolve({})
          : dashboardRepository.getVisitCounts({
              hospitalId,
              doctorId: isDoctor ? currentUser._id : null,
              dateRange,
              statuses: [
                visitStatusConst.WAITING,
                visitStatusConst.IN_CONSULTATION,
                visitStatusConst.COMPLETED,
                visitStatusConst.CANCELLED,
              ],
            }),
        dashboardRepository.getTotalPatients(hospitalId),
        dashboardRepository.getPrescriptionCount(hospitalId, dateRange),
        isChemist
          ? dashboardRepository.getTotalPrescriptions(hospitalId)
          : Promise.resolve(0),
        isDoctor
          ? dashboardRepository.getTotalStaff(hospitalId, userTypeConst.STAFF)
          : Promise.resolve(0),
      ]);

    return {
      error: false,
      data: {
        waitingVisits: visitCounts[visitStatusConst.WAITING] ?? 0,
        inConsultationVisits: visitCounts[visitStatusConst.IN_CONSULTATION] ?? 0,
        completedVisits: visitCounts[visitStatusConst.COMPLETED] ?? 0,
        cancelledVisits: visitCounts[visitStatusConst.CANCELLED] ?? 0,
        totalPatients,
        todayPrescriptions,
        totalPrescriptions,
        totalStaff,
      },
      msgCode: "STATS_FETCHED",
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

module.exports = { getStats };
